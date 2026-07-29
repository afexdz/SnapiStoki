"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import UnreadBadge from "@/components/UnreadBadge"
import { SHOW_ORDERS } from "@/lib/features"
import type { User } from "@supabase/supabase-js"

type Profile = {
  id: string
  full_name: string | null
  avatar_url: string | null
  wilaya: string | null
  role: string | null
}

// SHOW_ORDERS: keep Order type for when orders are re-enabled
type Order = {
  id: string
  seller_id: string
  status: string
  total_price: number
  created_at: string
  service_title?: string
}

type ConvRow = {
  id: string
  buyer_id: string
  seller_id: string
  listing_type: string
  listing_id: string
  last_message_at: string
}

type RecentConv = {
  id: string
  interlocutor: { id: string; full_name: string | null; avatar_url: string | null }
  listingTitle: string
  lastMessage: string | null
  lastMessageIsMine: boolean
  lastMessageAt: string
  unread: number
}

type Stats = {
  convCount: number
  unreadCount: number
  favoriteCount: number
  // SHOW_ORDERS: activeOrders, completedOrders, totalSpent
}

const navItems = [
  {
    label: "Tableau de bord",
    href: "/dashboard/client",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  // SHOW_ORDERS gate: "Mes commandes" entry shown when orders are re-enabled
  ...(SHOW_ORDERS ? [{ label: "Mes commandes", href: "/dashboard/client/orders", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" }] : []),
  {
    label: "Messages",
    href: "/messages",
    icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  },
  {
    label: "Favoris",
    href: "/dashboard/client/favorites",
    icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  },
  {
    label: "Mon profil",
    href: "/profile",
    icon: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
  },
  {
    label: "Paramètres",
    href: "/profile",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  },
]

// SHOW_ORDERS: status label map — uncomment when rendering order rows
// const STATUS_LABELS: Record<string, { label: string; color: string }> = {
//   pending:   { label: "En attente",  color: "bg-amber-100 text-amber-700" },
//   active:    { label: "En cours",    color: "bg-blue-100 text-blue-700" },
//   completed: { label: "Terminée",    color: "bg-green-100 text-green-700" },
//   cancelled: { label: "Annulée",     color: "bg-red-100 text-red-700" },
//   paid:      { label: "Payée",       color: "bg-emerald-100 text-emerald-700" },
// }

function getInitials(name: string | null) {
  return (name || "?").trim().split(/\s+/).map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

function relativeTime(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return "À l'instant"
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  const days = Math.floor(h / 24)
  if (days === 1) return "Hier"
  if (days < 7) return `Il y a ${days} j`
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
}

function StatCard({ label, value, sub, color = "text-[var(--orange)]" }: {
  label: string; value: string; sub?: string; color?: string
}) {
  return (
    <div className="bg-[var(--white)] rounded-2xl border border-[var(--border-subtle)] p-5 shadow-sm">
      <div className={`text-2xl font-black ${color}`}>{value}</div>
      <div className="text-sm font-medium text-[var(--ink)] mt-0.5">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  )
}

export default function ClientDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState<Stats>({ convCount: 0, unreadCount: 0, favoriteCount: 0 })
  const [recentConvs, setRecentConvs] = useState<RecentConv[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push("/login"); return }
      const u = data.user
      setUser(u)

      const { data: profileData } = await sb
        .from("profiles")
        .select("id, full_name, avatar_url, wilaya, role")
        .eq("id", u.id)
        .single()
      if (profileData) setProfile(profileData)

      const role = profileData?.role ?? "buyer"
      if (role === "seller" || role === "both") { router.push("/dashboard/freelance"); return }

      // Single parallel fetch for all stats + recent conversations
      const [favsRes, convsCountRes, unreadRes, recentConvsRes] = await Promise.allSettled([
        sb.from("favorites").select("id", { count: "exact", head: true }).eq("user_id", u.id),
        sb.from("conversations").select("id", { count: "exact", head: true }),
        sb.from("messages")
          .select("id", { count: "exact", head: true })
          .not("conversation_id", "is", null)
          .is("read_at", null)
          .neq("sender_id", u.id),
        sb.from("conversations")
          .select("id, buyer_id, seller_id, listing_type, listing_id, last_message_at")
          .order("last_message_at", { ascending: false })
          .limit(5),
      ])

      /* SHOW_ORDERS: add these to the allSettled array above and destructure:
        sb.from("orders").select("id", { count: "exact", head: true }).eq("buyer_id", u.id).in("status", ["active", "pending"]),
        sb.from("orders").select("id", { count: "exact", head: true }).eq("buyer_id", u.id).eq("status", "completed"),
        sb.from("orders").select("total_price").eq("buyer_id", u.id).in("status", ["completed", "paid"]),
        sb.from("orders").select("id, seller_id, status, total_price, created_at").eq("buyer_id", u.id).order("created_at", { ascending: false }).limit(5),
      */

      const favoriteCount = favsRes.status === "fulfilled" ? (favsRes.value.count ?? 0) : 0
      const convCount = convsCountRes.status === "fulfilled" ? (convsCountRes.value.count ?? 0) : 0
      const unreadCount = unreadRes.status === "fulfilled" ? (unreadRes.value.count ?? 0) : 0
      const rawConvs: ConvRow[] = recentConvsRes.status === "fulfilled" ? ((recentConvsRes.value.data ?? []) as ConvRow[]) : []

      setStats({ convCount, unreadCount, favoriteCount })

      // Enrich recent conversations with profiles + titles + last messages
      if (rawConvs.length > 0) {
        const profileIds = [...new Set([...rawConvs.map((c) => c.buyer_id), ...rawConvs.map((c) => c.seller_id)])]
        const convIds = rawConvs.map((c) => c.id)
        const serviceIds = rawConvs.filter((c) => c.listing_type === "service").map((c) => c.listing_id)
        const productIds = rawConvs.filter((c) => c.listing_type === "product").map((c) => c.listing_id)

        const [profilesRes, lastMsgsRes, unreadByConvRes] = await Promise.all([
          sb.from("profiles").select("id, full_name, avatar_url").in("id", profileIds),
          sb.from("messages")
            .select("conversation_id, content, sender_id")
            .in("conversation_id", convIds)
            .order("created_at", { ascending: false }),
          sb.from("messages")
            .select("conversation_id")
            .in("conversation_id", convIds)
            .is("read_at", null)
            .neq("sender_id", u.id),
        ])

        const [servicesRes, productsRes] = await Promise.all([
          serviceIds.length > 0
            ? sb.from("services").select("id, title").in("id", serviceIds)
            : Promise.resolve({ data: [] as { id: string; title: string }[] }),
          productIds.length > 0
            ? sb.from("digital_products").select("id, title").in("id", productIds)
            : Promise.resolve({ data: [] as { id: string; title: string }[] }),
        ])

        const profileMap: Record<string, { id: string; full_name: string | null; avatar_url: string | null }> = {}
        for (const p of (profilesRes.data ?? []) as { id: string; full_name: string | null; avatar_url: string | null }[]) {
          profileMap[p.id] = p
        }

        const lastMsgByConv: Record<string, { content: string; sender_id: string }> = {}
        for (const m of (lastMsgsRes.data ?? []) as { conversation_id: string; content: string; sender_id: string }[]) {
          if (!lastMsgByConv[m.conversation_id]) lastMsgByConv[m.conversation_id] = m
        }

        const unreadByConv: Record<string, number> = {}
        for (const m of (unreadByConvRes.data ?? []) as { conversation_id: string }[]) {
          unreadByConv[m.conversation_id] = (unreadByConv[m.conversation_id] ?? 0) + 1
        }

        const titleMap: Record<string, string> = {}
        for (const s of (servicesRes.data ?? []) as { id: string; title: string }[]) titleMap[s.id] = s.title
        for (const p of (productsRes.data ?? []) as { id: string; title: string }[]) titleMap[p.id] = p.title

        const display: RecentConv[] = rawConvs.map((c) => {
          const interlocutorId = c.buyer_id === u.id ? c.seller_id : c.buyer_id
          const lm = lastMsgByConv[c.id]
          return {
            id: c.id,
            interlocutor: profileMap[interlocutorId] ?? { id: interlocutorId, full_name: null, avatar_url: null },
            listingTitle: titleMap[c.listing_id] ?? "Annonce supprimée",
            lastMessage: lm?.content ?? null,
            lastMessageIsMine: lm?.sender_id === u.id,
            lastMessageAt: c.last_message_at,
            unread: unreadByConv[c.id] ?? 0,
          }
        })
        setRecentConvs(display)
      }

      setLoading(false)
    })
  }, [router])

  const displayName = profile?.full_name ?? user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "Client"
  const initials = getInitials(displayName)

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--orange)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--cream)] flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-[var(--white)] border-r border-[var(--border-subtle)] flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:static lg:translate-x-0 lg:flex`}
      >
        <div className="px-5 py-5 border-b border-[var(--border-subtle)]">
          <Link href="/" className="flex items-center gap-0.5">
            <span className="text-xl font-extrabold text-[var(--orange)]">Pix</span>
            <span className="text-xl font-extrabold text-[var(--ink)]">Raise</span>
          </Link>
          <p className="text-xs text-gray-400 mt-0.5">Espace Client</p>
        </div>

        <div className="px-5 py-4 border-b border-[var(--border-subtle)]">
          <Link href="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt="avatar" className="w-10 h-10 rounded-xl object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--orange)] to-[var(--orange-dark)] flex items-center justify-center text-white font-bold text-sm shadow-md shadow-[var(--orange)]/30">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--ink)] truncate">{displayName}</p>
              <p className="text-xs text-gray-400">Compte Acheteur</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-[var(--cream)] hover:text-[var(--orange)] transition-all group"
            >
              <svg className="w-5 h-5 shrink-0 group-hover:text-[var(--orange)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.icon} />
              </svg>
              {item.label}
              {item.href === "/messages" && <UnreadBadge className="ml-auto" />}
            </Link>
          ))}
        </nav>

        <div className="px-3 pb-5 pt-3 border-t border-[var(--border-subtle)]">
          <button
            onClick={async () => {
              await createClient().auth.signOut()
              router.push("/")
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all"
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden sticky top-0 z-10 bg-[var(--white)] border-b border-[var(--border-subtle)] px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg hover:bg-[var(--cream)] transition-colors"
          >
            <svg className="w-6 h-6 text-[var(--ink)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link href="/" className="flex items-center gap-0.5">
            <span className="text-lg font-extrabold text-[var(--orange)]">Pix</span>
            <span className="text-lg font-extrabold text-[var(--ink)]">Raise</span>
          </Link>
          <Link href="/profile" className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--orange)] to-[var(--orange-dark)] flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </Link>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-[var(--ink)]">
                Bonjour, {displayName.split(" ")[0]} 👋
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">Suivez vos conversations et activités</p>
            </div>
            <Link
              href="/freelances"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-[var(--orange)] hover:bg-[var(--orange-dark)] text-white text-sm font-semibold rounded-xl transition-colors shadow-md shadow-[var(--orange)]/30"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Trouver un freelance
            </Link>
          </div>

          {/* Stats — 3 cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              label="Conversations"
              value={String(stats.convCount)}
              sub="total"
              color="text-[var(--orange)]"
            />
            <StatCard
              label="Messages non lus"
              value={String(stats.unreadCount)}
              sub={stats.unreadCount === 0 ? "tout lu" : "à lire"}
              color={stats.unreadCount > 0 ? "text-blue-600" : "text-emerald-600"}
            />
            <StatCard
              label="Favoris"
              value={String(stats.favoriteCount)}
              sub="freelances sauvegardés"
              color="text-pink-500"
            />
          </div>

          {/* SHOW_ORDERS: replace above with 4-card grid when re-enabled:
            <StatCard label="Commandes actives" value={String(activeOrders)} sub="en cours" color="text-blue-600" />
            <StatCard label="Terminées" value={String(completedOrders)} sub="commandes" color="text-emerald-600" />
            <StatCard label="Total dépensé" value={`${totalSpent.toLocaleString("fr-DZ")} DA`} sub="toutes commandes" color="text-[var(--orange)]" />
            <StatCard label="Favoris" value={String(favoriteCount)} sub="freelances sauvegardés" color="text-pink-500" />
          */}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent conversations */}
            <div className="lg:col-span-2 bg-[var(--white)] rounded-2xl border border-[var(--border-subtle)] shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
                <h2 className="font-bold text-[var(--ink)]">Mes conversations récentes</h2>
                <Link href="/messages" className="text-xs text-[var(--orange)] hover:text-[var(--orange-dark)] font-medium transition-colors">
                  Voir tout →
                </Link>
              </div>

              {recentConvs.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[var(--cream)] flex items-center justify-center">
                    <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-400">Aucune conversation pour l'instant</p>
                  <Link
                    href="/freelances"
                    className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-[var(--orange)] hover:text-[var(--orange-dark)] transition-colors"
                  >
                    Trouver un freelance →
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[var(--border-subtle)]">
                  {recentConvs.map((conv) => {
                    const name = conv.interlocutor.full_name ?? "Utilisateur"
                    const initials2 = getInitials(conv.interlocutor.full_name)
                    const preview = conv.lastMessage
                      ? (conv.lastMessageIsMine ? `Vous : ${conv.lastMessage}` : conv.lastMessage)
                      : "Démarrez la conversation"
                    return (
                      <Link
                        key={conv.id}
                        href={`/messages/${conv.id}`}
                        className="flex items-center gap-3 px-5 py-3.5 hover:bg-[var(--cream)] transition-colors"
                      >
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-[var(--orange)] flex items-center justify-center shrink-0">
                          {conv.interlocutor.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={conv.interlocutor.avatar_url} alt={name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white text-xs font-bold">{initials2}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className={`text-sm truncate ${conv.unread > 0 ? "font-bold text-[var(--ink)]" : "font-medium text-[var(--ink)]"}`}>
                              {name}
                            </span>
                            <span className="text-[10px] text-gray-400 shrink-0">{relativeTime(conv.lastMessageAt)}</span>
                          </div>
                          <p className="text-[11px] text-[var(--orange)] font-medium truncate">{conv.listingTitle}</p>
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
                  })}
                </div>
              )}

              {/* SHOW_ORDERS: replace above with order list (see original code) */}
            </div>

            {/* Right column */}
            <div className="space-y-4">
              {/* Quick actions */}
              <div className="bg-[var(--white)] rounded-2xl border border-[var(--border-subtle)] shadow-sm p-5">
                <h2 className="font-bold text-[var(--ink)] mb-4">Actions rapides</h2>
                <div className="space-y-2">
                  {[
                    { label: "Trouver un freelance", href: "/freelances", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z", primary: true },
                    { label: "Marketplace", href: "/marketplace", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
                    { label: "Mon profil", href: "/profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
                  ].map((a) => (
                    <Link
                      key={a.href}
                      href={a.href}
                      className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        a.primary
                          ? "bg-[var(--orange)] hover:bg-[var(--orange-dark)] text-white shadow-md shadow-[var(--orange)]/20"
                          : "bg-[var(--cream)] hover:bg-[var(--orange)]/10 text-[var(--ink)] hover:text-[var(--orange)]"
                      }`}
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={a.icon} />
                      </svg>
                      {a.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Mon compte */}
              <div className="bg-[var(--white)] rounded-2xl border border-[var(--border-subtle)] shadow-sm p-5">
                <h2 className="font-bold text-[var(--ink)] mb-4">Mon compte</h2>
                <div className="space-y-3">
                  {[
                    { label: "Email", value: user?.email ?? "—" },
                    { label: "Wilaya", value: profile?.wilaya ?? "Non renseignée" },
                    { label: "Type", value: "Acheteur" },
                  ].map((info) => (
                    <div key={info.label} className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{info.label}</span>
                      <span className="text-xs font-medium text-[var(--ink)]">{info.value}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/profile"
                  className="mt-4 flex items-center justify-center gap-1.5 w-full py-2 rounded-xl border border-[var(--orange)]/30 text-[var(--orange)] text-sm font-medium hover:bg-[var(--orange)]/5 transition-colors"
                >
                  Modifier le profil →
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
