"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import { createClient } from "@/lib/supabase/client"
import ConversationsSidebar from "@/app/messages/ConversationsSidebar"
import type { RealtimeChannel } from "@supabase/supabase-js"

type Message = {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  read_at: string | null
  created_at: string
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

function relativeTime(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return "À l'instant"
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
}

export default function ThreadClient({
  convId, currentUserId, interlocutor, listingTitle, listingType, listingId, initialMessages,
}: Props) {
  const sbRef = useRef(createClient())
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [content, setContent] = useState("")
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Mark received messages as read — fire-and-forget, never blocks rendering
  useEffect(() => {
    const unread = initialMessages.filter((m) => m.sender_id !== currentUserId && !m.read_at)
    if (unread.length === 0) return

    const ids = unread.map((m) => m.id)
    const now = new Date().toISOString()

    setMessages((prev) => prev.map((m) => ids.includes(m.id) ? { ...m, read_at: now } : m))

    sbRef.current
      .from("messages")
      .update({ read_at: now })
      .in("id", ids)
      .then(({ error }) => {
        if (error) console.error("[thread] markRead DB error:", error)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Realtime subscription — created once, cleaned up on unmount
  useEffect(() => {
    const sb = sbRef.current
    channelRef.current = sb
      .channel(`conv-${convId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${convId}` },
        (payload) => {
          const msg = payload.new as Message
          setMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : [...prev, msg])
          if (msg.sender_id !== currentUserId) {
            const now = new Date().toISOString()
            setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, read_at: now } : m))
            sb.from("messages")
              .update({ read_at: now })
              .eq("id", msg.id)
              .then(({ error }) => {
                if (error) console.error("[thread] realtime markRead error:", error)
              })
          }
        }
      )
      .subscribe((status, err) => {
        if (err) console.error("[thread] realtime subscription error:", err)
      })

    return () => {
      if (channelRef.current) sb.removeChannel(channelRef.current)
    }
  // convId and currentUserId are stable props — no risk of re-run
  }, [convId, currentUserId])

  const sendMessage = async () => {
    const text = content.trim()
    if (!text || sending) return
    setContent("")
    setSending(true)
    try {
      const { data, error } = await sbRef.current
        .from("messages")
        .insert({
          conversation_id: convId,
          sender_id: currentUserId,
          content: text,
        })
        .select("id, conversation_id, sender_id, content, read_at, created_at")
        .single()

      if (error) {
        console.error("[thread] sendMessage error:", error)
      } else if (data) {
        // Add immediately; Realtime echo is deduplicated by id
        setMessages((prev) => prev.some((m) => m.id === data.id) ? prev : [...prev, data])
      }
    } catch (e) {
      console.error("[thread] sendMessage unexpected error:", e)
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const otherName = interlocutor.full_name ?? "Interlocuteur"
  const otherInitials = otherName.trim().split(/\s+/).map((n) => n[0]).join("").toUpperCase().slice(0, 2)
  const listingHref = listingType === "service" ? `/services/${listingId}` : `/products/${listingId}`

  return (
    <>
      <Navbar />
      <div className="flex" style={{ height: "calc(100vh - 70px)" }}>

        {/* Sidebar — desktop only */}
        <div className="hidden lg:flex lg:w-80 xl:w-[360px] flex-col border-r border-[var(--border-subtle)] bg-[var(--white)] shrink-0 overflow-hidden">
          <ConversationsSidebar activeConvId={convId} />
        </div>

        {/* Thread */}
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

          {/* Messages */}
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
                    <div className="max-w-[65%]">
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                        isMine
                          ? "bg-[var(--orange)] text-white rounded-br-sm"
                          : "bg-[var(--white)] text-[var(--ink)] border border-[var(--border-subtle)] rounded-bl-sm"
                      }`}>
                        {msg.content}
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

          {/* Input */}
          <div className="bg-[var(--white)] border-t border-[var(--border-subtle)] px-4 py-3 shrink-0">
            <div className="flex items-end gap-3">
              <textarea
                ref={inputRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Écrivez un message…"
                rows={1}
                className="flex-1 resize-none px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--cream)] text-[var(--ink)] text-sm outline-none focus:border-[var(--orange)] focus:ring-2 focus:ring-[var(--orange)]/20 transition-all placeholder-gray-400 overflow-y-auto"
                style={{ minHeight: "42px", maxHeight: "128px" }}
              />
              <button
                onClick={sendMessage}
                disabled={!content.trim() || sending}
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
            <p className="text-[10px] text-gray-400 mt-1.5">Entrée pour envoyer · Maj+Entrée pour une nouvelle ligne</p>
          </div>

        </div>
      </div>
    </>
  )
}
