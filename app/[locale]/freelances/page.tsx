"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { rankItems } from "@/lib/ranking"
import ServiceCard from "@/components/ServiceCard"
import { detectUserWilaya } from "@/lib/geolocation"
import { WILAYAS, type Wilaya } from "@/lib/wilayas"
import { sortByDistance } from "@/utils/distance"

type Service = {
  id: string
  title: string
  category: string | null
  price: number
  avg_rating: number | null
  rating: number | null
  reviews_count: number | null
  total_orders: number | null
  gallery: string[] | null
  images: string[] | null
  packages: Record<string, { price: number }> | null
  tags: string[] | null
  created_at: string
  seller?: {
    full_name: string | null
    avatar_url: string | null
    wilaya: string | null
  } | null
}

type ServiceWithWilaya = Service & { wilaya?: string | null }

const SORT_OPTIONS = [
  { id: "relevance",  label: "Pertinence"       },
  { id: "rating",     label: "Mieux notés"       },
  { id: "price_asc",  label: "Prix croissant"    },
  { id: "price_desc", label: "Prix décroissant"  },
  { id: "distance",   label: "Près de moi"       },
]

// Position maximale du curseur = pas de limite haute
const SLIDER_MAX = 500_000

const PRICE_INPUT_CLS = "w-full pl-2 pr-7 py-1.5 text-xs rounded-lg border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] bg-[var(--cream)] dark:bg-[var(--color-bg)] text-[var(--ink)] dark:text-[var(--ink)] outline-none focus:border-[var(--orange)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} className={`w-3 h-3 ${i <= Math.floor(rating) ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

type FilterPanelProps = {
  categories: string[]
  category: string
  setCategory: (c: string) => void
  minRating: number
  setMinRating: (r: number) => void
  minInput: string
  handleMinInput: (v: string) => void
  maxInput: string
  handleMaxInput: (v: string) => void
  priceRangeError: boolean
  sliderValue: number
  handleSlider: (v: number) => void
  maxPrice: number
  handleReset: () => void
}

function FilterPanel({
  categories, category, setCategory,
  minRating, setMinRating,
  minInput, handleMinInput,
  maxInput, handleMaxInput,
  priceRangeError, sliderValue, handleSlider, maxPrice,
  handleReset,
}: FilterPanelProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-[var(--ink)] dark:text-[var(--ink)] mb-3">Catégorie</h3>
        <div className="space-y-1.5">
          <button
            onClick={() => setCategory("all")}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${category === "all" ? "bg-[var(--orange)] text-white font-medium" : "text-gray-600 dark:text-gray-400 hover:bg-[var(--cream)] dark:hover:bg-[#2a2a2a] hover:text-[var(--orange)]"}`}
          >
            Toutes
          </button>
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${category === c ? "bg-[var(--orange)] text-white font-medium" : "text-gray-600 dark:text-gray-400 hover:bg-[var(--cream)] dark:hover:bg-[#2a2a2a] hover:text-[var(--orange)]"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-[var(--ink)] dark:text-[var(--ink)] mb-3">Note minimale</h3>
        <div className="space-y-1.5">
          {[0, 4, 4.5, 4.8].map(r => (
            <button
              key={r}
              onClick={() => setMinRating(r)}
              className={`flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-sm transition-colors ${minRating === r ? "bg-[var(--orange)] text-white" : "text-gray-600 dark:text-gray-400 hover:bg-[var(--cream)] dark:hover:bg-[#2a2a2a] hover:text-[var(--orange)]"}`}
            >
              {r === 0 ? "Toutes" : <><Stars rating={r} /><span>{r}+</span></>}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-[var(--ink)] dark:text-[var(--ink)] mb-3">Budget</h3>

        {/* Champs min / max */}
        <div className="flex gap-2 mb-3">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Min</label>
            <div className="relative">
              <input
                type="number"
                value={minInput}
                onChange={e => handleMinInput(e.target.value)}
                placeholder="0"
                min={0}
                className={PRICE_INPUT_CLS}
              />
              <span className="absolute right-2 inset-y-0 flex items-center text-xs text-gray-400 pointer-events-none">DA</span>
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Max</label>
            <div className="relative">
              <input
                type="number"
                value={maxInput}
                onChange={e => handleMaxInput(e.target.value)}
                placeholder="Illimité"
                min={0}
                className={PRICE_INPUT_CLS}
              />
              <span className="absolute right-2 inset-y-0 flex items-center text-xs text-gray-400 pointer-events-none">DA</span>
            </div>
          </div>
        </div>

        {priceRangeError && (
          <p className="text-xs text-red-500 mb-2">Le minimum ne peut pas dépasser le maximum.</p>
        )}

        {/* Curseur (contrôle le max) */}
        <input
          type="range"
          min={1000}
          max={SLIDER_MAX}
          step={1000}
          value={sliderValue}
          onChange={e => handleSlider(Number(e.target.value))}
          className="w-full accent-[#FA8112]"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>1 000 DA</span>
          <span>{maxPrice === 0 ? "Illimité" : `${maxPrice.toLocaleString()} DA`}</span>
        </div>
      </div>

      <button
        onClick={handleReset}
        className="w-full py-2.5 text-sm text-gray-500 dark:text-gray-400 hover:text-[var(--orange)] border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] rounded-xl transition-colors"
      >
        Réinitialiser les filtres
      </button>
    </div>
  )
}

export default function FreelancesPage() {
  const [allServices, setAllServices] = useState<Service[]>([])
  const [categories, setCategories]   = useState<string[]>([])
  const [loading, setLoading]         = useState(true)

  const [category, setCategory]       = useState("all")
  const [minRating, setMinRating]     = useState(0)
  const [sort, setSort]               = useState("relevance")
  const [nearMeEnabled, setNearMeEnabled] = useState(false)
  const [userWilaya, setUserWilaya]   = useState<Wilaya | null>(null)
  const [locLoading, setLocLoading]   = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Prix min/max effectifs pour le filtre (0 = pas de limite)
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(0)

  // Valeurs affichées dans les champs texte (string pour autoriser le vide)
  const [minInput, setMinInput] = useState("")
  const [maxInput, setMaxInput] = useState("")

  const minTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (minTimerRef.current) clearTimeout(minTimerRef.current)
      if (maxTimerRef.current) clearTimeout(maxTimerRef.current)
    }
  }, [])

  useEffect(() => {
    const cached = localStorage.getItem("userWilaya")
    if (cached) { try { setUserWilaya(JSON.parse(cached)) } catch { /* ignore */ } }

    createClient()
      .from("services")
      .select(`
        id, title, category, price, avg_rating, rating, reviews_count, total_orders,
        gallery, images, packages, tags, created_at,
        seller:profiles!services_seller_id_fkey(full_name, avatar_url, wilaya)
      `)
      .eq("is_active", true)
      .limit(100)
      .then(({ data }) => {
        if (data) {
          const ranked = rankItems(data as unknown as Service[])
          setAllServices(ranked)
          const cats = [...new Set(ranked.map(s => s.category).filter(Boolean))] as string[]
          setCategories(cats)
        }
        setLoading(false)
      })
  }, [])

  // Slider → immédiat (pas de debounce)
  const handleSlider = (v: number) => {
    if (maxTimerRef.current) clearTimeout(maxTimerRef.current)
    const isAtMax = v >= SLIDER_MAX
    const newMax = isAtMax ? 0 : v
    setMaxPrice(newMax)
    setMaxInput(isAtMax ? "" : String(v))
  }

  // Saisie min → debounce 400 ms
  const handleMinInput = (raw: string) => {
    setMinInput(raw)
    if (minTimerRef.current) clearTimeout(minTimerRef.current)
    minTimerRef.current = setTimeout(() => {
      if (raw === "") { setMinPrice(0); return }
      const v = parseInt(raw, 10)
      if (!isNaN(v) && v >= 0) setMinPrice(v)
    }, 400)
  }

  // Saisie max → debounce 400 ms; vide = illimité
  const handleMaxInput = (raw: string) => {
    setMaxInput(raw)
    if (maxTimerRef.current) clearTimeout(maxTimerRef.current)
    maxTimerRef.current = setTimeout(() => {
      if (raw === "") { setMaxPrice(0); return }
      const v = parseInt(raw, 10)
      if (!isNaN(v) && v >= 0) setMaxPrice(v)
    }, 400)
  }

  const handleNearMe = async () => {
    if (nearMeEnabled) { setNearMeEnabled(false); setSort("relevance"); return }
    if (userWilaya) { setNearMeEnabled(true); setSort("distance"); return }
    setLocLoading(true)
    const w = await detectUserWilaya()
    setLocLoading(false)
    if (w) { setUserWilaya(w); setNearMeEnabled(true); setSort("distance") }
  }

  const handleReset = () => {
    setCategory("all")
    setMinRating(0)
    setMinPrice(0)
    setMaxPrice(0)
    setMinInput("")
    setMaxInput("")
    setSort("relevance")
    setNearMeEnabled(false)
  }

  const priceRangeError = minPrice > 0 && maxPrice > 0 && minPrice > maxPrice

  // Valeur du curseur : 0 (illimité) → position max du slider
  const sliderValue = maxPrice === 0 ? SLIDER_MAX : Math.min(maxPrice, SLIDER_MAX)

  const filtered = useMemo(() => {
    let list: Service[] = allServices.filter(s => {
      if (category !== "all" && s.category !== category) return false
      if ((s.avg_rating ?? s.rating ?? 0) < minRating) return false
      if (minPrice > 0 && s.price < minPrice) return false
      if (maxPrice > 0 && s.price > maxPrice) return false
      return true
    })

    if (sort === "rating") {
      list = [...list].sort((a, b) => Number(b.avg_rating ?? b.rating ?? 0) - Number(a.avg_rating ?? a.rating ?? 0))
    } else if (sort === "price_asc") {
      list = [...list].sort((a, b) => a.price - b.price)
    } else if (sort === "price_desc") {
      list = [...list].sort((a, b) => b.price - a.price)
    } else if (sort === "distance" && userWilaya) {
      const withWilaya = list.map(s => ({ ...s, wilaya: s.seller?.wilaya ?? null })) as ServiceWithWilaya[]
      list = sortByDistance(withWilaya, userWilaya, WILAYAS) as Service[]
    }

    return list
  }, [allServices, category, minRating, minPrice, maxPrice, sort, userWilaya])

  const filterPanelProps: FilterPanelProps = {
    categories, category, setCategory,
    minRating, setMinRating,
    minInput, handleMinInput,
    maxInput, handleMaxInput,
    priceRangeError, sliderValue, handleSlider, maxPrice,
    handleReset,
  }

  return (
    <div className="min-h-screen bg-[var(--white)] dark:bg-[var(--color-bg)]">
      <div className="bg-[var(--cream)] dark:bg-[var(--white)] border-b border-[var(--border-subtle)] dark:border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
            <Link href="/" className="hover:text-[var(--orange)] transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-[var(--ink)] dark:text-[var(--ink)]">Services</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[var(--ink)] dark:text-[var(--ink)]">Services</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Trouvez le talent parfait pour votre projet</p>
            </div>
            <Link href="/services/new" className="px-4 py-2.5 bg-[var(--orange)] text-white text-sm font-bold rounded-xl hover:bg-[var(--orange-dark)] transition-colors shadow-md shadow-[var(--orange)]/30">
              + Publier un service
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {loading ? "Chargement…" : <><strong className="text-[var(--ink)] dark:text-[var(--ink)]">{filtered.length}</strong> services trouvés</>}
            </span>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:border-[var(--orange)]/40 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filtres
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleNearMe}
              disabled={locLoading}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${nearMeEnabled ? "bg-[var(--orange)] text-white shadow-md shadow-[var(--orange)]/30" : "border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] text-gray-600 dark:text-gray-400 hover:border-[var(--orange)]/40 hover:text-[var(--orange)]"}`}
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

            <div className="relative">
              <select
                value={sort}
                onChange={e => { setSort(e.target.value); if (e.target.value !== "distance") setNearMeEnabled(false) }}
                className="pl-3 pr-8 py-2 rounded-xl border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] bg-[var(--white)] dark:bg-[var(--color-bg)] text-[var(--ink)] dark:text-[var(--ink)] text-sm outline-none focus:border-[var(--orange)] appearance-none cursor-pointer"
              >
                {SORT_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
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
            <div className="sticky top-6 bg-[var(--white)] dark:bg-[var(--surface-3)] rounded-2xl border border-[var(--border-subtle)] dark:border-[var(--border-strong)] p-5 shadow-sm dark:shadow-[var(--shadow-elevation)]">
              <h2 className="font-semibold text-[var(--ink)] dark:text-[var(--ink)] mb-5">Filtres</h2>
              <FilterPanel {...filterPanelProps} />
            </div>
          </aside>

          {/* Mobile overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
              <div className="absolute left-0 top-0 bottom-0 w-72 bg-[var(--white)] dark:bg-[var(--white)] overflow-y-auto p-5 shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-semibold text-[var(--ink)] dark:text-[var(--ink)]">Filtres</h2>
                  <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <FilterPanel {...filterPanelProps} />
              </div>
            </div>
          )}

          {/* Grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-72 bg-gray-100 dark:bg-[var(--white)] rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-[var(--cream)] dark:bg-[var(--white)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[var(--ink)] dark:text-[var(--ink)] mb-1">Aucun service trouvé</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Essayez de modifier vos filtres.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map(s => <ServiceCard key={s.id} service={s} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
