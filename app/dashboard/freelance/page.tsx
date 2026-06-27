"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

type Profile = {
  id: string
  full_name: string | null
  bio: string | null
  wilaya: string | null
  role: string | null
  avatar_url: string | null
  rating: number | null
}

type Order = {
  id: string
  buyer_id?: string
  status: string
  total_price: number
  created_at: string
  service_title?: string
  buyer_name?: string
}

type Service = {
  id: string
  title: string
  category: string | null
  price: number
  status: string | null
  created_at: string
}

type Stats = {
  activeOrders: number
  completedOrders: number
  revenueMonth: number
  revenueTotal: number
  reviewCount: number
  rating: number
  serviceCount: number
}

const navItems = [
  {
    label: "Tableau de bord",
    href: "/dashboard/freelance",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    ),
  },
  {
    label: "Mes services",
    href: "/dashboard/freelance/services",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    ),
  },
  {
    label: "Commandes",
    href: "/dashboard/freelance/orders",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    ),
  },
  {
    label: "Messages",
    href: "/dashboard/messages",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    ),
  },
  {
    label: "Mon profil",
    href: "/profile",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    ),
  },
]

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:   { label: "En attente",  color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  active:    { label: "En cours",    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  completed: { label: "Terminée",    color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  cancelled: { label: "Annulée",     color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  paid:      { label: "Payée",       color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
}

function StatCard({
  label, value, sub, color = "text-[#FA8112]",
}: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-white dark:bg-[#2a2a2a] rounded-2xl border border-[#F0E8E0] dark:border-[#3a3a3a] p-5 shadow-sm">
      <div className={`text-2xl font-black ${color}`}>{value}</div>
      <div className="text-sm font-medium text-[#1A1A1A] dark:text-[#FAF3E1] mt-0.5">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  )
}

export default function FreelanceDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState<Stats>({
    activeOrders: 0, completedOrders: 0, revenueMonth: 0,
    revenueTotal: 0, reviewCount: 0, rating: 0, serviceCount: 0,
  })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push("/login"); return }
      const u = data.user
      setUser(u)

      const role = u.user_metadata?.role ?? u.user_metadata?.account_type ?? "buyer"
      if (role !== "seller") { router.push("/dashboard/client"); return }

      // Fetch profile
      const { data: profileData } = await sb
        .from("profiles")
        .select("id, full_name, bio, wilaya, role, avatar_url, rating")
        .eq("id", u.id)
        .single()
      if (profileData) setProfile(profileData)

      // Parallel stats fetch — tolerant of missing tables
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      const [a, b, c, d, e, f, g] = await Promise.allSettled([
        sb.from("orders").select("id", { count: "exact", head: true }).eq("seller_id", u.id).in("status", ["active", "pending"]),
        sb.from("orders").select("id", { count: "exact", head: true }).eq("seller_id", u.id).eq("status", "completed"),
        sb.from("orders").select("total_price").eq("seller_id", u.id).in("status", ["completed", "paid"]).gte("created_at", monthStart),
        sb.from("orders").select("total_price").eq("seller_id", u.id).in("status", ["completed", "paid"]),
        sb.from("reviews").select("id", { count: "exact", head: true }).eq("seller_id", u.id),
        sb.from("services").select("id", { count: "exact", head: true }).eq("seller_id", u.id),
        sb.from("orders").select("id, status, total_price, created_at").eq("seller_id", u.id).order("created_at", { ascending: false }).limit(5),
      ])

      const activeOrders    = a.status === "fulfilled" ? (a.value.count ?? 0) : 0
      const completedOrders = b.status === "fulfilled" ? (b.value.count ?? 0) : 0
      const revenueMonthRows = c.status === "fulfilled" ? (c.value.data ?? []) : []
      const revenueTotalRows = d.status === "fulfilled" ? (d.value.data ?? []) : []
      const reviewCount     = e.status === "fulfilled" ? (e.value.count ?? 0) : 0
      const serviceCount    = f.status === "fulfilled" ? (f.value.count ?? 0) : 0
      const ordersData      = g.status === "fulfilled" ? (g.value.data ?? []) : []

      const revenueMonth = revenueMonthRows.reduce((s: number, r: { total_price: number }) => s + (r.total_price ?? 0), 0)
      const revenueTotal = revenueTotalRows.reduce((s: number, r: { total_price: number }) => s + (r.total_price ?? 0), 0)
      const rating = profileData?.rating ?? 0

      setStats({ activeOrders, completedOrders, revenueMonth, revenueTotal, reviewCount, rating, serviceCount })
      setRecentOrders(ordersData)

      // Fetch services
      const { data: svcData } = await sb
        .from("services")
        .select("id, title, category, price, status, created_at")
        .eq("seller_id", u.id)
        .order("created_at", { ascending: false })
        .limit(4)
      setServices(svcData ?? [])

      setLoading(false)
    })
  }, [router])

  const displayName = profile?.full_name ?? user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "Freelance"
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "?"

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] dark:bg-[#1a1a1a] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#FA8112] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] dark:bg-[#1a1a1a] flex">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-[#2a2a2a] border-r border-[#F0E8E0] dark:border-[#3a3a3a] flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:static lg:translate-x-0 lg:flex`}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-[#F0E8E0] dark:border-[#3a3a3a]">
          <Link href="/" className="flex items-center gap-0.5">
            <span className="text-xl font-extrabold text-[#FA8112]">Pix</span>
            <span className="text-xl font-extrabold text-[#1A1A1A] dark:text-[#FAF3E1]">Raise</span>
          </Link>
          <p className="text-xs text-gray-400 mt-0.5">Espace Freelance</p>
        </div>

        {/* Profile snippet */}
        <div className="px-5 py-4 border-b border-[#F0E8E0] dark:border-[#3a3a3a]">
          <div className="flex items-center gap-3">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="avatar" className="w-10 h-10 rounded-xl object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FA8112] to-[#E8730F] flex items-center justify-center text-white font-bold text-sm shadow-md shadow-[#FA8112]/30">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#1A1A1A] dark:text-[#FAF3E1] truncate">{displayName}</p>
              {stats.rating > 0 && (
                <p className="text-xs text-amber-500 flex items-center gap-0.5">
                  ★ {stats.rating.toFixed(1)} · {stats.reviewCount} avis
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-[#FFF8F0] dark:hover:bg-[#3a3a3a] hover:text-[#FA8112] transition-all group"
            >
              <svg className="w-5 h-5 shrink-0 group-hover:text-[#FA8112] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {item.icon}
              </svg>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom: sign out */}
        <div className="px-3 pb-5 pt-3 border-t border-[#F0E8E0] dark:border-[#3a3a3a]">
          <button
            onClick={async () => {
              const sb = createClient()
              await sb.auth.signOut()
              router.push("/")
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-all"
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar (mobile) */}
        <header className="lg:hidden sticky top-0 z-10 bg-white dark:bg-[#2a2a2a] border-b border-[#F0E8E0] dark:border-[#3a3a3a] px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg hover:bg-[#FFF8F0] dark:hover:bg-[#3a3a3a] transition-colors"
          >
            <svg className="w-6 h-6 text-[#1A1A1A] dark:text-[#FAF3E1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link href="/" className="flex items-center gap-0.5">
            <span className="text-lg font-extrabold text-[#FA8112]">Pix</span>
            <span className="text-lg font-extrabold text-[#1A1A1A] dark:text-[#FAF3E1]">Raise</span>
          </Link>
          <Link href="/profile" className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FA8112] to-[#E8730F] flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-[#1A1A1A] dark:text-[#FAF3E1]">
                Bonjour, {displayName.split(" ")[0]} 👋
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Voici un aperçu de votre activité
              </p>
            </div>
            <Link
              href="/profile"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-[#FA8112] hover:bg-[#E8730F] text-white text-sm font-semibold rounded-xl transition-colors shadow-md shadow-[#FA8112]/30"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Mon profil
            </Link>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Commandes actives"
              value={String(stats.activeOrders)}
              sub="en cours"
              color="text-blue-600 dark:text-blue-400"
            />
            <StatCard
              label="Revenu ce mois"
              value={`${stats.revenueMonth.toLocaleString("fr-DZ")} DA`}
              sub={`${stats.completedOrders} commandes terminées`}
              color="text-emerald-600 dark:text-emerald-400"
            />
            <StatCard
              label="Revenu total"
              value={`${stats.revenueTotal.toLocaleString("fr-DZ")} DA`}
              sub="depuis le début"
              color="text-[#FA8112]"
            />
            <StatCard
              label="Note moyenne"
              value={stats.rating > 0 ? `★ ${stats.rating.toFixed(1)}` : "—"}
              sub={`${stats.reviewCount} avis`}
              color="text-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent orders */}
            <div className="lg:col-span-2 bg-white dark:bg-[#2a2a2a] rounded-2xl border border-[#F0E8E0] dark:border-[#3a3a3a] shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0E8E0] dark:border-[#3a3a3a]">
                <h2 className="font-bold text-[#1A1A1A] dark:text-[#FAF3E1]">Commandes récentes</h2>
                <Link href="/dashboard/freelance/orders" className="text-xs text-[#FA8112] hover:text-[#E8730F] font-medium transition-colors">
                  Voir tout →
                </Link>
              </div>
              {recentOrders.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[#FFF8F0] dark:bg-[#3a3a3a] flex items-center justify-center">
                    <svg className="w-7 h-7 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Aucune commande pour l'instant</p>
                  <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Créez vos premiers services pour recevoir des commandes</p>
                </div>
              ) : (
                <div className="divide-y divide-[#F0E8E0] dark:divide-[#3a3a3a]">
                  {recentOrders.map((order) => {
                    const status = STATUS_LABELS[order.status] ?? { label: order.status, color: "bg-gray-100 text-gray-600" }
                    return (
                      <div key={order.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-[#FFF8F0] dark:hover:bg-[#3a3a3a] transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-[#FA8112]/10 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-[#FA8112]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#1A1A1A] dark:text-[#FAF3E1] truncate">
                              {order.service_title ?? `Commande #${order.id.slice(0, 8)}`}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(order.created_at).toLocaleDateString("fr-DZ", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                            {status.label}
                          </span>
                          <span className="text-sm font-bold text-[#1A1A1A] dark:text-[#FAF3E1]">
                            {(order.total_price ?? 0).toLocaleString("fr-DZ")} DA
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Quick actions + services count */}
            <div className="space-y-4">
              {/* Quick actions */}
              <div className="bg-white dark:bg-[#2a2a2a] rounded-2xl border border-[#F0E8E0] dark:border-[#3a3a3a] shadow-sm p-5">
                <h2 className="font-bold text-[#1A1A1A] dark:text-[#FAF3E1] mb-4">Actions rapides</h2>
                <div className="space-y-2">
                  {[
                    { label: "Créer un service", href: "/dashboard/freelance/services/new", icon: "M12 4v16m8-8H4", primary: true },
                    { label: "Voir mon profil",  href: "/profile",           icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
                    { label: "Explorer",         href: "/freelances",        icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
                  ].map((a) => (
                    <Link
                      key={a.href}
                      href={a.href}
                      className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        a.primary
                          ? "bg-[#FA8112] hover:bg-[#E8730F] text-white shadow-md shadow-[#FA8112]/20"
                          : "bg-[#FFF8F0] dark:bg-[#3a3a3a] hover:bg-[#FA8112]/10 text-[#1A1A1A] dark:text-[#FAF3E1] hover:text-[#FA8112]"
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
              <div className="bg-white dark:bg-[#2a2a2a] rounded-2xl border border-[#F0E8E0] dark:border-[#3a3a3a] shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-[#1A1A1A] dark:text-[#FAF3E1]">Mes services</h2>
                  <span className="text-xs bg-[#FA8112]/10 text-[#FA8112] font-semibold px-2 py-0.5 rounded-full">
                    {stats.serviceCount}
                  </span>
                </div>
                {services.length === 0 ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
                    Aucun service publié
                  </p>
                ) : (
                  <div className="space-y-2">
                    {services.map((svc) => (
                      <div key={svc.id} className="flex items-center justify-between py-2 border-b border-[#F0E8E0] dark:border-[#3a3a3a] last:border-0">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#1A1A1A] dark:text-[#FAF3E1] truncate">{svc.title}</p>
                          <p className="text-xs text-gray-400">{svc.category ?? "Sans catégorie"}</p>
                        </div>
                        <span className="text-sm font-bold text-[#FA8112] shrink-0 ml-2">
                          {(svc.price ?? 0).toLocaleString("fr-DZ")} DA
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Wilaya + account info */}
          <div className="bg-white dark:bg-[#2a2a2a] rounded-2xl border border-[#F0E8E0] dark:border-[#3a3a3a] shadow-sm p-5">
            <h2 className="font-bold text-[#1A1A1A] dark:text-[#FAF3E1] mb-4">Informations du compte</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Email", value: user?.email ?? "—" },
                { label: "Wilaya", value: profile?.wilaya ?? "Non renseignée" },
                { label: "Compte", value: "Vendeur / Freelance" },
              ].map((info) => (
                <div key={info.label}>
                  <p className="text-xs text-gray-400 mb-0.5">{info.label}</p>
                  <p className="text-sm font-medium text-[#1A1A1A] dark:text-[#FAF3E1]">{info.value}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
