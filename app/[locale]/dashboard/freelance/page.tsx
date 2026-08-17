"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { createClient } from "@/lib/supabase/client"
import UnreadBadge from "@/components/UnreadBadge"
import { SHOW_ORDERS } from "@/lib/features"
import type { User } from "@supabase/supabase-js"

type Profile = {
  id: string
  full_name: string | null
  bio: string | null
  wilaya: string | null
  role: string | null
  avatar_url: string | null
  rating: number | null
  location_city: string | null
  location_country: string | null
}

// SHOW_ORDERS: keep Order type for re-enable
type Order = {
  id: string
  buyer_id?: string
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

type Service = {
  id: string
  title: string
  category: string | null
  price: number
  is_active: boolean | null
  created_at: string
}

type Stats = {
  serviceCount: number
  productCount: number
  convCount: number
  unreadCount: number
  // SHOW_ORDERS: activeOrders, completedOrders, revenueMonth, revenueTotal, reviewCount, rating
}

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

function StatCard({
  label, value, sub, color = "text-[var(--orange)]",
}: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-[var(--white)] rounded-2xl border border-[var(--border-subtle)] p-5 shadow-sm">
      <div className={`text-2xl font-black ${color}`}>{value}</div>
      <div className="text-sm font-medium text-[var(--ink)] mt-0.5">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  )
}

export default function FreelanceDashboard() {
  const router = useRouter()
  const t = useTranslations("dashboardSeller")
  const tMsg = useTranslations("messages")
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState<Stats>({ serviceCount: 0, productCount: 0, convCount: 0, unreadCount: 0 })
  const [recentConvs, setRecentConvs] = useState<RecentConv[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function relativeTime(d: string) {
    const diff = Date.now() - new Date(d).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return tMsg("relativeTime.now")
    if (m < 60) return tMsg("relativeTime.min", { n: m })
    const h = Math.floor(m / 60)
    if (h < 24) return tMsg("relativeTime.hours", { n: h })
    const days = Math.floor(h / 24)
    if (days === 1) return tMsg("relativeTime.yesterday")
    if (days < 7) return tMsg("relativeTime.daysAgo", { n: days })
    return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
  }

  const navItems = [
    {
      label: t("nav.dashboard"),
      href: "/dashboard/freelance",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      ),
    },
    {
      label: t("nav.services"),
      href: "/dashboard/freelance/services",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      ),
    },
    {
      label: t("nav.products"),
      href: "/dashboard/freelance/products",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
      ),
    },
    // SHOW_ORDERS gate: "Commandes" entry shown when orders are re-enabled
    ...(SHOW_ORDERS ? [{
      label: t("nav.orders"),
      href: "/dashboard/freelance/orders",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      ),
    }] : []),
    {
      label: t("nav.messages"),
      href: "/messages",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      ),
    },
    {
      label: t("nav.profile"),
      href: "/profile",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      ),
    },
    {
      label: t("nav.publishService"),
      href: "/services/new",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 4v16m8-8H4" />
      ),
    },
  ]

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push("/login"); return }
      const u = data.user
      setUser(u)

      const { data: profileData } = await sb
        .from("profiles")
        .select("id, full_name, bio, wilaya, role, avatar_url, rating, location_city, location_country")
        .eq("id", u.id)
        .single()
      if (profileData) setProfile(profileData)

      const role = profileData?.role ?? "buyer"
      if (role !== "seller" && role !== "both") { router.push("/dashboard/client"); return }

      // Silently backfill location for accounts created before the location feature
      if (profileData && !profileData.location_city) {
        try {
          const geo = await fetch('/api/geo', { signal: AbortSignal.timeout(6000) }).then(r => r.json())
          if (geo.detected && (geo.city || geo.country)) {
            await sb.from("profiles").update({
              location_city: geo.city ?? null,
              location_country: geo.country ?? null,
            }).eq("id", u.id)
          }
        } catch { /* non-blocking */ }
      }

      // Single parallel fetch for all stats + recent conversations
      const [svcCountRes, prodCountRes, convsCountRes, unreadRes, recentConvsRes] = await Promise.allSettled([
        sb.from("services").select("id", { count: "exact", head: true }).eq("seller_id", u.id),
        sb.from("digital_products").select("id", { count: "exact", head: true }).eq("seller_id", u.id),
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
        const now = new Date()
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
        sb.from("orders").select("id", { count: "exact", head: true }).eq("seller_id", u.id).in("status", ["active", "pending"]),
        sb.from("orders").select("id", { count: "exact", head: true }).eq("seller_id", u.id).eq("status", "completed"),
        sb.from("orders").select("total_price").eq("seller_id", u.id).in("status", ["completed", "paid"]).gte("created_at", monthStart),
        sb.from("orders").select("total_price").eq("seller_id", u.id).in("status", ["completed", "paid"]),
        sb.from("reviews").select("id", { count: "exact", head: true }).eq("reviewed_id", u.id),
        sb.from("orders").select("id, status, total_price, created_at").eq("seller_id", u.id).order("created_at", { ascending: false }).limit(5),
      */

      const serviceCount = svcCountRes.status === "fulfilled" ? (svcCountRes.value.count ?? 0) : 0
      const productCount = prodCountRes.status === "fulfilled" ? (prodCountRes.value.count ?? 0) : 0
      const convCount = convsCountRes.status === "fulfilled" ? (convsCountRes.value.count ?? 0) : 0
      const unreadCount = unreadRes.status === "fulfilled" ? (unreadRes.value.count ?? 0) : 0
      const rawConvs: ConvRow[] = recentConvsRes.status === "fulfilled" ? ((recentConvsRes.value.data ?? []) as ConvRow[]) : []

      setStats({ serviceCount, productCount, convCount, unreadCount })

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
            listingTitle: titleMap[c.listing_id] ?? t("home.requests.deletedListing"),
            lastMessage: lm?.content ?? null,
            lastMessageIsMine: lm?.sender_id === u.id,
            lastMessageAt: c.last_message_at,
            unread: unreadByConv[c.id] ?? 0,
          }
        })
        setRecentConvs(display)
      }

      // Services summary for right column (keep)
      const { data: svcData, error: svcError } = await sb
        .from("services")
        .select("id, title, category, price, is_active, created_at")
        .eq("seller_id", u.id)
        .order("created_at", { ascending: false })
        .limit(4)
      if (svcError) console.error("[freelance/dashboard] services fetch error:", svcError)
      setServices(svcData ?? [])

      setLoading(false)
    })
  }, [router])

  const displayName = profile?.full_name ?? user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "Freelance"
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
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
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
          <p className="text-xs text-gray-400 mt-0.5">{t("nav.space")}</p>
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
              {(profile?.rating ?? 0) > 0 && (
                <p className="text-xs text-amber-500">★ {profile!.rating!.toFixed(1)}</p>
              )}
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-[var(--cream)] hover:text-[var(--orange)] transition-all group"
            >
              <svg className="w-5 h-5 shrink-0 group-hover:text-[var(--orange)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {item.icon}
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
            {t("nav.logout")}
          </button>
        </div>
      </aside>

      {/* Main content */}
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
                {t("home.greeting", { name: displayName.split(" ")[0] })}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {t("home.subtitle")}
              </p>
            </div>
            <Link
              href="/profile"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-[var(--orange)] hover:bg-[var(--orange-dark)] text-white text-sm font-semibold rounded-xl transition-colors shadow-md shadow-[var(--orange)]/30"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {t("home.myProfile")}
            </Link>
          </div>

          {/* Stats — 4 cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label={t("home.stats.services")}
              value={String(stats.serviceCount)}
              sub={t("home.stats.servicesHint")}
              color="text-[var(--orange)]"
            />
            <StatCard
              label={t("home.stats.products")}
              value={String(stats.productCount)}
              sub={t("home.stats.productsHint")}
              color="text-purple-600"
            />
            <StatCard
              label={t("home.stats.conversations")}
              value={String(stats.convCount)}
              sub={t("home.stats.conversationsHint")}
              color="text-blue-600"
            />
            <StatCard
              label={t("home.stats.unread")}
              value={String(stats.unreadCount)}
              sub={stats.unreadCount === 0 ? t("home.stats.unreadAll") : t("home.stats.unreadPending")}
              color={stats.unreadCount > 0 ? "text-blue-600" : "text-emerald-600"}
            />
          </div>

          {/* SHOW_ORDERS: replace above with 4-card orders/revenue grid when re-enabled:
            <StatCard label="Commandes actives" value={String(activeOrders)} sub="en cours" color="text-blue-600" />
            <StatCard label="Revenu ce mois" value={`${revenueMonth.toLocaleString("fr-DZ")} DA`} sub={`${completedOrders} terminées`} color="text-emerald-600" />
            <StatCard label="Revenu total" value={`${revenueTotal.toLocaleString("fr-DZ")} DA`} sub="depuis le début" color="text-[var(--orange)]" />
            <StatCard label="Note moyenne" value={rating > 0 ? `★ ${rating.toFixed(1)}` : "—"} sub={`${reviewCount} avis`} color="text-amber-500" />
          */}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent conversations / SHOW_ORDERS: switch to orders */}
            <div className="lg:col-span-2 bg-[var(--white)] rounded-2xl border border-[var(--border-subtle)] shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
                <h2 className="font-bold text-[var(--ink)]">{t("home.requests.title")}</h2>
                <Link href="/messages" className="text-xs text-[var(--orange)] hover:text-[var(--orange-dark)] font-medium transition-colors">
                  {t("home.requests.viewAll")}
                </Link>
              </div>

              {recentConvs.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[var(--cream)] flex items-center justify-center">
                    <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-400">{t("home.requests.empty")}</p>
                  <p className="text-xs text-gray-300 mt-1">{t("home.requests.emptyHint")}</p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--border-subtle)]">
                  {recentConvs.map((conv) => {
                    const name = conv.interlocutor.full_name ?? "Utilisateur"
                    const initials2 = getInitials(conv.interlocutor.full_name)
                    const preview = conv.lastMessage
                      ? (conv.lastMessageIsMine ? t("home.requests.you", { msg: conv.lastMessage }) : conv.lastMessage)
                      : t("home.requests.startConv")
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
            </div>

            {/* Right column */}
            <div className="space-y-4">
              {/* Quick actions */}
              <div className="bg-[var(--white)] rounded-2xl border border-[var(--border-subtle)] shadow-sm p-5">
                <h2 className="font-bold text-[var(--ink)] mb-4">{t("home.quickActions.title")}</h2>
                <div className="space-y-2">
                  {[
                    { label: t("home.quickActions.publishService"), href: "/services/new",   icon: "M12 4v16m8-8H4", primary: true },
                    { label: t("home.quickActions.sellProduct"),    href: "/products/new",   icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
                    { label: t("home.quickActions.viewProfile"),    href: "/profile",        icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
                    { label: t("home.quickActions.explore"),        href: "/freelances",     icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
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

              {/* Services summary */}
              <div className="bg-[var(--white)] rounded-2xl border border-[var(--border-subtle)] shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-[var(--ink)]">{t("home.myServices.title")}</h2>
                  <span className="text-xs bg-[var(--orange)]/10 text-[var(--orange)] font-semibold px-2 py-0.5 rounded-full">
                    {stats.serviceCount}
                  </span>
                </div>
                {services.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">{t("home.myServices.empty")}</p>
                ) : (
                  <div className="space-y-2">
                    {services.map((svc) => (
                      <div key={svc.id} className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)] last:border-0">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[var(--ink)] truncate">{svc.title}</p>
                          <p className="text-xs text-gray-400">{svc.category ?? t("home.myServices.noCategory")}</p>
                        </div>
                        <span className="text-sm font-bold text-[var(--orange)] shrink-0 ml-2">
                          {(svc.price ?? 0).toLocaleString("fr-DZ")} DA
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Account info */}
          <div className="bg-[var(--white)] rounded-2xl border border-[var(--border-subtle)] shadow-sm p-5">
            <h2 className="font-bold text-[var(--ink)] mb-4">{t("home.account.title")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: t("home.account.email"), value: user?.email ?? "—" },
                { label: t("home.account.wilaya"), value: profile?.wilaya ?? t("home.account.wilayaEmpty") },
                { label: t("home.account.account"), value: t("home.account.role") },
              ].map((info) => (
                <div key={info.label}>
                  <p className="text-xs text-gray-400 mb-0.5">{info.label}</p>
                  <p className="text-sm font-medium text-[var(--ink)]">{info.value}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
