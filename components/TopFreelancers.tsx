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
  const [loading, setLoading] = useState(true)

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
    <section className="py-[88px] bg-[var(--cream)] dark:bg-[var(--white)]">
      <div className="max-w-[1180px] mx-auto px-6">

        {/* Section head */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="inline-block text-[var(--orange)] text-xs font-bold uppercase tracking-widest mb-3 font-jakarta">
              Services
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--ink)] dark:text-[var(--ink)]">
              Les services les plus demandés
            </h2>
            <p className="mt-2 text-[rgba(26,26,26,0.55)] dark:text-gray-400 text-sm max-w-md">
              Les offres les mieux notées et les plus populaires de la plateforme
            </p>
          </div>
          <Link
            href="/freelances"
            className="hidden sm:inline-flex text-sm font-semibold text-[var(--orange)] hover:text-[var(--orange-dark)] transition-colors font-jakarta"
          >
            Voir tous les services →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-72 bg-[var(--white)] dark:bg-[var(--color-bg)] rounded-[14px] animate-pulse" />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-16 bg-[var(--white)] dark:bg-[var(--color-bg)] rounded-[14px] border border-[var(--border-subtle)]">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-[var(--orange-soft)] flex items-center justify-center">
              <svg className="w-7 h-7 text-[var(--orange)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="text-[rgba(26,26,26,0.55)] text-sm mb-3">Soyez le premier à publier un service</p>
            <Link
              href="/services/new"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[var(--orange)] hover:bg-[var(--orange-dark)] text-white text-sm font-semibold rounded-[10px] transition-all hover:-translate-y-px shadow-[0_4px_12px_rgba(250,129,18,0.35)] font-jakarta"
            >
              Publier un service →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((s, i) => (
              <ServiceCard key={s.id} service={s} isBestSeller={i === 0 && (s.total_orders ?? 0) > 0} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
