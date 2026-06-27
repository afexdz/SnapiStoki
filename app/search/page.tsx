"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { createClient } from "@/lib/supabase/client"
import { WILAYAS } from "@/lib/wilayas"

/* ─── Types ─────────────────────────────────────────────────── */
type SellerProfile = {
  id: string
  full_name: string | null
  avatar_url: string | null
  wilaya: string | null
  rating: number | null
}

type ServiceResult = {
  id: string
  title: string
  description: string | null
  category: string | null
  price: number
  rating: number | null
  images: string[] | null
  seller_id: string
  profile: SellerProfile | null
}

type ProductResult = {
  id: string
  title: string
  description: string | null
  category: string | null
  price: number
  cover_url: string | null
  format: string | null
  sales_count: number | null
  seller_id: string
  profile: SellerProfile | null
}

type SortKey = "relevance" | "price_asc" | "price_desc" | "rating"

/* ─── Constants ─────────────────────────────────────────────── */
const GRADIENTS = [
  "from-[#FA8112] to-[#E8730F]",
  "from-sky-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-pink-500 to-rose-600",
  "from-violet-500 to-purple-600",
  "from-amber-500 to-orange-600",
]

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "relevance",  label: "Pertinence"       },
  { value: "price_asc",  label: "Prix croissant"   },
  { value: "price_desc", label: "Prix décroissant" },
  { value: "rating",     label: "Mieux notés"      },
]

/* ─── Skeleton ───────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-[#2a2a2a] rounded-2xl border border-[#F0E8E0] dark:border-[#3a3a3a] overflow-hidden animate-pulse">
      <div className="h-40 bg-gray-100 dark:bg-[#3a3a3a]" />
      <div className="p-4 space-y-2.5">
        <div className="h-4 bg-gray-100 dark:bg-[#3a3a3a] rounded-lg w-3/4" />
        <div className="h-3 bg-gray-100 dark:bg-[#3a3a3a] rounded-lg w-1/2" />
        <div className="h-3 bg-gray-100 dark:bg-[#3a3a3a] rounded-lg w-2/3" />
        <div className="h-9 bg-gray-100 dark:bg-[#3a3a3a] rounded-xl mt-3" />
      </div>
    </div>
  )
}

function SkeletonSection() {
  return (
    <div className="space-y-4">
      <div className="h-6 w-48 bg-gray-100 dark:bg-[#3a3a3a] rounded-lg animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  )
}

/* ─── Stars ──────────────────────────────────────────────────── */
function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((i) => (
        <svg key={i} className={`w-3 h-3 ${i <= Math.round(rating) ? "text-amber-400" : "text-gray-200 dark:text-gray-600"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  )
}

/* ─── Avatar ─────────────────────────────────────────────────── */
function Avatar({ url, name, size = 10 }: { url: string | null; name: string | null; size?: number }) {
  const initials = (name || "?").trim().split(/\s+/).map(n => n[0]).join("").toUpperCase().slice(0, 2)
  const cls = `w-${size} h-${size} rounded-xl object-cover`
  if (url) return <img src={url} alt={name ?? ""} className={cls} />
  return (
    <div className={`w-${size} h-${size} rounded-xl bg-gradient-to-br from-[#FA8112] to-[#E8730F] flex items-center justify-center text-white text-xs font-bold shrink-0`}>
      {initials}
    </div>
  )
}

/* ─── Empty state ────────────────────────────────────────────── */
function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="w-16 h-16 mb-4 rounded-2xl bg-[#FFF8F0] dark:bg-[#2a2a2a] flex items-center justify-center">
        <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <p className="text-gray-400 dark:text-gray-500 text-sm font-medium">{label}</p>
    </div>
  )
}

/* ─── Freelancer card ────────────────────────────────────────── */
function FreelancerCard({ svc, index }: { svc: ServiceResult; index: number }) {
  const img = svc.images?.[0]
  const name = svc.profile?.full_name ?? "Freelance"
  return (
    <div className="group bg-white dark:bg-[#2a2a2a] rounded-2xl border border-[#F0E8E0] dark:border-[#3a3a3a] hover:border-[#FA8112]/30 hover:shadow-xl hover:shadow-[#FA8112]/10 transition-all overflow-hidden flex flex-col">
      {/* Cover */}
      <div className={`h-36 relative overflow-hidden shrink-0 ${!img ? `bg-gradient-to-br ${GRADIENTS[index % GRADIENTS.length]}` : ""}`}>
        {img && <img src={img} alt={svc.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />}
        {svc.category && (
          <span className="absolute top-3 left-3 px-2 py-0.5 bg-black/30 backdrop-blur-sm text-white text-xs rounded-lg">
            {svc.category}
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Seller */}
        <div className="flex items-center gap-2">
          <Avatar url={svc.profile?.avatar_url ?? null} name={name} size={7} />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#1A1A1A] dark:text-[#FAF3E1] truncate">{name}</p>
            {svc.profile?.wilaya && (
              <p className="text-xs text-gray-400 truncate flex items-center gap-0.5">
                <svg className="w-3 h-3 shrink-0 text-[#FA8112]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {svc.profile.wilaya}
              </p>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-[#1A1A1A] dark:text-[#FAF3E1] leading-snug line-clamp-2 group-hover:text-[#FA8112] transition-colors flex-1">
          {svc.title}
        </h3>

        {/* Rating + price */}
        <div className="flex items-center justify-between">
          {svc.rating != null && svc.rating > 0 ? (
            <div className="flex items-center gap-1">
              <Stars rating={svc.rating} />
              <span className="text-xs text-gray-400">{svc.rating.toFixed(1)}</span>
            </div>
          ) : <span />}
          <span className="text-sm font-extrabold text-[#1A1A1A] dark:text-[#FAF3E1]">
            {svc.price.toLocaleString("fr-DZ")} <span className="text-[#FA8112] font-bold">DA</span>
          </span>
        </div>

        {/* CTA */}
        <Link
          href={`/profile?seller=${svc.seller_id}`}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-[#FA8112] hover:bg-[#E8730F] text-white text-sm font-semibold rounded-xl transition-colors shadow-md shadow-[#FA8112]/20"
        >
          Voir le profil →
        </Link>
      </div>
    </div>
  )
}

/* ─── Product card ───────────────────────────────────────────── */
function ProductCard({ product, index }: { product: ProductResult; index: number }) {
  return (
    <div className="group bg-white dark:bg-[#2a2a2a] rounded-2xl border border-[#F0E8E0] dark:border-[#3a3a3a] hover:border-[#FA8112]/30 hover:shadow-xl hover:shadow-[#FA8112]/10 transition-all overflow-hidden flex flex-col">
      {/* Thumbnail */}
      <div className={`h-36 relative overflow-hidden shrink-0 ${!product.cover_url ? `bg-gradient-to-br ${GRADIENTS[(index + 2) % GRADIENTS.length]}` : ""}`}>
        {product.cover_url && (
          <img src={product.cover_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        )}
        <div className="absolute inset-0 flex items-end p-3 gap-2">
          {product.category && (
            <span className="px-2 py-0.5 bg-black/30 backdrop-blur-sm text-white text-xs rounded-lg">
              {product.category}
            </span>
          )}
          {product.format && (
            <span className="px-2 py-0.5 bg-[#FA8112]/80 backdrop-blur-sm text-white text-xs rounded-lg font-medium">
              {product.format}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Title */}
        <h3 className="text-sm font-semibold text-[#1A1A1A] dark:text-[#FAF3E1] leading-snug line-clamp-2 group-hover:text-[#FA8112] transition-colors flex-1">
          {product.title}
        </h3>

        {/* Seller + sales */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="truncate max-w-[60%]">
            par {product.profile?.full_name ?? "Vendeur"}
          </span>
          {(product.sales_count ?? 0) > 0 && (
            <span>{product.sales_count} vente{(product.sales_count ?? 0) > 1 ? "s" : ""}</span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between">
          <span className="text-base font-extrabold text-[#1A1A1A] dark:text-[#FAF3E1]">
            {product.price.toLocaleString("fr-DZ")} <span className="text-[#FA8112] font-bold text-sm">DA</span>
          </span>
          <Link
            href="/marketplace"
            className="flex items-center gap-1 px-4 py-2 bg-[#FA8112] hover:bg-[#E8730F] text-white text-xs font-semibold rounded-xl transition-colors shadow-md shadow-[#FA8112]/20"
          >
            Acheter
          </Link>
        </div>
      </div>
    </div>
  )
}

/* ─── Filter bar ─────────────────────────────────────────────── */
function FilterBar({
  sort, onSort,
  filterWilaya, onWilaya,
  filterCategory, onCategory,
  categories,
}: {
  sort: SortKey
  onSort: (v: SortKey) => void
  filterWilaya: string
  onWilaya: (v: string) => void
  filterCategory: string
  onCategory: (v: string) => void
  categories: string[]
}) {
  return (
    <div className="flex flex-wrap gap-3 items-center py-4 border-y border-[#F0E8E0] dark:border-[#3a3a3a]">
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
        </svg>
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Filtres</span>
      </div>

      <select
        value={sort}
        onChange={(e) => onSort(e.target.value as SortKey)}
        className="text-sm px-3 py-1.5 rounded-xl border border-[#F0E8E0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] text-[#1A1A1A] dark:text-[#FAF3E1] outline-none focus:border-[#FA8112] transition-colors cursor-pointer"
      >
        {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      <select
        value={filterWilaya}
        onChange={(e) => onWilaya(e.target.value)}
        className="text-sm px-3 py-1.5 rounded-xl border border-[#F0E8E0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] text-[#1A1A1A] dark:text-[#FAF3E1] outline-none focus:border-[#FA8112] transition-colors cursor-pointer"
      >
        <option value="">Toutes les wilayas</option>
        {WILAYAS.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
      </select>

      {categories.length > 0 && (
        <select
          value={filterCategory}
          onChange={(e) => onCategory(e.target.value)}
          className="text-sm px-3 py-1.5 rounded-xl border border-[#F0E8E0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] text-[#1A1A1A] dark:text-[#FAF3E1] outline-none focus:border-[#FA8112] transition-colors cursor-pointer"
        >
          <option value="">Toutes les catégories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      )}

      {(filterWilaya || filterCategory) && (
        <button
          onClick={() => { onWilaya(""); onCategory("") }}
          className="text-xs text-[#FA8112] hover:text-[#E8730F] font-medium transition-colors"
        >
          Réinitialiser
        </button>
      )}
    </div>
  )
}

/* ─── Main inner component (uses useSearchParams) ────────────── */
function SearchResults() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const q = searchParams.get("q") ?? ""

  const [inputValue, setInputValue] = useState(q)
  const [services, setServices]     = useState<ServiceResult[]>([])
  const [products, setProducts]     = useState<ProductResult[]>([])
  const [loading, setLoading]       = useState(true)

  const [sort, setSort]                     = useState<SortKey>("relevance")
  const [filterWilaya, setFilterWilaya]     = useState("")
  const [filterCategory, setFilterCategory] = useState("")

  /* Fetch on query change */
  useEffect(() => {
    setInputValue(q)
    if (!q.trim()) { setServices([]); setProducts([]); setLoading(false); return }

    setLoading(true)
    const sb = createClient()

    const run = async () => {
      const [svcsResult, prodsResult] = await Promise.allSettled([
        sb.from("services")
          .select("id, title, description, category, price, rating, images, seller_id")
          .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
          .limit(18),
        sb.from("digital_products")
          .select("id, title, description, category, price, cover_url, format, sales_count, seller_id")
          .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
          .limit(18),
      ])

      const rawSvcs  = svcsResult.status  === "fulfilled" ? (svcsResult.value.data  ?? []) : []
      const rawProds = prodsResult.status === "fulfilled" ? (prodsResult.value.data ?? []) : []

      // Batch-fetch all seller profiles in one query
      const sellerIds = [...new Set([
        ...rawSvcs.map((s: { seller_id: string }) => s.seller_id),
        ...rawProds.map((p: { seller_id: string }) => p.seller_id),
      ])].filter(Boolean)

      const profileMap: Record<string, SellerProfile> = {}
      if (sellerIds.length > 0) {
        const { data: profilesRaw } = await sb
          .from("profiles")
          .select("id, full_name, avatar_url, wilaya, rating")
          .in("id", sellerIds)
        for (const p of (profilesRaw ?? [])) profileMap[p.id] = p
      }

      setServices(rawSvcs.map((s: typeof rawSvcs[number]) => ({ ...s, profile: profileMap[s.seller_id] ?? null })))
      setProducts(rawProds.map((p: typeof rawProds[number]) => ({ ...p, profile: profileMap[p.seller_id] ?? null })))
      setLoading(false)
    }

    run()
  }, [q])

  /* Derived: all unique categories */
  const categories = useMemo(() => {
    const cats = new Set<string>()
    services.forEach(s => s.category && cats.add(s.category))
    products.forEach(p => p.category && cats.add(p.category))
    return [...cats].sort()
  }, [services, products])

  /* Filtered + sorted results */
  const sortFn = <T extends { price: number; profile: SellerProfile | null; rating?: number | null }>(items: T[]) =>
    [...items].sort((a, b) => {
      if (sort === "price_asc")  return (a.price ?? 0) - (b.price ?? 0)
      if (sort === "price_desc") return (b.price ?? 0) - (a.price ?? 0)
      if (sort === "rating")     return (b.profile?.rating ?? 0) - (a.profile?.rating ?? 0)
      return 0
    })

  const filteredServices = useMemo(() =>
    sortFn(services.filter(s =>
      (!filterWilaya   || s.profile?.wilaya === filterWilaya) &&
      (!filterCategory || s.category === filterCategory)
    )),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [services, sort, filterWilaya, filterCategory]
  )

  const filteredProducts = useMemo(() =>
    sortFn(products.filter(p => !filterCategory || p.category === filterCategory)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [products, sort, filterCategory]
  )

  const totalCount = filteredServices.length + filteredProducts.length

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = inputValue.trim()
    if (trimmed) router.push(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FFF8F0] dark:bg-[#1a1a1a]">

        {/* Search header */}
        <div className="bg-white dark:bg-[#2a2a2a] border-b border-[#F0E8E0] dark:border-[#3a3a3a] py-6">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <form onSubmit={handleSearch} className="flex items-center gap-3 bg-[#FFF8F0] dark:bg-[#1a1a1a] rounded-xl border border-[#F0E8E0] dark:border-[#3a3a3a] overflow-hidden focus-within:border-[#FA8112] focus-within:ring-2 focus-within:ring-[#FA8112]/20 transition-all">
              <div className="pl-4 text-gray-400 shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Rechercher un service ou un produit…"
                className="flex-1 py-3.5 bg-transparent text-sm text-[#1A1A1A] dark:text-[#FAF3E1] placeholder-gray-400 outline-none"
              />
              <button
                type="submit"
                className="m-1.5 px-5 py-2.5 bg-[#FA8112] hover:bg-[#E8730F] text-white text-sm font-semibold rounded-lg transition-colors shrink-0"
              >
                Rechercher
              </button>
            </form>

            {/* Count */}
            {!loading && q && (
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                {totalCount > 0
                  ? <><span className="font-bold text-[#1A1A1A] dark:text-[#FAF3E1]">{totalCount}</span> résultat{totalCount > 1 ? "s" : ""} pour <span className="font-bold text-[#FA8112]">"{q}"</span></>
                  : <>Aucun résultat pour <span className="font-bold text-[#FA8112]">"{q}"</span></>
                }
              </p>
            )}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

          {/* Filter bar */}
          {!loading && totalCount > 0 && (
            <FilterBar
              sort={sort} onSort={setSort}
              filterWilaya={filterWilaya} onWilaya={setFilterWilaya}
              filterCategory={filterCategory} onCategory={setFilterCategory}
              categories={categories}
            />
          )}

          {loading ? (
            <div className="space-y-12">
              <SkeletonSection />
              <SkeletonSection />
            </div>
          ) : !q.trim() ? (
            /* No query */
            <div className="text-center py-24">
              <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-[#FA8112]/10 flex items-center justify-center">
                <svg className="w-10 h-10 text-[#FA8112]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-[#FAF3E1] mb-2">Que recherchez-vous ?</h2>
              <p className="text-gray-400 text-sm">Tapez un service, une compétence ou un produit digital…</p>
            </div>
          ) : (
            <>
              {/* ── Section 1: Freelances ── */}
              <section>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-black text-[#1A1A1A] dark:text-[#FAF3E1]">Freelances disponibles</h2>
                    {filteredServices.length > 0 && (
                      <span className="px-2.5 py-0.5 bg-[#FA8112]/10 text-[#FA8112] text-xs font-bold rounded-full">
                        {filteredServices.length}
                      </span>
                    )}
                  </div>
                  <Link href="/freelances" className="text-sm text-[#FA8112] hover:text-[#E8730F] font-medium transition-colors">
                    Voir tous →
                  </Link>
                </div>

                {filteredServices.length === 0 ? (
                  <div className="bg-white dark:bg-[#2a2a2a] rounded-2xl border border-[#F0E8E0] dark:border-[#3a3a3a]">
                    <EmptyState label="Aucun freelance trouvé pour cette recherche" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredServices.map((svc, i) => (
                      <FreelancerCard key={svc.id} svc={svc} index={i} />
                    ))}
                  </div>
                )}
              </section>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-[#F0E8E0] dark:bg-[#3a3a3a]" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Produits digitaux</span>
                <div className="flex-1 h-px bg-[#F0E8E0] dark:bg-[#3a3a3a]" />
              </div>

              {/* ── Section 2: Marketplace ── */}
              <section>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-black text-[#1A1A1A] dark:text-[#FAF3E1]">Produits digitaux</h2>
                    {filteredProducts.length > 0 && (
                      <span className="px-2.5 py-0.5 bg-[#FA8112]/10 text-[#FA8112] text-xs font-bold rounded-full">
                        {filteredProducts.length}
                      </span>
                    )}
                  </div>
                  <Link href="/marketplace" className="text-sm text-[#FA8112] hover:text-[#E8730F] font-medium transition-colors">
                    Voir tout →
                  </Link>
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="bg-white dark:bg-[#2a2a2a] rounded-2xl border border-[#F0E8E0] dark:border-[#3a3a3a]">
                    <EmptyState label="Aucun produit trouvé pour cette recherche" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredProducts.map((p, i) => (
                      <ProductCard key={p.id} product={p} index={i} />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

/* ─── Page export with Suspense (required for useSearchParams) ── */
export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FFF8F0] dark:bg-[#1a1a1a] flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-[#FA8112] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SearchResults />
    </Suspense>
  )
}
