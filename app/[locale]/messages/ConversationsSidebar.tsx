"use client"

import { useState, useEffect, useRef } from "react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

type ConvRow = {
  id: string
  buyer_id: string
  seller_id: string
  last_message_at: string
}

type ProfileRow = {
  id: string
  full_name: string | null
  avatar_url: string | null
}

type MsgRow = {
  id: string
  conversation_id: string
  content: string | null
  attachment_type: string | null
  listing_type: string | null
  created_at: string
  sender_id: string
}

type SidebarConv = {
  id: string
  interlocutor: ProfileRow
  lastMessage: MsgRow | null
  unread: number
  last_message_at: string
}

function getInitials(name: string | null) {
  return (name || "?").trim().split(/\s+/).map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

export default function ConversationsSidebar({ activeConvId }: { activeConvId: string }) {
  const t = useTranslations("messages")
  const sbRef = useRef(createClient())
  const [convs, setConvs] = useState<SidebarConv[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  const relativeTime = (d: string) => {
    const diff = Date.now() - new Date(d).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return t("relativeTime.now")
    if (m < 60) return t("relativeTime.min", { n: m })
    const h = Math.floor(m / 60)
    if (h < 24) return t("relativeTime.hours", { n: h })
    const days = Math.floor(h / 24)
    if (days === 1) return t("relativeTime.yesterday")
    if (days < 7) return t("relativeTime.daysAgo", { n: days })
    return new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short" })
  }

  useEffect(() => {
    const sb = sbRef.current
    const load = async () => {
      try {
        const { data: { user } } = await sb.auth.getUser()
        if (!user) { setLoading(false); return }
        setUserId(user.id)

        const { data: rawConvs, error: convsErr } = await sb
          .from("conversations")
          .select("id, buyer_id, seller_id, last_message_at")
          .order("last_message_at", { ascending: false })

        if (convsErr) {
          console.error("[sidebar] conversations error:", convsErr)
          setLoading(false)
          return
        }
        if (!rawConvs || rawConvs.length === 0) { setLoading(false); return }

        const profileIds = [...new Set([
          ...rawConvs.map((c: ConvRow) => c.buyer_id),
          ...rawConvs.map((c: ConvRow) => c.seller_id),
        ])]
        const convIds = rawConvs.map((c: ConvRow) => c.id)

        const [profilesRes, lastMsgsRes, unreadRes] = await Promise.all([
          sb.from("profiles").select("id, full_name, avatar_url").in("id", profileIds),
          sb.from("messages").select("id, conversation_id, content, attachment_type, listing_type, created_at, sender_id")
            .in("conversation_id", convIds).order("created_at", { ascending: false }),
          sb.from("messages").select("conversation_id")
            .in("conversation_id", convIds).is("read_at", null).neq("sender_id", user.id),
        ])

        if (lastMsgsRes.error) console.error("[sidebar] lastMsgs error:", lastMsgsRes.error)
        if (unreadRes.error) console.error("[sidebar] unread error:", unreadRes.error)
        if (profilesRes.error) console.error("[sidebar] profiles error:", profilesRes.error)

        const profileMap: Record<string, ProfileRow> = {}
        for (const p of (profilesRes.data ?? []) as ProfileRow[]) profileMap[p.id] = p

        const lastMsgByConv: Record<string, MsgRow> = {}
        for (const m of (lastMsgsRes.data ?? []) as MsgRow[]) {
          if (!lastMsgByConv[m.conversation_id]) lastMsgByConv[m.conversation_id] = m
        }

        const unreadByConv: Record<string, number> = {}
        for (const m of (unreadRes.data ?? []) as { conversation_id: string }[]) {
          unreadByConv[m.conversation_id] = (unreadByConv[m.conversation_id] ?? 0) + 1
        }

        const display: SidebarConv[] = (rawConvs as ConvRow[]).map((c) => {
          const interlocutorId = c.buyer_id === user.id ? c.seller_id : c.buyer_id
          return {
            id: c.id,
            interlocutor: profileMap[interlocutorId] ?? { id: interlocutorId, full_name: null, avatar_url: null },
            lastMessage: lastMsgByConv[c.id] ?? null,
            unread: unreadByConv[c.id] ?? 0,
            last_message_at: c.last_message_at,
          }
        })

        setConvs(display)
        setLoading(false)
      } catch (e) {
        console.error("[sidebar] load error:", e)
        setLoading(false)
      }
    }
    load()
  // sbRef is stable
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getPreview = (m: MsgRow | null, isMe: boolean) => {
    if (!m) return t("conv.start")
    const prefix = isMe ? t("conv.youPrefix") : ""
    if (m.listing_type && !m.content) return prefix + t("conv.listing")
    if (m.content) return prefix + m.content
    if (m.attachment_type?.startsWith("image/")) return prefix + t("conv.image")
    if (m.attachment_type === "application/pdf") return prefix + t("conv.document")
    return prefix + t("conv.file")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1">
        <div className="w-5 h-5 border-2 border-[var(--orange)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-[var(--border-subtle)] shrink-0">
        <h2 className="text-sm font-bold text-[var(--ink)]">{t("sidebar.title")}</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {convs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
            <p className="text-sm text-gray-400">{t("sidebar.noConversations")}</p>
          </div>
        ) : (
          convs.map((conv) => {
            const isActive = conv.id === activeConvId
            const name = conv.interlocutor.full_name ?? t("sidebar.userFallback")
            const initials = getInitials(conv.interlocutor.full_name)
            const isMe = conv.lastMessage?.sender_id === userId
            const preview = getPreview(conv.lastMessage, isMe ?? false)

            return (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className={`flex items-center gap-3 px-4 py-3 border-b border-[var(--border-subtle)] transition-colors ${
                  isActive
                    ? "bg-[var(--orange)]/10 border-l-[3px] border-l-[var(--orange)]"
                    : "hover:bg-[var(--cream)] border-l-[3px] border-l-transparent"
                }`}
              >
                <div className="w-9 h-9 rounded-full overflow-hidden bg-[var(--orange)] flex items-center justify-center shrink-0">
                  {conv.interlocutor.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={conv.interlocutor.avatar_url} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-xs font-bold">{initials}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-1">
                    <span className={`text-sm truncate ${conv.unread > 0 ? "font-bold text-[var(--ink)]" : "font-medium text-[var(--ink)]"}`}>
                      {name}
                    </span>
                    <span className="text-[10px] text-gray-400 shrink-0">{relativeTime(conv.last_message_at)}</span>
                  </div>
                  <p className={`text-[11px] truncate ${conv.unread > 0 ? "text-[var(--ink)] font-semibold" : "text-gray-400"}`}>
                    {preview}
                  </p>
                </div>
                {conv.unread > 0 && (
                  <span className="shrink-0 min-w-[18px] h-[18px] bg-[var(--orange)] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {conv.unread > 99 ? "99+" : conv.unread}
                  </span>
                )}
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
