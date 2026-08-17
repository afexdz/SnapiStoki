"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useTranslations } from "next-intl"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { rankItems } from "@/lib/ranking"
import ProductCard from "@/components/ProductCard"
import { detectUserLocation, type UserLocation } from "@/lib/geolocation"
import { sortByProximity } from "@/lib/proximity"

type Product = {
  id: string
  title: string
  category: string | null
  price: number
  is_free: boolean | null
  avg_rating: number | null
  rating: number | null
  reviews_count: number | null
  sales_count: number | null
  downloads: number | null
  preview_urls: string[] | null
  preview_images: string[] | null
  format: string | null
  file_format: string | null
  license: string | null
  tags: string[] | null
  created_at: string
  seller?: {
    full_name: string | null
    avatar_url: string | null
    wilaya: string | null
    location_city: string | null
    location_country: string | null
  } | null
}

const SORT_IDS = ["relevance", "price_asc", "price_desc", "rating", "popular", "distance"] as const
type SortId = typeof SORT_IDS[number]

const SLIDER_MAX = 200_000

export default function MarketplacePage() {
  const t = useTranslations("marketplace")

  // Raw server results (before client-side sort)
  const [rawProducts, setRawProducts] = useState<Product[]>([])
  const [categories, setCategories]   = useState<string[]>([])
  const [loading, setLoading]         = useState(true)

  // Search
  const [query, setQuery]                   = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")

  // Filters
  const [activeCategory, setActiveCategory] = useState("all")
  const [sort, setSort]                     = useState<SortId>("relevance")
  const [showFreeOnly, setShowFreeOnly]     = useState(false)
  const [minPrice, setMinPrice]             = useState(0)
  const [maxPrice, setMaxPrice]             = useState(0)
  const [minInput, setMinInput]             = useState("")
  const [maxInput, setMaxInput]             = useState("")

  // Near-me
  const [nearMeEnabled, setNearMeEnabled] = useState(false)
  const [userLocation, setUserLocation]   = useState<UserLocation | null>(null)
  const [locLoading, setLocLoading]       = useState(false)

  // Debounce refs
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const minTimer    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const maxTimer    = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    if (minTimer.current)    clearTimeout(minTimer.current)
    if (maxTimer.current)    clearTimeout(maxTimer.current)
  }, [])

  useEffect(() => {
    const cached = localStorage.getItem("userLocation")
    if (cached) { try { setUserLocation(JSON.parse(cached)) } catch { /* ignore */ } }
  }, [])

  // Fetch distinct categories once (not affected by filters)
  useEffect(() => {
    createClient()
      .from("digital_products")
      .select("category")
      .eq("is_active", true)
      .then(({ data }) => {
        if (data) {
          const cats = [...new Set(data.map(p => p.category).filter(Boolean))] as string[]
          setCategories(cats)
        }
      })
  }, [])

  // Main fetch — server-side filtering on every relevant state change
  useEffect(() => {
    setLoading(true)

    let q = createClient()
      .from("digital_products")
      .select(`
        id, title, category, price, is_free, avg_rating, rating, reviews_count,
        sales_count, downloads, preview_urls, preview_images, format, file_format,
        license, tags, created_at,
        seller:profiles!digital_products_seller_id_fkey(full_name, avatar_url, wilaya, location_city, location_country)
      `)
      .eq("is_active", true)

    // Full-text search on title + description (ilike, case-insensitive)
    const term = debouncedQuery.trim()
    if (term) {
      q = q.or(`title.ilike.%${term}%,description.ilike.%${term}%`)
    }

    // Category
    if (activeCategory !== "all") {
      q = q.eq("category", activeCategory)
    }

    // Free-only vs price range
    if (showFreeOnly) {
      q = q.eq("is_free", true)
    } else if (minPrice > 0 || maxPrice > 0) {
      // Free products always pass price filters; only paid products are bounded
      const paid: string[] = ["is_free.eq.false"]
      if (minPrice > 0) paid.push(`price.gte.${minPrice}`)
      if (maxPrice > 0) paid.push(`price.lte.${maxPrice}`)
      q = q.or(`is_free.eq.true,and(${paid.join(",")})`)
    }

    q.limit(200).then(({ data }) => {
      setRawProducts((data ?? []) as unknown as Product[])
      setLoading(false)
    })
  }, [debouncedQuery, activeCategory, showFreeOnly, minPrice, maxPrice])

  // Sort is applied client-side so we don't re-fetch on every sort change
  const products = useMemo(() => {
    const list = [...rawProducts]
    if (sort === "price_asc")  return list.sort((a, b) => a.price - b.price)
    if (sort === "price_desc") return list.sort((a, b) => b.price - a.price)
    if (sort === "rating")     return list.sort((a, b) => Number(b.avg_rating ?? 0) - Number(a.avg_rating ?? 0))
    if (sort === "popular")    return list.sort((a, b) => (b.sales_count ?? b.downloads ?? 0) - (a.sales_count ?? a.downloads ?? 0))
    if (sort === "distance" && userLocation) return sortByProximity(list, userLocation)
    return rankItems(list) // "relevance"
  }, [rawProducts, sort, userLocation])

  /* ── Input handlers ─────────────────────────────────────────── */

  const handleQueryChange = (raw: string) => {
    setQuery(raw)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => setDebouncedQuery(raw), 400)
  }

  const handleSlider = (v: number) => {
    if (maxTimer.current) clearTimeout(maxTimer.current)
    const isAtMax = v >= SLIDER_MAX
    setMaxPrice(isAtMax ? 0 : v)
    setMaxInput(isAtMax ? "" : String(v))
  }

  const handleMinInput = (raw: string) => {
    setMinInput(raw)
    if (minTimer.current) clearTimeout(minTimer.current)
    minTimer.current = setTimeout(() => {
      if (raw === "") { setMinPrice(0); return }
      const v = parseInt(raw, 10)
      if (!isNaN(v) && v >= 0) setMinPrice(v)
    }, 400)
  }

  const handleMaxInput = (raw: string) => {
    setMaxInput(raw)
    if (maxTimer.current) clearTimeout(maxTimer.current)
    maxTimer.current = setTimeout(() => {
      if (raw === "") { setMaxPrice(0); return }
      const v = parseInt(raw, 10)
      if (!isNaN(v) && v >= 0) setMaxPrice(v)
    }, 400)
  }

  const handleNearMe = async () => {
    if (nearMeEnabled) { setNearMeEnabled(false); setSort("relevance"); return }
    if (userLocation) { setNearMeEnabled(true); setSort("distance"); return }
    setLocLoading(true)
    const loc = await detectUserLocation()
    setLocLoading(false)
    if (loc) { setUserLocation(loc); setNearMeEnabled(true); setSort("distance") }
  }

  const priceRangeError = minPrice > 0 && maxPrice > 0 && minPrice > maxPrice
  const sliderValue     = maxPrice === 0 ? SLIDER_MAX : Math.min(maxPrice, SLIDER_MAX)
  const isSearchActive  = debouncedQuery.trim().length > 0

  const inputCls = "w-24 ps-2 pe-7 py-1.5 text-xs rounded-lg border border-[var(--border-subtle)] bg-[var(--white)] text-[var(--ink)] outline-none focus:border-[var(--orange)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[var(--background)] dark:bg-[var(--color-bg)]">

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden bg-[var(--orange)] py-14 px-4 text-center">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 end-20 w-72 h-72 bg-[var(--white)]/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 start-20 w-72 h-72 bg-[var(--white)]/10 rounded-full blur-3xl" />
          </div>
          <div className="relative">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--white)]/15 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-4 border border-white/20">
              {t("hero.badge")}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">{t("hero.title")}</h1>
            <p className="text-white/80 text-lg max-w-lg mx-auto">{t("hero.subtitle")}</p>
            <div className="mt-5 flex items-center justify-center">
              <Link
                href="/products/new"
                className="px-5 py-2.5 bg-[var(--white)] text-[var(--orange)] text-sm font-bold rounded-xl hover:bg-[var(--cream)] transition-colors shadow-md"
              >
                {t("hero.sellCta")}
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* ── Search bar ───────────────────────────────────────────── */}
          <div className="relative mb-6">
            <div className="pointer-events-none absolute inset-y-0 start-3.5 flex items-center">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="search"
              value={query}
              onChange={e => handleQueryChange(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full ps-10 pe-10 py-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--white)] text-[var(--ink)] text-sm outline-none focus:border-[var(--orange)] focus:ring-2 focus:ring-[var(--orange)]/20 transition-all placeholder:text-gray-400 dark:bg-[var(--white)] dark:text-[var(--ink)]"
            />
            {query && (
              <button
                onClick={() => handleQueryChange("")}
                className="absolute inset-y-0 end-3 flex items-center px-1 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Effacer la recherche"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* ── Category tabs ─────────────────────────────────────────── */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-6">
            <button
              onClick={() => setActiveCategory("all")}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeCategory === "all" ? "bg-[var(--orange)] text-white shadow-md shadow-[var(--orange)]/30" : "bg-[var(--white)] dark:bg-[var(--white)] text-gray-600 dark:text-gray-300 border border-[var(--border-subtle)] hover:border-[var(--orange)]/40 hover:text-[var(--orange)]"}`}
            >
              {t("all")}
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeCategory === cat ? "bg-[var(--orange)] text-white shadow-md shadow-[var(--orange)]/30" : "bg-[var(--white)] dark:bg-[var(--white)] text-gray-600 dark:text-gray-300 border border-[var(--border-subtle)] hover:border-[var(--orange)]/40 hover:text-[var(--orange)]"}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* ── Filter bar ────────────────────────────────────────────── */}
          <div className="flex flex-wrap items-end gap-3 mb-6">
            {/* Near-me toggle */}
            <button
              onClick={handleNearMe}
              disabled={locLoading}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${nearMeEnabled ? "bg-[var(--orange)] text-white shadow-md shadow-[var(--orange)]/30" : "border border-[var(--border-subtle)] text-gray-600 dark:text-gray-400 hover:border-[var(--orange)]/40 hover:text-[var(--orange)]"}`}
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
              {nearMeEnabled && userLocation
                ? t("nearCity", { city: userLocation.wilaya?.name ?? userLocation.country ?? "?" })
                : t("nearMe")}
            </button>

            {/* Sort */}
            <div className="relative">
              <select
                value={sort}
                onChange={e => { setSort(e.target.value as SortId); if (e.target.value !== "distance") setNearMeEnabled(false); else if (userLocation) setNearMeEnabled(true) }}
                className="ps-3 pe-8 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--white)] dark:bg-[var(--white)] text-[var(--ink)] dark:text-[var(--ink)] text-sm outline-none focus:border-[var(--orange)] appearance-none cursor-pointer"
              >
                {SORT_IDS.map(id => <option key={id} value={id}>{t(`sort.${id}`)}</option>)}
              </select>
              <div className="absolute inset-y-0 end-2 flex items-center pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Free toggle */}
            <label className="flex items-center gap-2 cursor-pointer self-end pb-0.5">
              <div
                onClick={() => setShowFreeOnly(p => !p)}
                className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${showFreeOnly ? "bg-green-500" : "bg-gray-200 dark:bg-[var(--ink-12)]"}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-[var(--white)] shadow transition-all ${showFreeOnly ? "start-4" : "start-0.5"}`} />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">{t("freeOnly")}</span>
            </label>

            {/* Price range */}
            {!showFreeOnly && (
              <div className="flex flex-wrap items-end gap-2">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t("priceMin")}</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={minInput}
                      onChange={e => handleMinInput(e.target.value)}
                      placeholder="0"
                      min={0}
                      className={inputCls}
                    />
                    <span className="absolute end-2 inset-y-0 flex items-center text-xs text-gray-400 pointer-events-none">DA</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t("priceMax")}</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={maxInput}
                      onChange={e => handleMaxInput(e.target.value)}
                      placeholder={t("unlimited")}
                      min={0}
                      className={`${inputCls} w-28`}
                    />
                    <span className="absolute end-2 inset-y-0 flex items-center text-xs text-gray-400 pointer-events-none">DA</span>
                  </div>
                </div>

                <div className="flex flex-col gap-0.5 self-end pb-0.5">
                  <input
                    type="range"
                    min={1000}
                    max={SLIDER_MAX}
                    step={500}
                    value={sliderValue}
                    onChange={e => handleSlider(Number(e.target.value))}
                    className="w-28 accent-[#FA8112]"
                  />
                  <span className="text-xs text-gray-400 text-end">
                    {maxPrice === 0 ? t("unlimited") : `${maxPrice.toLocaleString()} DA`}
                  </span>
                </div>

                {priceRangeError && (
                  <span className="self-end pb-1 text-xs text-red-500">Min &gt; Max</span>
                )}
              </div>
            )}

            {/* Result count */}
            <span className="ms-auto text-sm text-gray-500 dark:text-gray-400 self-end pb-0.5">
              {loading
                ? <span className="animate-pulse">{t("loading")}</span>
                : <strong className="text-[var(--ink)] dark:text-[var(--ink)]">{t("count", { n: products.length })}</strong>
              }
            </span>
          </div>

          {/* ── Products grid ─────────────────────────────────────────── */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="h-72 bg-gray-100 dark:bg-[var(--white)] rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-[var(--cream)] dark:bg-[var(--white)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              {isSearchActive ? (
                <>
                  <h3 className="text-lg font-semibold text-[var(--ink)] dark:text-[var(--ink)] mb-1">
                    {t("noResults")}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{t("noResultsHint")}</p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-[var(--ink)] dark:text-[var(--ink)] mb-1">
                    {t("empty")}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{t("emptyHint")}</p>
                  <Link href="/products/new" className="text-sm text-[var(--orange)] font-semibold">
                    {t("sellFirst")}
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
