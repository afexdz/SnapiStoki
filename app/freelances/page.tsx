"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { detectUserWilaya } from "@/lib/geolocation"
import { WILAYAS, type Wilaya } from "@/lib/wilayas"
import { sortByDistance } from "@/utils/distance"

type Freelancer = {
  id: number
  initials: string
  name: string
  metier: string
  category: string
  wilaya: string
  rating: number
  reviews: number
  price: number
  color: string
  badge?: string
  tags: string[]
}

const FREELANCERS: Freelancer[] = [
  { id: 1, initials: "KB", name: "Karim Bensalem", metier: "Développeur web ou mobile", category: "tech", wilaya: "Alger", rating: 4.9, reviews: 142, price: 8500, color: "from-[#FA8112] to-[#E8730F]", badge: "Top Vendeur", tags: ["React", "Next.js", "Node.js"] },
  { id: 2, initials: "SM", name: "Sara Mekkaoui", metier: "UI/UX designer", category: "creatif", wilaya: "Oran", rating: 5.0, reviews: 98, price: 12000, color: "from-pink-500 to-rose-500", badge: "Recommandé", tags: ["Figma", "Prototypage", "UX Research"] },
  { id: 3, initials: "AT", name: "Anis Touati", metier: "Motion designer", category: "creatif", wilaya: "Constantine", rating: 4.8, reviews: 76, price: 15000, color: "from-amber-500 to-orange-500", tags: ["After Effects", "Cinema 4D", "Premiere"] },
  { id: 4, initials: "LK", name: "Leila Khaldi", metier: "Rédacteur web ou copywriter", category: "contenu", wilaya: "Annaba", rating: 4.7, reviews: 211, price: 5000, color: "from-emerald-500 to-teal-500", badge: "Top Vendeur", tags: ["SEO", "Blog", "Copywriting"] },
  { id: 5, initials: "YR", name: "Youcef Rahmani", metier: "Développeur web ou mobile", category: "tech", wilaya: "Sétif", rating: 4.9, reviews: 53, price: 20000, color: "from-sky-500 to-blue-600", tags: ["Flutter", "React Native", "Firebase"] },
  { id: 6, initials: "NB", name: "Nadia Boudiaf", metier: "Designer graphique", category: "creatif", wilaya: "Blida", rating: 5.0, reviews: 38, price: 9500, color: "from-fuchsia-500 to-purple-600", badge: "Recommandé", tags: ["Illustrator", "Branding", "Logo"] },
  { id: 7, initials: "MH", name: "Mohamed Hadjadj", metier: "Expert SEO", category: "tech", wilaya: "Tizi Ouzou", rating: 4.6, reviews: 67, price: 7000, color: "from-lime-500 to-green-600", tags: ["SEO On-Page", "Audit", "Analytics"] },
  { id: 8, initials: "FR", name: "Fatima Rahmani", metier: "Traducteur", category: "contenu", wilaya: "Béjaïa", rating: 4.8, reviews: 124, price: 4500, color: "from-cyan-500 to-teal-600", tags: ["Arabe", "Français", "Anglais"] },
  { id: 9, initials: "AZ", name: "Ahmed Zeroual", metier: "Consultant marketing", category: "marketing", wilaya: "Alger", rating: 4.7, reviews: 89, price: 11000, color: "from-violet-500 to-purple-600", tags: ["Meta Ads", "Google Ads", "Stratégie"] },
  { id: 10, initials: "HB", name: "Hana Bouchama", metier: "Community manager", category: "contenu", wilaya: "Oran", rating: 4.9, reviews: 56, price: 6000, color: "from-rose-500 to-pink-600", tags: ["Instagram", "TikTok", "Facebook"] },
  { id: 11, initials: "KM", name: "Khalil Messaoudi", metier: "Monteur vidéo", category: "marketing", wilaya: "Constantine", rating: 4.8, reviews: 103, price: 8000, color: "from-orange-500 to-red-500", tags: ["Premiere Pro", "DaVinci", "Reels"] },
  { id: 12, initials: "SB", name: "Sofiane Belkacem", metier: "Data analyst ou consultant tech", category: "tech", wilaya: "Annaba", rating: 4.6, reviews: 41, price: 13000, color: "from-indigo-500 to-blue-700", tags: ["Python", "Power BI", "SQL"] },
]

const CATEGORIES = [
  { id: "all", label: "Tous" },
  { id: "creatif", label: "Créatif" },
  { id: "tech", label: "Tech" },
  { id: "contenu", label: "Contenu" },
  { id: "marketing", label: "Marketing" },
]

const SORT_OPTIONS = [
  { id: "relevance", label: "Pertinence" },
  { id: "rating", label: "Mieux notés" },
  { id: "price_asc", label: "Prix croissant" },
  { id: "price_desc", label: "Prix décroissant" },
  { id: "distance", label: "Près de moi" },
]

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className={`w-3 h-3 ${i <= Math.floor(rating) ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function FreelancesPage() {
  const [category, setCategory] = useState("all")
  const [wilayaFilter, setWilayaFilter] = useState("")
  const [minRating, setMinRating] = useState(0)
  const [maxPrice, setMaxPrice] = useState(25000)
  const [sort, setSort] = useState("relevance")
  const [nearMeEnabled, setNearMeEnabled] = useState(false)
  const [userWilaya, setUserWilaya] = useState<Wilaya | null>(null)
  const [locLoading, setLocLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const cached = localStorage.getItem("userWilaya")
    if (cached) {
      try { setUserWilaya(JSON.parse(cached)) } catch { /* ignore */ }
    }
  }, [])

  const handleNearMe = async () => {
    if (nearMeEnabled) {
      setNearMeEnabled(false)
      setSort("relevance")
      return
    }
    if (userWilaya) {
      setNearMeEnabled(true)
      setSort("distance")
      return
    }
    setLocLoading(true)
    const w = await detectUserWilaya()
    setLocLoading(false)
    if (w) {
      setUserWilaya(w)
      setNearMeEnabled(true)
      setSort("distance")
    }
  }

  const filtered = useMemo(() => {
    let list = FREELANCERS.filter((f) => {
      if (category !== "all" && f.category !== category) return false
      if (wilayaFilter && f.wilaya !== wilayaFilter) return false
      if (f.rating < minRating) return false
      if (f.price > maxPrice) return false
      return true
    })

    if (sort === "rating") {
      list = [...list].sort((a, b) => b.rating - a.rating)
    } else if (sort === "price_asc") {
      list = [...list].sort((a, b) => a.price - b.price)
    } else if (sort === "price_desc") {
      list = [...list].sort((a, b) => b.price - a.price)
    } else if (sort === "distance" && userWilaya) {
      list = sortByDistance(list as (Freelancer & { wilaya?: string | null })[], userWilaya, WILAYAS)
    }

    return list
  }, [category, wilayaFilter, minRating, maxPrice, sort, userWilaya])

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <h3 className="text-sm font-semibold text-[#1A1A1A] dark:text-[#FAF3E1] mb-3">Catégorie</h3>
        <div className="space-y-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${category === c.id ? "bg-[#FA8112] text-white font-medium" : "text-gray-600 dark:text-gray-400 hover:bg-[#FFF8F0] dark:hover:bg-[#2a2a2a] hover:text-[#FA8112]"}`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Wilaya */}
      <div>
        <h3 className="text-sm font-semibold text-[#1A1A1A] dark:text-[#FAF3E1] mb-3">Wilaya</h3>
        <div className="relative">
          <select
            value={wilayaFilter}
            onChange={(e) => setWilayaFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-[#F0E8E0] dark:border-[#3a3a3a] bg-[#FFF8F0] dark:bg-[#1a1a1a] text-[#1A1A1A] dark:text-[#FAF3E1] text-sm outline-none focus:border-[#FA8112] focus:ring-2 focus:ring-[#FA8112]/20 transition-all appearance-none cursor-pointer"
          >
            <option value="">Toutes les wilayas</option>
            {WILAYAS.map((w) => (
              <option key={w.id} value={w.name}>
                {w.id.toString().padStart(2, "0")} — {w.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {wilayaFilter && (
          <button onClick={() => setWilayaFilter("")} className="mt-1.5 text-xs text-[#FA8112] hover:text-[#E8730F]">
            Effacer le filtre wilaya
          </button>
        )}
      </div>

      {/* Min rating */}
      <div>
        <h3 className="text-sm font-semibold text-[#1A1A1A] dark:text-[#FAF3E1] mb-3">Note minimale</h3>
        <div className="space-y-1.5">
          {[0, 4, 4.5, 4.8].map((r) => (
            <button
              key={r}
              onClick={() => setMinRating(r)}
              className={`flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-sm transition-colors ${minRating === r ? "bg-[#FA8112] text-white" : "text-gray-600 dark:text-gray-400 hover:bg-[#FFF8F0] dark:hover:bg-[#2a2a2a] hover:text-[#FA8112]"}`}
            >
              {r === 0 ? "Toutes" : (
                <>
                  <Stars rating={r} />
                  <span>{r}+</span>
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Max price */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[#1A1A1A] dark:text-[#FAF3E1]">Budget max</h3>
          <span className="text-sm font-medium text-[#FA8112]">{maxPrice.toLocaleString()} DA</span>
        </div>
        <input
          type="range"
          min={1000}
          max={25000}
          step={500}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-[#FA8112]"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>1 000 DA</span>
          <span>25 000 DA</span>
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={() => { setCategory("all"); setWilayaFilter(""); setMinRating(0); setMaxPrice(25000); setSort("relevance"); setNearMeEnabled(false) }}
        className="w-full py-2.5 text-sm text-gray-500 dark:text-gray-400 hover:text-[#FA8112] border border-[#F0E8E0] dark:border-[#3a3a3a] rounded-xl transition-colors"
      >
        Réinitialiser les filtres
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-white dark:bg-[#1a1a1a]">
      {/* Header */}
      <div className="bg-[#FFF8F0] dark:bg-[#2a2a2a] border-b border-[#F0E8E0] dark:border-[#3a3a3a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
            <Link href="/" className="hover:text-[#FA8112] transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-[#1A1A1A] dark:text-[#FAF3E1]">Freelances</span>
          </div>
          <h1 className="text-3xl font-bold text-[#1A1A1A] dark:text-[#FAF3E1]">Freelances</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Trouvez le talent parfait pour votre projet</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              <strong className="text-[#1A1A1A] dark:text-[#FAF3E1]">{filtered.length}</strong> freelances trouvés
            </span>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 border border-[#F0E8E0] dark:border-[#3a3a3a] rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:border-[#FA8112]/40 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filtres
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Near me toggle */}
            <button
              onClick={handleNearMe}
              disabled={locLoading}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                nearMeEnabled
                  ? "bg-[#FA8112] text-white shadow-md shadow-[#FA8112]/30"
                  : "border border-[#F0E8E0] dark:border-[#3a3a3a] text-gray-600 dark:text-gray-400 hover:border-[#FA8112]/40 hover:text-[#FA8112]"
              }`}
            >
              {locLoading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
              {nearMeEnabled && userWilaya ? `Près de ${userWilaya.name}` : "Près de moi"}
            </button>

            {/* Sort */}
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); if (e.target.value !== "distance") setNearMeEnabled(false) }}
                className="pl-3 pr-8 py-2 rounded-xl border border-[#F0E8E0] dark:border-[#3a3a3a] bg-white dark:bg-[#1a1a1a] text-[#1A1A1A] dark:text-[#FAF3E1] text-sm outline-none focus:border-[#FA8112] appearance-none cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar — desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-6 bg-white dark:bg-[#2a2a2a] rounded-2xl border border-[#F0E8E0] dark:border-[#3a3a3a] p-5">
              <h2 className="font-semibold text-[#1A1A1A] dark:text-[#FAF3E1] mb-5">Filtres</h2>
              <FilterPanel />
            </div>
          </aside>

          {/* Sidebar — mobile overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
              <div className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-[#2a2a2a] overflow-y-auto p-5 shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-semibold text-[#1A1A1A] dark:text-[#FAF3E1]">Filtres</h2>
                  <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <FilterPanel />
              </div>
            </div>
          )}

          {/* Grid */}
          <div className="flex-1 min-w-0">
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-[#FFF8F0] dark:bg-[#2a2a2a] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[#1A1A1A] dark:text-[#FAF3E1] mb-1">Aucun freelance trouvé</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Essayez de modifier vos filtres.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((f) => (
                  <div
                    key={f.id}
                    className="group bg-white dark:bg-[#2a2a2a] rounded-2xl border border-[#F0E8E0] dark:border-[#3a3a3a] hover:border-[#FA8112]/30 dark:hover:border-[#FA8112]/30 hover:shadow-xl hover:shadow-[#FA8112]/10 transition-all duration-200 overflow-hidden"
                  >
                    {/* Banner */}
                    <div className={`h-20 bg-gradient-to-br ${f.color} relative`}>
                      {f.badge && (
                        <span className="absolute top-3 right-3 px-2 py-0.5 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full border border-white/30">
                          {f.badge}
                        </span>
                      )}
                    </div>

                    <div className="px-5 pb-5">
                      {/* Avatar */}
                      <div className={`-mt-8 w-14 h-14 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-white dark:border-[#2a2a2a]`}>
                        {f.initials}
                      </div>

                      <div className="mt-3">
                        <h3 className="font-semibold text-[#1A1A1A] dark:text-[#FAF3E1] text-sm leading-tight group-hover:text-[#FA8112] transition-colors">
                          {f.name}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{f.metier}</p>
                      </div>

                      {/* Wilaya */}
                      <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                        <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {f.wilaya}
                      </div>

                      {/* Rating */}
                      <div className="mt-2.5 flex items-center gap-1.5">
                        <Stars rating={f.rating} />
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{f.rating}</span>
                        <span className="text-xs text-gray-400">({f.reviews})</span>
                      </div>

                      {/* Tags */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {f.tags.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 bg-[#FFF8F0] dark:bg-[#1a1a1a] text-gray-500 dark:text-gray-400 text-xs rounded-md border border-[#F0E8E0] dark:border-[#3a3a3a]">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Price + CTA */}
                      <div className="mt-4 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-gray-400">À partir de</span>
                          <div className="text-sm font-bold text-[#1A1A1A] dark:text-[#FAF3E1]">
                            {f.price.toLocaleString()} <span className="text-[#FA8112]">DA</span>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-[#FA8112] hover:bg-[#E8730F] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm shadow-[#FA8112]/30">
                          Voir profil
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
