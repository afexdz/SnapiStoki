"use client"

import { useState, useEffect } from "react"
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
  created_at: string
  seller?: { full_name: string | null; avatar_url: string | null } | null
}

export default function Marketplace() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    createClient()
      .from("digital_products")
      .select(`
        id, title, category, price, is_free, avg_rating, rating, reviews_count,
        sales_count, downloads, preview_urls, preview_images, format, file_format, license, created_at,
        seller:profiles!digital_products_seller_id_fkey(full_name, avatar_url)
      `)
      .eq("is_active", true)
      .limit(20)
      .then(({ data }) => {
        if (data) setProducts(rankItems(data as unknown as Product[]).slice(0, 8))
        setLoading(false)
      })
  }, [])

  return (
    <section className="py-[88px] bg-[var(--white)] dark:bg-[var(--color-bg)]">
      <div className="max-w-[1180px] mx-auto px-6">

        {/* Section head */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="inline-block text-[var(--orange)] text-xs font-bold uppercase tracking-widest mb-3 font-jakarta">
              Marketplace
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--ink)] dark:text-[var(--ink)]">
              Téléchargez, c&apos;est prêt
            </h2>
            <p className="mt-2 text-[rgba(26,26,26,0.55)] dark:text-gray-400 text-sm max-w-md">
              Templates, packs et ressources digitales prêts à l&apos;emploi
            </p>
          </div>
          <Link
            href="/marketplace"
            className="hidden sm:inline-flex text-sm font-semibold text-[var(--orange)] hover:text-[var(--orange-dark)] transition-colors font-jakarta"
          >
            Voir tous les produits →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-72 bg-gray-100 dark:bg-[var(--white)] rounded-[14px] animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-[var(--cream)] dark:bg-[var(--white)] rounded-[14px] border border-[var(--border-subtle)]">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-[var(--orange-soft)] flex items-center justify-center">
              <svg className="w-7 h-7 text-[var(--orange)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="text-[rgba(26,26,26,0.55)] text-sm mb-3">Aucun produit pour le moment</p>
            <Link
              href="/products/new"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[var(--orange)] hover:bg-[var(--orange-dark)] text-white text-sm font-semibold rounded-[10px] transition-all hover:-translate-y-px shadow-[0_4px_12px_rgba(250,129,18,0.35)] font-jakarta"
            >
              Vendre un produit →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </section>
  )
}
