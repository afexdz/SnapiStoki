"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { rankItems } from "@/lib/ranking"
import ServiceCard from "@/components/ServiceCard"

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
  created_at: string
  seller?: { full_name: string | null; avatar_url: string | null; wilaya: string | null } | null
}

export default function TopFreelancers() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    createClient()
      .from("services")
      .select(`
        id, title, category, price, avg_rating, rating, reviews_count, total_orders,
        gallery, images, packages, created_at,
        seller:profiles!services_seller_id_fkey(full_name, avatar_url, wilaya)
      `)
      .eq("is_active", true)
      .limit(20)
      .then(({ data }) => {
        if (data) setServices(rankItems(data as unknown as Service[]).slice(0, 8))
        setLoading(false)
      })
  }, [])

  return (
    <section className="py-16 bg-white dark:bg-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] dark:text-[#FAF3E1]">
              Meilleurs services
            </h2>
            <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
              Les offres les mieux notées de la plateforme
            </p>
          </div>
          <Link href="/freelances" className="hidden sm:inline-flex text-sm font-medium text-[#FA8112] hover:text-[#E8730F] transition-colors">
            Voir tout →
          </Link>
        </div>

        {loading ? (
          <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex-shrink-0 w-64 h-72 bg-gray-100 dark:bg-[#2a2a2a] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">Aucun service disponible pour le moment</p>
            <Link href="/services/new" className="mt-3 inline-block text-sm text-[#FA8112] font-semibold">
              Soyez le premier à publier →
            </Link>
          </div>
        ) : (
          <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
            {services.map(s => (
              <div key={s.id} className="flex-shrink-0 w-64">
                <ServiceCard service={s} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
