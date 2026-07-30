"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import { createClient } from "@/lib/supabase/client"
import ConversationsSidebar from "@/app/messages/ConversationsSidebar"
import { prepareAttachment } from "@/lib/compress-attachment"
import type { CompressResult } from "@/lib/compress-attachment"
import type { RealtimeChannel } from "@supabase/supabase-js"

type Message = {
  id: string
  conversation_id: string
  sender_id: string
  content: string | null
  read_at: string | null
  created_at: string
  attachment_path: string | null
  attachment_type: string | null
  attachment_name: string | null
  attachment_size: number | null
  attachment_width: number | null
  attachment_height: number | null
}

type Profile = {
  id: string
  full_name: string | null
  avatar_url: string | null
}

interface Props {
  convId: string
  currentUserId: string
  interlocutor: Profile
  listingTitle: string
  listingType: string
  listingId: string
  initialMessages: Message[]
}

const QUOTA_BYTES = 50 * 1024 * 1024

function relativeTime(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return "À l'instant"
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
}

function formatBytes(n: number | null): string {
  if (!n) return ""
  if (n < 1024) return `${n} o`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} Ko`
  return `${(n / 1024 / 1024).toFixed(1)} Mo`
}

export default function ThreadClient({
  convId,
  currentUserId,
  interlocutor,
  listingTitle,
  listingType,
  listingId,
  initialMessages,
}: Props) {
  const sbRef = useRef(createClient())
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [content, setContent] = useState("")
  const [sending, setSending] = useState(false)

  // Attachment compose state
  const [pendingAttachment, setPendingAttachment] = useState<CompressResult | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [compressing, setCompressing] = useState(false)
  const [attachError, setAttachError] = useState<string | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)

  // Signed URLs for received messages
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({})
  const fetchedPathsRef = useRef<Set<string>>(new Set())

  // Lightbox
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

  const bottomRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // ── mark received messages as read (fire-and-forget) ──────────────────────
  useEffect(() => {
    const unread = initialMessages.filter(
      (m) => m.sender_id !== currentUserId && !m.read_at
    )
    if (unread.length === 0) return
    const ids = unread.map((m) => m.id)
    const now = new Date().toISOString()
    setMessages((prev) =>
      prev.map((m) => (ids.includes(m.id) ? { ...m, read_at: now } : m))
    )
    sbRef.current
      .from("messages")
      .update({ read_at: now })
      .in("id", ids)
      .then(({ error }) => {
        if (error) console.error("[thread] markRead error:", error)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Realtime subscription ─────────────────────────────────────────────────
  useEffect(() => {
    const sb = sbRef.current
    channelRef.current = sb
      .channel(`conv-${convId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${convId}`,
        },
        (payload) => {
          const msg = payload.new as Message
          setMessages((prev) =>
            prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]
          )
          if (msg.sender_id !== currentUserId) {
            const now = new Date().toISOString()
            setMessages((prev) =>
              prev.map((m) => (m.id === msg.id ? { ...m, read_at: now } : m))
            )
            sb.from("messages")
              .update({ read_at: now })
              .eq("id", msg.id)
              .then(({ error }) => {
                if (error) console.error("[thread] realtime markRead error:", error)
              })
          }
        }
      )
      .subscribe((_, err) => {
        if (err) console.error("[thread] realtime error:", err)
      })
    return () => {
      if (channelRef.current) sb.removeChannel(channelRef.current)
    }
  }, [convId, currentUserId])

  // ── fetch signed URLs for attachment messages ─────────────────────────────
  useEffect(() => {
    const toFetch = messages.filter(
      (m) => m.attachment_path && !fetchedPathsRef.current.has(m.attachment_path)
    )
    if (toFetch.length === 0) return
    for (const m of toFetch) fetchedPathsRef.current.add(m.attachment_path!)
    Promise.all(
      toFetch.map((m) =>
        sbRef.current.storage
          .from("message-attachments")
          .createSignedUrl(m.attachment_path!, 3600)
          .then(({ data, error }) => {
            if (error) console.error("[thread] signed URL error:", error)
            return data ? { path: m.attachment_path!, url: data.signedUrl } : null
          })
      )
    ).then((results) => {
      const newUrls: Record<string, string> = {}
      for (const r of results) {
        if (r) newUrls[r.path] = r.url
      }
      if (Object.keys(newUrls).length > 0) {
        setSignedUrls((prev) => ({ ...prev, ...newUrls }))
      }
    })
  }, [messages])

  // ── manage preview URL lifecycle ──────────────────────────────────────────
  useEffect(() => {
    if (!pendingAttachment) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(pendingAttachment.blob)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [pendingAttachment])

  // ── close lightbox on Escape ──────────────────────────────────────────────
  useEffect(() => {
    if (!lightboxSrc) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxSrc(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [lightboxSrc])

  // ── file selection + compression ──────────────────────────────────────────
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    setAttachError(null)
    setSendError(null)
    setCompressing(true)
    setPendingAttachment(null)
    try {
      const result = await prepareAttachment(file)
      setPendingAttachment(result)
    } catch (err) {
      setAttachError(err instanceof Error ? err.message : "Erreur inconnue")
    } finally {
      setCompressing(false)
    }
  }

  const removeAttachment = () => {
    setPendingAttachment(null)
    setAttachError(null)
  }

  // ── send ──────────────────────────────────────────────────────────────────
  const sendMessage = async () => {
    const text = content.trim()
    if ((!text && !pendingAttachment) || sending || compressing) return
    setSendError(null)
    setSending(true)
    let uploadedPath: string | null = null

    try {
      const attachmentFields: Partial<Message> = {}

      if (pendingAttachment) {
        // Quota check
        const { data: usageData } = await sbRef.current
          .from("messages")
          .select("attachment_size")
          .eq("sender_id", currentUserId)
          .not("attachment_size", "is", null)

        const usedBytes = (
          usageData as { attachment_size: number | null }[] | null ?? []
        ).reduce((sum, m) => sum + (m.attachment_size ?? 0), 0)

        if (usedBytes + pendingAttachment.size > QUOTA_BYTES) {
          throw new Error(
            `Limite de stockage atteinte (50 Mo). Utilisé : ${(usedBytes / 1024 / 1024).toFixed(1)} Mo.`
          )
        }

        // Upload
        const pathId = crypto.randomUUID()
        const path = `${convId}/${pathId}/${pendingAttachment.name}`

        const { error: upErr } = await sbRef.current.storage
          .from("message-attachments")
          .upload(path, pendingAttachment.blob, {
            contentType: pendingAttachment.mimeType,
          })
        if (upErr) throw new Error(`Upload échoué : ${upErr.message}`)
        uploadedPath = path

        // Preload blob URL so sender sees the image immediately
        const blobUrl = URL.createObjectURL(pendingAttachment.blob)
        fetchedPathsRef.current.add(path)
        setSignedUrls((prev) => ({ ...prev, [path]: blobUrl }))

        Object.assign(attachmentFields, {
          attachment_path: path,
          attachment_type: pendingAttachment.mimeType,
          attachment_name: pendingAttachment.name,
          attachment_size: pendingAttachment.size,
          attachment_width: pendingAttachment.width,
          attachment_height: pendingAttachment.height,
        })
      }

      const { data, error } = await sbRef.current
        .from("messages")
        .insert({
          conversation_id: convId,
          sender_id: currentUserId,
          content: text || null,
          ...attachmentFields,
        })
        .select("id, conversation_id, sender_id, content, read_at, created_at, attachment_path, attachment_type, attachment_name, attachment_size, attachment_width, attachment_height")
        .single()

      if (error) {
        // Rollback: remove uploaded file to avoid orphans
        if (uploadedPath) {
          sbRef.current.storage
            .from("message-attachments")
            .remove([uploadedPath])
            .then(({ error: rmErr }) => {
              if (rmErr) console.error("[thread] rollback remove error:", rmErr)
            })
        }
        throw new Error(`Envoi échoué : ${error.message}`)
      }

      if (data) {
        setMessages((prev) =>
          prev.some((m) => m.id === data.id) ? prev : [...prev, data as Message]
        )
        setContent("")
        setPendingAttachment(null)
      }
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Erreur inattendue")
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const canSend =
    (content.trim().length > 0 || !!pendingAttachment) && !sending && !compressing

  const otherName = interlocutor.full_name ?? "Interlocuteur"
  const otherInitials = otherName
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
  const listingHref =
    listingType === "service" ? `/services/${listingId}` : `/products/${listingId}`

  return (
    <>
      <Navbar />

      {/* ── Lightbox ──────────────────────────────────────────────────────── */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.88)" }}
          onClick={() => setLightboxSrc(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxSrc}
            alt="Aperçu en plein écran"
            className="max-w-full max-h-full object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
            style={{ background: "rgba(0,0,0,0.55)" }}
            onClick={() => setLightboxSrc(null)}
            aria-label="Fermer"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="flex" style={{ height: "calc(100vh - 70px)" }}>

        {/* ── Sidebar (desktop) ──────────────────────────────────────────── */}
        <div className="hidden lg:flex lg:w-80 xl:w-[360px] flex-col border-r border-[var(--border-subtle)] bg-[var(--white)] shrink-0 overflow-hidden">
          <ConversationsSidebar activeConvId={convId} />
        </div>

        {/* ── Thread ────────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Header */}
          <div className="bg-[var(--white)] border-b border-[var(--border-subtle)] px-4 py-3 flex items-center gap-3 shrink-0">
            <Link href="/messages" className="lg:hidden text-gray-400 hover:text-[var(--ink)] transition-colors p-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div className="w-9 h-9 rounded-full overflow-hidden bg-[var(--orange)] flex items-center justify-center shrink-0">
              {interlocutor.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={interlocutor.avatar_url} alt={otherName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-xs font-bold">{otherInitials}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[var(--ink)] truncate">{otherName}</p>
              <Link href={listingHref} className="text-xs text-[var(--orange)] hover:underline truncate block">
                {listingTitle}
              </Link>
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[var(--cream)]">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-12 h-12 bg-[var(--white)] border border-[var(--border-subtle)] rounded-2xl flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">Démarrez la conversation</p>
                <p className="text-xs text-gray-400 mt-1">Envoyez un message à {otherName}</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMine = msg.sender_id === currentUserId
                const isImage = !!msg.attachment_type?.startsWith("image/")
                const isPdf = msg.attachment_type === "application/pdf"
                const hasAttachment = !!msg.attachment_path
                const hasText = !!msg.content
                const signedUrl = msg.attachment_path
                  ? (signedUrls[msg.attachment_path] ?? null)
                  : null

                return (
                  <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    {!isMine && (
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-[var(--orange)] flex items-center justify-center mr-2 mt-0.5 shrink-0">
                        {interlocutor.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={interlocutor.avatar_url} alt={otherName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white text-[10px] font-bold">{otherInitials}</span>
                        )}
                      </div>
                    )}

                    <div className="max-w-[75%] sm:max-w-[65%]">
                      <div className={`rounded-2xl overflow-hidden text-sm ${
                        isMine
                          ? "bg-[var(--orange)] text-white rounded-br-sm"
                          : "bg-[var(--white)] text-[var(--ink)] border border-[var(--border-subtle)] rounded-bl-sm"
                      }`}>

                        {/* Image */}
                        {hasAttachment && isImage && (
                          <div
                            className={`relative overflow-hidden ${signedUrl ? "cursor-zoom-in" : ""}`}
                            style={{
                              width: "min(300px, 65vw)",
                              aspectRatio:
                                msg.attachment_width && msg.attachment_height
                                  ? `${msg.attachment_width} / ${msg.attachment_height}`
                                  : "4 / 3",
                            }}
                            onClick={() => signedUrl && setLightboxSrc(signedUrl)}
                          >
                            {signedUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={signedUrl}
                                alt={msg.attachment_name ?? "Image"}
                                loading="lazy"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-[var(--surface-3)]">
                                <div className="w-5 h-5 border-2 border-[var(--ink-60)] border-t-transparent rounded-full animate-spin" />
                              </div>
                            )}
                          </div>
                        )}

                        {/* PDF card */}
                        {hasAttachment && isPdf && (
                          <div className="px-3 py-2.5 flex items-center gap-2.5 min-w-[220px]">
                            <div className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center"
                              style={{ background: isMine ? "rgba(255,255,255,0.18)" : "var(--orange-soft)" }}>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                style={{ color: isMine ? "white" : "var(--orange)" }}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold truncate leading-tight">{msg.attachment_name}</p>
                              <p className="text-[10px] mt-0.5" style={{ opacity: 0.65 }}>{formatBytes(msg.attachment_size)}</p>
                            </div>
                            {signedUrl ? (
                              <a
                                href={signedUrl}
                                download={msg.attachment_name ?? "document.pdf"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-opacity"
                                style={{ opacity: 0.75 }}
                                onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                                onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.75")}
                                onClick={(e) => e.stopPropagation()}
                                aria-label="Télécharger"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                              </a>
                            ) : (
                              <div className="w-8 h-8 flex items-center justify-center shrink-0">
                                <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                                  style={{ borderColor: isMine ? "rgba(255,255,255,0.5)" : "var(--border-strong)", borderTopColor: "transparent" }} />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Text */}
                        {hasText && (
                          <div className={`px-4 py-2.5 leading-relaxed whitespace-pre-wrap ${
                            hasAttachment
                              ? isMine
                                ? "border-t border-white/20"
                                : "border-t border-[var(--border-subtle)]"
                              : ""
                          }`}>
                            {msg.content}
                          </div>
                        )}
                      </div>

                      <p className={`text-[10px] text-gray-400 mt-1 ${isMine ? "text-right" : "text-left"}`}>
                        {relativeTime(msg.created_at)}
                        {isMine && msg.read_at && " · Lu"}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* ── Input area ──────────────────────────────────────────────── */}
          <div className="bg-[var(--white)] border-t border-[var(--border-subtle)] px-4 py-3 shrink-0">

            {/* Attachment preview / compressing indicator */}
            {(compressing || pendingAttachment || attachError) && (
              <div className="mb-2.5">
                {compressing && (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--cream)]">
                    <div className="w-4 h-4 border-2 border-[var(--orange)] border-t-transparent rounded-full animate-spin shrink-0" />
                    <span className="text-xs text-[var(--ink-60)]">Compression en cours…</span>
                  </div>
                )}

                {pendingAttachment && !compressing && (
                  <div className="flex items-center gap-2 px-2 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--cream)]">
                    {pendingAttachment.mimeType.startsWith("image/") ? (
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-[var(--surface-3)]">
                        {previewUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={previewUrl} alt="Aperçu" className="w-full h-full object-cover" />
                        )}
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-[var(--orange-soft)] flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6 text-[var(--orange)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[var(--ink)] truncate">
                        {pendingAttachment.name}
                      </p>
                      <p className="text-[10px] text-[var(--ink-60)]">
                        {formatBytes(pendingAttachment.size)}
                      </p>
                    </div>
                    <button
                      onClick={removeAttachment}
                      className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--border-subtle)]"
                      style={{ background: "var(--border-strong)" }}
                      aria-label="Retirer le fichier"
                    >
                      <svg className="w-3.5 h-3.5 text-[var(--ink)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                {attachError && (
                  <p className="text-xs text-red-500 mt-1.5 px-1">{attachError}</p>
                )}
              </div>
            )}

            {/* Send error */}
            {sendError && (
              <div className="mb-2.5 px-3 py-2 rounded-xl border border-red-200 bg-[var(--cream)]">
                <p className="text-xs text-red-500">{sendError}</p>
              </div>
            )}

            <div className="flex items-end gap-2">
              {/* Paperclip */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={sending || compressing}
                className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--cream)] text-[var(--ink-60)] hover:text-[var(--orange)] hover:border-[var(--orange)]/40 transition-colors disabled:opacity-40"
                aria-label="Joindre un fichier"
              >
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                className="hidden"
                onChange={handleFileSelect}
              />

              <textarea
                ref={inputRef}
                value={content}
                onChange={(e) => { setContent(e.target.value); setSendError(null) }}
                onKeyDown={handleKeyDown}
                placeholder="Écrivez un message…"
                rows={1}
                className="flex-1 resize-none px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--cream)] text-[var(--ink)] text-sm outline-none focus:border-[var(--orange)] focus:ring-2 focus:ring-[var(--orange)]/20 transition-all placeholder-gray-400 overflow-y-auto"
                style={{ minHeight: "42px", maxHeight: "128px" }}
              />

              <button
                onClick={sendMessage}
                disabled={!canSend}
                className="w-10 h-10 bg-[var(--orange)] text-white rounded-xl flex items-center justify-center hover:bg-[var(--orange-dark)] transition-colors disabled:opacity-40 shrink-0"
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>

            <p className="text-[10px] text-gray-400 mt-1.5">
              Entrée pour envoyer · Maj+Entrée pour une nouvelle ligne
            </p>
          </div>

        </div>
      </div>
    </>
  )
}
