"use client"

import { useState, useEffect, useMemo } from "react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { rankItems } from "@/lib/ranking"
import ProductCard from "@/components/ProductCard"

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
  seller?: { full_name: string | null; avatar_url: string | null } | null
}

const SORT_OPTIONS = [
  { id: "relevance",  label: "Pertinence"      },
  { id: "price_asc",  label: "Prix croissant"  },
  { id: "price_desc", label: "Prix décroissant" },
  { id: "rating",     label: "Mieux notés"     },
  { id: "popular",    label: "Populaires"      },
]

export default function MarketplacePage() {
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [categories, setCategories]   = useState<string[]>([])
  const [loading, setLoading]         = useState(true)

  const [activeCategory, setActiveCategory] = useState("Tout")
  const [sort, setSort]                     = useState("relevance")
  const [showFreeOnly, setShowFreeOnly]     = useState(false)
  const [maxPrice, setMaxPrice]             = useState(50000)

  useEffect(() => {
    createClient()
      .from("digital_products")
      .select(`
        id, title, category, price, is_free, avg_rating, rating, reviews_count,
        sales_count, downloads, preview_urls, preview_images, format, file_format, license, tags, created_at,
        seller:profiles!digital_products_seller_id_fkey(full_name, avatar_url)
      `)
      .eq("is_active", true)
      .limit(100)
      .then(({ data }) => {
        if (data) {
          const ranked = rankItems(data as unknown as Product[])
          setAllProducts(ranked)
          const cats = [...new Set(ranked.map(p => p.category).filter(Boolean))] as string[]
          setCategories(cats)
        }
        setLoading(false)
      })
  }, [])

  const filtered = useMemo(() => {
    let list = allProducts.filter(p => {
      if (activeCategory !== "Tout" && p.category !== activeCategory) return false
      if (showFreeOnly && !p.is_free) return false
      if (!p.is_free && p.price > maxPrice) return false
      return true
    })

    if (sort === "price_asc")  list = [...list].sort((a, b) => a.price - b.price)
    if (sort === "price_desc") list = [...list].sort((a, b) => b.price - a.price)
    if (sort === "rating")     list = [...list].sort((a, b) => Number(b.avg_rating ?? 0) - Number(a.avg_rating ?? 0))
    if (sort === "popular")    list = [...list].sort((a, b) => (b.sales_count ?? b.downloads ?? 0) - (a.sales_count ?? a.downloads ?? 0))

    return list
  }, [allProducts, activeCategory, sort, showFreeOnly, maxPrice])

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[var(--background)] dark:bg-[var(--color-bg)]">
        {/* Hero — orange brand */}
        <div className="relative overflow-hidden bg-[var(--orange)] py-14 px-4 text-center">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 right-20 w-72 h-72 bg-[var(--white)]/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 left-20 w-72 h-72 bg-[var(--white)]/10 rounded-full blur-3xl" />
          </div>
          <div className="relative">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--white)]/15 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-4 border border-white/20">
              Ressources numériques prêtes à télécharger
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Marketplace Numérique</h1>
            <p className="text-white/80 text-lg max-w-lg mx-auto">Templates, icônes, polices, mockups et bien plus — créés par des designers algériens.</p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <Link href="/products/new" className="px-5 py-2.5 bg-[var(--white)] text-[var(--orange)] text-sm font-bold rounded-xl hover:bg-[var(--cream)] transition-colors shadow-md">
                + Vendre un produit
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-6">
            <button
              onClick={() => setActiveCategory("Tout")}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeCategory === "Tout" ? "bg-[var(--orange)] text-white shadow-md shadow-[var(--orange)]/30" : "bg-[var(--white)] dark:bg-[var(--white)] text-gray-600 dark:text-gray-300 border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] hover:border-[var(--orange)]/40 hover:text-[var(--orange)]"}`}
            >
              Tout
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeCategory === cat ? "bg-[var(--orange)] text-white shadow-md shadow-[var(--orange)]/30" : "bg-[var(--white)] dark:bg-[var(--white)] text-gray-600 dark:text-gray-300 border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] hover:border-[var(--orange)]/40 hover:text-[var(--orange)]"}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="relative">
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="pl-3 pr-8 py-2 rounded-xl border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] bg-[var(--white)] dark:bg-[var(--white)] text-[var(--ink)] dark:text-[var(--ink)] text-sm outline-none focus:border-[var(--orange)] appearance-none cursor-pointer"
              >
                {SORT_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
              <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <div onClick={() => setShowFreeOnly(p => !p)} className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${showFreeOnly ? "bg-green-500" : "bg-gray-200 dark:bg-[var(--ink-12)]"}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-[var(--white)] shadow transition-all ${showFreeOnly ? "left-4" : "left-0.5"}`} />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Gratuits uniquement</span>
            </label>

            {!showFreeOnly && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Max:</span>
                <input type="range" min={1000} max={50000} step={500} value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} className="w-28 accent-[#FA8112]" />
                <span className="text-sm font-medium text-[var(--orange)] w-24">{maxPrice.toLocaleString()} DA</span>
              </div>
            )}

            <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
              {loading ? "Chargement…" : <><strong className="text-[var(--ink)] dark:text-[var(--ink)]">{filtered.length}</strong> produits</>}
            </span>
          </div>

          {/* Products grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="h-72 bg-gray-100 dark:bg-[var(--white)] rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-[var(--cream)] dark:bg-[var(--white)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[var(--ink)] dark:text-[var(--ink)] mb-1">Aucun produit trouvé</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Essayez de modifier vos filtres</p>
              <Link href="/products/new" className="text-sm text-[var(--orange)] font-semibold">
                + Vendre votre premier produit
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
