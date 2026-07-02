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
  const [loading, setLoading]   = useState(true)

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
        if (data) setProducts(rankItems(data as unknown as Product[]).slice(0, 4))
        setLoading(false)
      })
  }, [])

  return (
    <section className="py-16 bg-[#FFF8F0] dark:bg-[#2a2a2a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] dark:text-[#FAF3E1]">
              Marketplace numérique
            </h2>
            <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
              Templates, packs et ressources prêts à l&apos;emploi
            </p>
          </div>
          <Link href="/marketplace" className="hidden sm:inline-flex text-sm font-medium text-[#FA8112] hover:text-[#E8730F] transition-colors">
            Voir tout →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-72 bg-gray-100 dark:bg-[#1a1a1a] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">Aucun produit disponible pour le moment</p>
            <Link href="/products/new" className="mt-3 inline-block text-sm text-[#FA8112] font-semibold">
              Soyez le premier à vendre →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </section>
  )
}
