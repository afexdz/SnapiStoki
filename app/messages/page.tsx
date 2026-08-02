"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import { createClient } from "@/lib/supabase/client"

type ConvRow = {
  id: string
  buyer_id: string
  seller_id: string
  listing_type: string | null
  listing_id: string | null
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
  created_at: string
  sender_id: string
}

type ConvDisplay = {
  id: string
  interlocutor: ProfileRow
  listingTitle: string | null
  listingType: string | null
  listingId: string | null
  lastMessage: MsgRow | null
  unread: number
  last_message_at: string
}

function relativeTime(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return "À l'instant"
  if (m < 60) return `Il y a ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `Il y a ${h}h`
  const days = Math.floor(h / 24)
  if (days === 1) return "Hier"
  if (days < 7) return `Il y a ${days} j`
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
}

function getInitials(name: string | null) {
  return (name || "?").trim().split(/\s+/).map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

export default function MessagesPage() {
  const router = useRouter()
  const [convs, setConvs] = useState<ConvDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    const load = async () => {
      setError(null)
      setLoading(true)
      try {
        const sb = createClient()
        const { data: { user } } = await sb.auth.getUser()
        if (!user) { router.push("/login?next=/messages"); return }
        setUserId(user.id)

        const { data: rawConvs, error: convsErr } = await sb
          .from("conversations")
          .select("id, buyer_id, seller_id, listing_type, listing_id, last_message_at")
          .order("last_message_at", { ascending: false })

        if (convsErr) {
          console.error("[messages] conversations query error:", convsErr)
          setError("Impossible de charger les conversations.")
          setLoading(false)
          return
        }

        if (!rawConvs || rawConvs.length === 0) { setLoading(false); return }

        const profileIds = [...new Set([...rawConvs.map((c: ConvRow) => c.buyer_id), ...rawConvs.map((c: ConvRow) => c.seller_id)])]
        const convIds = rawConvs.map((c: ConvRow) => c.id)
        const serviceIds = rawConvs.filter((c: ConvRow) => c.listing_type === "service" && c.listing_id).map((c: ConvRow) => c.listing_id as string)
        const productIds = rawConvs.filter((c: ConvRow) => c.listing_type === "product" && c.listing_id).map((c: ConvRow) => c.listing_id as string)

        const [profilesRes, lastMsgsRes, unreadRes] = await Promise.all([
          sb.from("profiles").select("id, full_name, avatar_url").in("id", profileIds),
          sb.from("messages").select("id, conversation_id, content, attachment_type, created_at, sender_id")
            .in("conversation_id", convIds).order("created_at", { ascending: false }),
          sb.from("messages").select("conversation_id")
            .in("conversation_id", convIds).is("read_at", null).neq("sender_id", user.id),
        ])

        if (lastMsgsRes.error) console.error("[messages] lastMsgs query error:", lastMsgsRes.error)
        if (unreadRes.error) console.error("[messages] unread query error:", unreadRes.error)
        if (profilesRes.error) console.error("[messages] profiles query error:", profilesRes.error)

        const [servicesData, productsData] = await Promise.all([
          serviceIds.length === 0 ? null : sb.from("services").select("id, title").in("id", serviceIds).then((r) => { if (r.error) console.error("[messages] services query error:", r.error); return r.data }),
          productIds.length === 0 ? null : sb.from("digital_products").select("id, title").in("id", productIds).then((r) => { if (r.error) console.error("[messages] products query error:", r.error); return r.data }),
        ])

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

        const titleMap: Record<string, string> = {}
        for (const s of (servicesData ?? []) as { id: string; title: string }[]) titleMap[s.id] = s.title
        for (const p of (productsData ?? []) as { id: string; title: string }[]) titleMap[p.id] = p.title

        const display: ConvDisplay[] = (rawConvs as ConvRow[]).map((c) => {
          const interlocutorId = c.buyer_id === user.id ? c.seller_id : c.buyer_id
          return {
            id: c.id,
            interlocutor: profileMap[interlocutorId] ?? { id: interlocutorId, full_name: null, avatar_url: null },
            listingTitle: c.listing_id ? (titleMap[c.listing_id] ?? "Annonce supprimée") : null,
            listingType: c.listing_type,
            listingId: c.listing_id,
            lastMessage: lastMsgByConv[c.id] ?? null,
            unread: unreadByConv[c.id] ?? 0,
            last_message_at: c.last_message_at,
          }
        })

        setConvs(display)
        setLoading(false)
      } catch (e) {
        console.error("[messages] load error:", e)
        setError("Une erreur inattendue est survenue.")
        setLoading(false)
      }
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, retryKey])

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[var(--cream)]">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-extrabold text-[var(--ink)] mb-6">Messages</h1>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-[3px] border-[var(--orange)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500 font-medium">{error}</p>
              <button
                onClick={() => setRetryKey((k) => k + 1)}
                className="mt-4 px-4 py-2 bg-[var(--orange)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--orange-dark)] transition-colors"
              >
                Réessayer
              </button>
            </div>
          ) : convs.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-[var(--white)] border border-[var(--border-subtle)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">Aucun message pour le moment</p>
              <p className="text-sm text-gray-400 mt-1">Contactez un vendeur depuis une annonce pour démarrer une conversation.</p>
              <div className="flex gap-3 justify-center mt-6">
                <Link href="/freelances" className="px-4 py-2 bg-[var(--orange)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--orange-dark)] transition-colors">
                  Voir les services
                </Link>
                <Link href="/marketplace" className="px-4 py-2 border border-[var(--border-subtle)] text-[var(--ink)] text-sm font-semibold rounded-xl hover:border-[var(--orange)]/40 transition-colors">
                  Marketplace
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {convs.map((conv) => {
                const name = conv.interlocutor.full_name ?? "Utilisateur"
                const initials = getInitials(conv.interlocutor.full_name)
                const preview = (() => {
                  const m = conv.lastMessage
                  if (!m) return "Démarrez la conversation"
                  const prefix = m.sender_id === userId ? "Vous : " : ""
                  if (m.content) return prefix + m.content
                  if (m.attachment_type?.startsWith("image/")) return prefix + "📎 Image"
                  if (m.attachment_type === "application/pdf") return prefix + "📎 Document"
                  return prefix + "📎 Fichier"
                })()
                return (
                  <Link
                    key={conv.id}
                    href={`/messages/${conv.id}`}
                    className="flex items-center gap-4 p-4 bg-[var(--white)] rounded-2xl border border-[var(--border-subtle)] hover:border-[var(--orange)]/30 hover:shadow-md transition-all"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-[var(--orange)] flex items-center justify-center shrink-0">
                      {conv.interlocutor.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={conv.interlocutor.avatar_url} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white text-sm font-bold">{initials}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-sm font-bold text-[var(--ink)] truncate">{name}</span>
                        <span className="text-xs text-gray-400 shrink-0">{relativeTime(conv.last_message_at)}</span>
                      </div>
                      {conv.listingTitle && <p className="text-xs text-[var(--orange)] font-medium truncate mb-0.5">{conv.listingTitle}</p>}
                      <p className={`text-xs truncate ${conv.unread > 0 ? "text-[var(--ink)] font-semibold" : "text-gray-400"}`}>
                        {preview}
                      </p>
                    </div>
                    {conv.unread > 0 && (
                      <span className="shrink-0 min-w-[20px] h-5 bg-[var(--orange)] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                        {conv.unread > 99 ? "99+" : conv.unread}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
