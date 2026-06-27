"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { createClient } from "@/lib/supabase/client"
import { WILAYAS } from "@/lib/wilayas"
import type { User } from "@supabase/supabase-js"

/* ─── Types ─────────────────────────────────────────────────── */
type Profile = {
  id: string
  full_name: string | null
  bio: string | null
  wilaya: string | null
  role: string | null
  avatar_url: string | null
  cover_url: string | null
  rating: number | null
  created_at: string
}
type Stats = { orders: number; sales: number; reviews: number; revenue: number }
type Service = {
  id: string; title: string; price: number
  rating: number | null; review_count: number | null
  category: string | null; cover_url: string | null
}
type Product = {
  id: string; title: string; price: number
  sales_count: number | null; format: string | null; cover_url: string | null
}
type Review = {
  id: string; rating: number; comment: string | null; created_at: string
  reviewer_name: string | null; reviewer_initials: string | null; reviewer_avatar: string | null
}
type Tab = "services" | "produits" | "avis" | "parametres"

/* ─── Constants ─────────────────────────────────────────────── */
const GRADIENTS = [
  "from-[#FA8112] to-[#E8730F]",
  "from-sky-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-pink-500 to-rose-600",
  "from-amber-500 to-orange-600",
  "from-violet-500 to-purple-600",
]

/* ─── Helpers ────────────────────────────────────────────────── */
const getInitials = (name: string | null) =>
  (name || "?").trim().split(/\s+/).map((n) => n[0]).join("").toUpperCase().slice(0, 2)

const memberSince = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })

const relativeDate = (d: string) => {
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000)
  if (days === 0) return "Aujourd'hui"
  if (days === 1) return "Il y a 1 jour"
  if (days < 7) return `Il y a ${days} jours`
  const w = Math.floor(days / 7)
  if (days < 30) return `Il y a ${w} semaine${w > 1 ? "s" : ""}`
  const m = Math.floor(days / 30)
  if (days < 365) return `Il y a ${m} mois`
  const y = Math.floor(days / 365)
  return `Il y a ${y} an${y > 1 ? "s" : ""}`
}

/* ─── Sub-components ─────────────────────────────────────────── */
function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const sz = size === "md" ? "w-4 h-4" : "w-3 h-3"
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className={`${sz} ${i <= Math.round(rating) ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function Spinner({ cls = "w-5 h-5" }: { cls?: string }) {
  return (
    <svg className={`${cls} animate-spin text-[#FA8112]`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function ProfilePage() {
  const router = useRouter()
  const supabase = useRef(createClient()).current

  const [user, setUser]       = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats]     = useState<Stats>({ orders: 0, sales: 0, reviews: 0, revenue: 0 })
  const [services, setServices] = useState<Service[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [reviews, setReviews]   = useState<Review[]>([])

  const [activeTab, setActiveTab]       = useState<Tab>("services")
  const [loading, setLoading]           = useState(true)
  const [tabLoading, setTabLoading] = useState(false)
  const [uploading, setUploading]   = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [editForm, setEditForm] = useState({ full_name: "", bio: "", wilaya: "", role: "" })

  const avatarRef = useRef<HTMLInputElement>(null)
  const coverRef  = useRef<HTMLInputElement>(null)

  /* ── Init: auth + profile + stats ── */
  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace("/login"); return }
      setUser(user)

      const { data: prof } = await supabase
        .from("profiles").select("*").eq("id", user.id).single()

      if (prof) {
        setProfile(prof)
        setEditForm({
          full_name: prof.full_name || "",
          bio: prof.bio || "",
          wilaya: prof.wilaya || "",
          role: prof.role || "",
        })
      }

      const [a, b, c, d] = await Promise.allSettled([
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("seller_id", user.id),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("seller_id", user.id).eq("status", "completed"),
        supabase.from("reviews").select("id", { count: "exact", head: true }).eq("seller_id", user.id),
        supabase.from("orders").select("total_price").eq("seller_id", user.id).in("status", ["completed", "paid"]),
      ])

      setStats({
        orders:  a.status === "fulfilled" ? (a.value.count ?? 0) : 0,
        sales:   b.status === "fulfilled" ? (b.value.count ?? 0) : 0,
        reviews: c.status === "fulfilled" ? (c.value.count ?? 0) : 0,
        revenue: d.status === "fulfilled"
          ? ((d.value.data ?? []) as { total_price: number | null }[])
              .reduce((s, o) => s + (o.total_price ?? 0), 0)
          : 0,
      })

      setLoading(false)
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ── Tab data ── */
  useEffect(() => {
    if (!user || activeTab === "parametres") return
    ;(async () => {
      setTabLoading(true)
      if (activeTab === "services") {
        const { data } = await supabase.from("services")
          .select("id, title, price, rating, review_count, category, cover_url")
          .eq("seller_id", user.id).order("created_at", { ascending: false })
        setServices(data ?? [])
      } else if (activeTab === "produits") {
        const { data } = await supabase.from("digital_products")
          .select("id, title, price, sales_count, format, cover_url")
          .eq("seller_id", user.id).order("created_at", { ascending: false })
        setProducts(data ?? [])
      } else if (activeTab === "avis") {
        const { data } = await supabase.from("reviews")
          .select("id, rating, comment, created_at, reviewer_name, reviewer_initials, reviewer_avatar")
          .eq("seller_id", user.id).order("created_at", { ascending: false })
        setReviews(data ?? [])
      }
      setTabLoading(false)
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user])

  /* ── Avatar upload ── */
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    const supabase = createClient()
    const fileExt = file.name.split(".").pop()
    const fileName = `${user.id}-avatar-${Date.now()}.${fileExt}`
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, { upsert: true })
    if (uploadError) return
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(fileName)
    await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id)
    setProfile((prev) => prev ? { ...prev, avatar_url: publicUrl + "?t=" + Date.now() } : null)
  }

  /* ── Cover upload ── */
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    const supabase = createClient()
    const fileExt = file.name.split(".").pop()
    const fileName = `${user.id}-cover-${Date.now()}.${fileExt}`
    const { error: uploadError } = await supabase.storage
      .from("covers")
      .upload(fileName, file, { upsert: true })
    if (uploadError) return
    const { data: { publicUrl } } = supabase.storage.from("covers").getPublicUrl(fileName)
    await supabase.from("profiles").update({ cover_url: publicUrl }).eq("id", user.id)
    setProfile((prev) => prev ? { ...prev, cover_url: publicUrl + "?t=" + Date.now() } : null)
  }

  /* ── Save profile edit ── */
  const openEdit = () => {
    setEditForm({
      full_name: profile?.full_name || "",
      bio: profile?.bio || "",
      wilaya: profile?.wilaya || "",
      role: profile?.role || "",
    })
    setShowEdit(true)
  }

  const saveProfile = async () => {
    if (!user) return
    setSaving(true)
    await supabase.from("profiles").update(editForm).eq("id", user.id)
    setProfile((p) => p ? { ...p, ...editForm } : p)
    setSaving(false)
    setShowEdit(false)
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-white dark:bg-[#1a1a1a] flex items-center justify-center">
          <Spinner cls="w-10 h-10" />
        </main>
        <Footer />
      </>
    )
  }

  /* ── Derived display values ── */
  const displayName     = profile?.full_name || user?.email?.split("@")[0] || "Utilisateur"
  const displayInitials = getInitials(profile?.full_name ?? null)
  const memberRole      = profile?.role

  const statsCards = [
    { label: "Commandes", value: stats.orders.toLocaleString("fr-FR"),  icon: "📦" },
    { label: "Ventes",    value: stats.sales.toLocaleString("fr-FR"),   icon: "🛒" },
    { label: "Avis",      value: stats.reviews.toLocaleString("fr-FR"), icon: "⭐" },
    {
      label: "Revenus",
      value: stats.revenue > 0 ? `${stats.revenue.toLocaleString("fr-FR")} DA` : "0 DA",
      icon: "💰",
    },
  ]

  const TABS: { id: Tab; label: string; count?: number }[] = [
    { id: "services",   label: "Mes services",  count: services.length   },
    { id: "produits",   label: "Mes produits",  count: products.length   },
    { id: "avis",       label: "Avis",          count: stats.reviews     },
    { id: "parametres", label: "Paramètres"                               },
  ]

  /* ── Render ── */
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FFF8F0] dark:bg-[#1a1a1a] pb-20">

        {/* Hidden file inputs */}
        <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
        <input ref={coverRef}  type="file" accept="image/*" className="hidden" onChange={handleCoverUpload}  />

        {/* ── Cover + Avatar ── */}
        <div className="relative">
          {/* Cover */}
          <div className="h-52 sm:h-64 relative overflow-hidden">
            {!profile?.cover_url && (
              <div className="absolute inset-0 bg-gradient-to-br from-[#FA8112] via-[#E8730F] to-[#D46A0E]">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-amber-300/10 rounded-full blur-3xl" />
              </div>
            )}
            {profile?.cover_url ? (
              <img src={profile.cover_url} alt="Cover" key={profile.cover_url} className="w-full h-full object-cover absolute inset-0" />
            ) : null}

            <button
              onClick={() => coverRef.current?.click()}
              disabled={uploading}
              className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-black/30 backdrop-blur-sm text-white text-xs font-medium rounded-lg border border-white/20 hover:bg-black/50 transition-colors disabled:opacity-60"
            >
              {uploading
                ? <><Spinner cls="w-3.5 h-3.5" /> Envoi...</>
                : <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Modifier la couverture
                  </>
              }
            </button>
          </div>

          {/* Avatar */}
          <div className="absolute left-6 sm:left-10 bottom-0 translate-y-1/2">
            <div className="relative">
              <button
                onClick={() => avatarRef.current?.click()}
                disabled={uploading}
                className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shadow-xl border-4 border-white dark:border-[#1a1a1a] hover:opacity-90 transition-opacity disabled:opacity-70"
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" key={profile.avatar_url} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#FA8112] to-[#E8730F] flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {profile?.full_name?.charAt(0)?.toUpperCase() || "A"}
                    </span>
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Spinner />
                  </div>
                )}
              </button>

              <button
                onClick={() => avatarRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#FA8112] hover:bg-[#E8730F] rounded-xl flex items-center justify-center text-white shadow-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>

              <span className="absolute top-1 right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-[#1a1a1a]" />
            </div>
          </div>
        </div>

        {/* ── Profile info ── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between pt-16 sm:pt-14 mb-6 gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] dark:text-[#FAF3E1]">
                  {displayName}
                </h1>
                {memberRole && memberRole !== "buyer" && memberRole !== "seller" && (
                  <span className="px-3 py-1 bg-[#FA8112]/15 dark:bg-[#FA8112]/20 text-[#FA8112] text-xs font-bold rounded-full">
                    {memberRole}
                  </span>
                )}
                {memberRole === "seller" && (
                  <span className="px-3 py-1 bg-[#FA8112]/15 dark:bg-[#FA8112]/20 text-[#FA8112] text-xs font-bold rounded-full">
                    Vendeur
                  </span>
                )}
              </div>

              {profile?.bio && (
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 max-w-lg leading-relaxed">
                  {profile.bio}
                </p>
              )}

              <div className="flex items-center gap-4 mt-2 flex-wrap text-sm text-gray-500 dark:text-gray-400">
                {profile?.rating != null && (
                  <div className="flex items-center gap-1.5">
                    <Stars rating={profile.rating} size="md" />
                    <span className="font-bold text-[#1A1A1A] dark:text-[#FAF3E1]">{profile.rating.toFixed(1)}</span>
                    <span>({stats.reviews} avis)</span>
                  </div>
                )}
                {profile?.wilaya && (
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-[#FA8112]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {profile.wilaya}, Algérie
                  </div>
                )}
                {profile?.created_at && (
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Membre depuis {memberSince(profile.created_at)}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 shrink-0">
              <button className="px-5 py-2.5 border-2 border-[#F0E8E0] dark:border-[#3a3a3a] text-[#1A1A1A] dark:text-[#FAF3E1] text-sm font-semibold rounded-xl hover:border-[#FA8112]/40 hover:text-[#FA8112] transition-all">
                Message
              </button>
              <button
                onClick={openEdit}
                className="px-5 py-2.5 bg-[#FA8112] hover:bg-[#E8730F] text-white text-sm font-semibold rounded-xl transition-all hover:scale-105 shadow-lg shadow-[#FA8112]/30"
              >
                Modifier le profil
              </button>
            </div>
          </div>

          {/* ── Stats ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {statsCards.map((s) => (
              <div
                key={s.label}
                className="bg-white dark:bg-[#2a2a2a] rounded-2xl border border-[#F0E8E0] dark:border-[#3a3a3a] p-4 text-center hover:border-[#FA8112]/30 hover:shadow-lg hover:shadow-[#FA8112]/10 transition-all"
              >
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-xl sm:text-2xl font-extrabold text-[#1A1A1A] dark:text-[#FAF3E1]">{s.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── Tabs nav ── */}
          <div className="flex gap-1 bg-[#F0E8E0] dark:bg-[#2a2a2a] p-1 rounded-2xl mb-8 overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-max flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-[#1a1a1a] text-[#FA8112] shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-[#1A1A1A] dark:hover:text-[#FAF3E1]"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold ${
                    activeTab === tab.id
                      ? "bg-[#FA8112]/15 text-[#FA8112]"
                      : "bg-white dark:bg-[#3a3a3a] text-gray-500 dark:text-gray-400"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── Tab content ── */}
          {tabLoading ? (
            <div className="flex justify-center py-20"><Spinner cls="w-8 h-8" /></div>
          ) : (
            <>
              {/* Services */}
              {activeTab === "services" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {services.map((s, i) => (
                    <div key={s.id} className="group bg-white dark:bg-[#2a2a2a] rounded-2xl border border-[#F0E8E0] dark:border-[#3a3a3a] hover:border-[#FA8112]/30 hover:shadow-xl hover:shadow-[#FA8112]/10 transition-all overflow-hidden">
                      <div
                        className={`h-36 relative overflow-hidden ${!s.cover_url ? `bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]}` : ""}`}
                        style={s.cover_url ? { backgroundImage: `url(${s.cover_url})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
                      >
                        {s.category && (
                          <span className="absolute top-3 left-3 px-2 py-0.5 bg-black/30 backdrop-blur-sm text-white text-xs rounded-lg">{s.category}</span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-semibold text-[#1A1A1A] dark:text-[#FAF3E1] mb-2 group-hover:text-[#FA8112] transition-colors line-clamp-2">{s.title}</h3>
                        {s.rating != null && (
                          <div className="flex items-center gap-1.5 mb-3">
                            <Stars rating={s.rating} />
                            <span className="text-xs text-gray-500 dark:text-gray-400">{s.rating} ({s.review_count ?? 0})</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-[#1A1A1A] dark:text-[#FAF3E1]">
                            {s.price.toLocaleString("fr-FR")} <span className="text-[#FA8112]">DA</span>
                          </span>
                          <button className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 border border-[#F0E8E0] dark:border-[#3a3a3a] rounded-lg hover:border-[#FA8112]/40 hover:text-[#FA8112] transition-all">
                            Modifier
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add service card */}
                  <button className="flex flex-col items-center justify-center gap-3 bg-white dark:bg-[#2a2a2a] rounded-2xl border-2 border-dashed border-[#F0E8E0] dark:border-[#3a3a3a] hover:border-[#FA8112]/40 hover:bg-[#FA8112]/5 dark:hover:bg-[#FA8112]/10 transition-all p-8 group min-h-[180px]">
                    <div className="w-12 h-12 rounded-xl bg-[#FFF8F0] dark:bg-[#1a1a1a] group-hover:bg-[#FA8112]/15 flex items-center justify-center transition-colors">
                      <svg className="w-6 h-6 text-gray-400 group-hover:text-[#FA8112] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-[#FA8112] transition-colors">Ajouter un service</span>
                  </button>
                </div>
              )}

              {/* Products */}
              {activeTab === "produits" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {products.map((p, i) => (
                    <div key={p.id} className="group bg-white dark:bg-[#2a2a2a] rounded-2xl border border-[#F0E8E0] dark:border-[#3a3a3a] hover:border-[#FA8112]/30 hover:shadow-xl hover:shadow-[#FA8112]/10 transition-all overflow-hidden">
                      <div
                        className={`h-36 relative overflow-hidden ${!p.cover_url ? `bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]}` : ""}`}
                        style={p.cover_url ? { backgroundImage: `url(${p.cover_url})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
                      >
                        {p.format && (
                          <span className="absolute bottom-3 left-3 px-2 py-0.5 bg-black/30 backdrop-blur-sm text-white text-xs rounded-lg">{p.format}</span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-semibold text-[#1A1A1A] dark:text-[#FAF3E1] mb-1 line-clamp-2 group-hover:text-[#FA8112] transition-colors">{p.title}</h3>
                        <p className="text-xs text-gray-400 mb-3">
                          {p.sales_count ?? 0} vente{(p.sales_count ?? 0) !== 1 ? "s" : ""}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-[#1A1A1A] dark:text-[#FAF3E1]">
                            {p.price.toLocaleString("fr-FR")} <span className="text-[#FA8112]">DA</span>
                          </span>
                          <button className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 border border-[#F0E8E0] dark:border-[#3a3a3a] rounded-lg hover:border-[#FA8112]/40 hover:text-[#FA8112] transition-all">
                            Modifier
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button className="flex flex-col items-center justify-center gap-3 bg-white dark:bg-[#2a2a2a] rounded-2xl border-2 border-dashed border-[#F0E8E0] dark:border-[#3a3a3a] hover:border-[#FA8112]/40 hover:bg-[#FA8112]/5 dark:hover:bg-[#FA8112]/10 transition-all p-8 group min-h-[180px]">
                    <div className="w-12 h-12 rounded-xl bg-[#FFF8F0] dark:bg-[#1a1a1a] group-hover:bg-[#FA8112]/15 flex items-center justify-center transition-colors">
                      <svg className="w-6 h-6 text-gray-400 group-hover:text-[#FA8112] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-[#FA8112] transition-colors">Ajouter un produit</span>
                  </button>
                </div>
              )}

              {/* Reviews */}
              {activeTab === "avis" && (
                <div className="space-y-4 max-w-3xl">
                  {reviews.length === 0 ? (
                    <div className="text-center py-20">
                      <div className="text-4xl mb-3">⭐</div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Aucun avis reçu pour l'instant.</p>
                    </div>
                  ) : reviews.map((r) => (
                    <div key={r.id} className="bg-white dark:bg-[#2a2a2a] rounded-2xl border border-[#F0E8E0] dark:border-[#3a3a3a] p-6 hover:border-[#FA8112]/30 hover:shadow-lg hover:shadow-[#FA8112]/10 transition-all">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FA8112] to-[#E8730F] flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden">
                          {r.reviewer_avatar
                            ? <img src={r.reviewer_avatar} alt="" className="w-full h-full object-cover" />
                            : (r.reviewer_initials || "?")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="font-semibold text-[#1A1A1A] dark:text-[#FAF3E1] text-sm">
                                {r.reviewer_name || "Anonyme"}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Stars rating={r.rating} />
                                <span className="text-xs text-gray-400">{relativeDate(r.created_at)}</span>
                              </div>
                            </div>
                          </div>
                          {r.comment && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">{r.comment}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Settings */}
              {activeTab === "parametres" && (
                <div className="max-w-2xl space-y-6">
                  <div className="bg-white dark:bg-[#2a2a2a] rounded-2xl border border-[#F0E8E0] dark:border-[#3a3a3a] p-6">
                    <h3 className="font-bold text-[#1A1A1A] dark:text-[#FAF3E1] mb-5">Informations du compte</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#FAF3E1] mb-1.5">
                          Adresse email
                        </label>
                        <input
                          type="email"
                          readOnly
                          value={user?.email || ""}
                          className="w-full px-4 py-3 rounded-xl border border-[#F0E8E0] dark:border-[#3a3a3a] bg-[#FFF8F0] dark:bg-[#1a1a1a] text-[#1A1A1A] dark:text-[#FAF3E1] text-sm outline-none opacity-70 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-400 mt-1">L'adresse email ne peut pas être modifiée ici.</p>
                      </div>
                      {profile?.created_at && (
                        <div>
                          <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#FAF3E1] mb-1.5">
                            Membre depuis
                          </label>
                          <input
                            readOnly
                            value={memberSince(profile.created_at)}
                            className="w-full px-4 py-3 rounded-xl border border-[#F0E8E0] dark:border-[#3a3a3a] bg-[#FFF8F0] dark:bg-[#1a1a1a] text-[#1A1A1A] dark:text-[#FAF3E1] text-sm outline-none opacity-70 cursor-not-allowed"
                          />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={openEdit}
                      className="mt-5 px-6 py-2.5 bg-[#FA8112] hover:bg-[#E8730F] text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-[#FA8112]/30"
                    >
                      Modifier les informations du profil
                    </button>
                  </div>

                  <div className="bg-white dark:bg-[#2a2a2a] rounded-2xl border border-red-100 dark:border-red-900/30 p-6">
                    <h3 className="font-bold text-red-600 dark:text-red-400 mb-2">Zone de danger</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Une fois votre compte supprimé, toutes vos données seront définitivement perdues.
                    </p>
                    <button className="px-5 py-2.5 border-2 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm font-semibold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      Supprimer mon compte
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Edit profile modal ── */}
        {showEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowEdit(false)}
            />
            <div className="relative w-full max-w-md bg-white dark:bg-[#2a2a2a] rounded-3xl shadow-2xl shadow-[#FA8112]/10 border border-[#F0E8E0] dark:border-[#3a3a3a] p-8 z-10 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-extrabold text-[#1A1A1A] dark:text-[#FAF3E1]">Modifier le profil</h2>
                <button
                  onClick={() => setShowEdit(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Full name */}
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#FAF3E1] mb-1.5">Nom complet</label>
                  <input
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm((f) => ({ ...f, full_name: e.target.value }))}
                    placeholder="Votre nom complet"
                    className="w-full px-4 py-3 rounded-xl border border-[#F0E8E0] dark:border-[#3a3a3a] bg-[#FFF8F0] dark:bg-[#1a1a1a] text-[#1A1A1A] dark:text-[#FAF3E1] placeholder-gray-400 outline-none focus:border-[#FA8112] focus:ring-2 focus:ring-[#FA8112]/20 transition-all text-sm"
                  />
                </div>

                {/* Role / métier */}
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#FAF3E1] mb-1.5">
                    Métier / spécialité <span className="text-gray-400 font-normal">(optionnel)</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.role}
                    onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
                    placeholder="ex: Designer graphique, Développeur web…"
                    className="w-full px-4 py-3 rounded-xl border border-[#F0E8E0] dark:border-[#3a3a3a] bg-[#FFF8F0] dark:bg-[#1a1a1a] text-[#1A1A1A] dark:text-[#FAF3E1] placeholder-gray-400 outline-none focus:border-[#FA8112] focus:ring-2 focus:ring-[#FA8112]/20 transition-all text-sm"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#FAF3E1] mb-1.5">Bio</label>
                  <textarea
                    rows={3}
                    value={editForm.bio}
                    onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))}
                    placeholder="Décrivez votre expérience et vos compétences…"
                    className="w-full px-4 py-3 rounded-xl border border-[#F0E8E0] dark:border-[#3a3a3a] bg-[#FFF8F0] dark:bg-[#1a1a1a] text-[#1A1A1A] dark:text-[#FAF3E1] placeholder-gray-400 outline-none focus:border-[#FA8112] focus:ring-2 focus:ring-[#FA8112]/20 transition-all text-sm resize-none"
                  />
                </div>

                {/* Wilaya */}
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#FAF3E1] mb-1.5">Wilaya</label>
                  <div className="relative">
                    <select
                      value={editForm.wilaya}
                      onChange={(e) => setEditForm((f) => ({ ...f, wilaya: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-[#F0E8E0] dark:border-[#3a3a3a] bg-[#FFF8F0] dark:bg-[#1a1a1a] text-[#1A1A1A] dark:text-[#FAF3E1] outline-none focus:border-[#FA8112] focus:ring-2 focus:ring-[#FA8112]/20 transition-all text-sm appearance-none cursor-pointer"
                    >
                      <option value="">Sélectionnez votre wilaya</option>
                      {WILAYAS.map((w) => (
                        <option key={w.id} value={w.name}>
                          {w.id.toString().padStart(2, "0")} — {w.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowEdit(false)}
                    className="flex-1 py-3 border-2 border-[#F0E8E0] dark:border-[#3a3a3a] text-[#1A1A1A] dark:text-[#FAF3E1] text-sm font-semibold rounded-xl hover:border-[#FA8112]/40 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="flex-1 py-3 bg-[#FA8112] hover:bg-[#E8730F] text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-[#FA8112]/30 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {saving ? <><Spinner cls="w-4 h-4" /> Sauvegarde…</> : "Sauvegarder"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
