"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

type Service = {
  id: string
  title: string
  price: number
  status: string
  category: string | null
  image_url: string | null
  created_at: string
}

export default function FreelanceServicesPage() {
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchServices = async () => {
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) { router.push("/login"); return }

    const { data } = await sb
      .from("services")
      .select("id, title, price, status, category, image_url, created_at")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false })

    setServices(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchServices() }, [router])

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce service ? Cette action est irréversible.")) return
    setDeleting(id)
    const sb = createClient()
    await sb.from("services").delete().eq("id", id)
    setServices(prev => prev.filter(s => s.id !== id))
    setDeleting(null)
  }

  const handleToggleStatus = async (id: string, current: string) => {
    const next = current === "active" ? "paused" : "active"
    const sb = createClient()
    await sb.from("services").update({ status: next }).eq("id", id)
    setServices(prev => prev.map(s => s.id === id ? { ...s, status: next } : s))
  }

  const skeleton = Array.from({ length: 3 })

  return (
    <div className="min-h-screen bg-[#FFF8F0] dark:bg-[#1a1a1a]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/freelance" className="p-2 rounded-xl border border-[#F0E8E0] dark:border-[#3a3a3a] text-gray-500 hover:text-[#FA8112] hover:border-[#FA8112]/40 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-extrabold text-[#1A1A1A] dark:text-[#FAF3E1]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Mes services
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {loading ? "…" : `${services.length} service${services.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
          <Link
            href="/services/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FA8112] hover:bg-[#E8730F] text-white text-sm font-semibold rounded-xl shadow-md shadow-[#FA8112]/20 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouveau service
          </Link>
        </div>

        {/* List */}
        <div className="space-y-4">
          {loading
            ? skeleton.map((_, i) => (
                <div key={i} className="bg-white dark:bg-[#2a2a2a] rounded-2xl border border-[#F0E8E0] dark:border-[#3a3a3a] p-5 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-20 h-16 rounded-xl bg-gray-200 dark:bg-[#3a3a3a] shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 w-2/3 bg-gray-200 dark:bg-[#3a3a3a] rounded" />
                      <div className="h-3 w-1/3 bg-gray-100 dark:bg-[#333] rounded" />
                    </div>
                  </div>
                </div>
              ))
            : services.length === 0
              ? (
                <div className="bg-white dark:bg-[#2a2a2a] rounded-2xl border border-[#F0E8E0] dark:border-[#3a3a3a] p-16 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#FFF8F0] dark:bg-[#3a3a3a] flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Aucun service publié</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mb-5">Créez votre premier service pour commencer à recevoir des commandes</p>
                  <Link
                    href="/services/new"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FA8112] hover:bg-[#E8730F] text-white text-sm font-semibold rounded-xl shadow-md shadow-[#FA8112]/20 transition-all"
                  >
                    Publier un service →
                  </Link>
                </div>
              )
              : services.map(service => (
                  <div key={service.id} className="bg-white dark:bg-[#2a2a2a] rounded-2xl border border-[#F0E8E0] dark:border-[#3a3a3a] p-5 hover:border-[#FA8112]/20 transition-all">
                    <div className="flex gap-4">
                      {/* Thumbnail */}
                      <div className="w-20 h-16 rounded-xl bg-[#FFF8F0] dark:bg-[#3a3a3a] overflow-hidden shrink-0 flex items-center justify-center">
                        {service.image_url ? (
                          <img src={service.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-6 h-6 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-[#1A1A1A] dark:text-[#FAF3E1] truncate">{service.title}</h3>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {service.category && (
                                <span className="text-xs text-gray-400 dark:text-gray-500">{service.category}</span>
                              )}
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                  service.status === "active"
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                    : service.status === "paused"
                                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                    : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  service.status === "active" ? "bg-green-500" :
                                  service.status === "paused" ? "bg-amber-500" : "bg-gray-400"
                                }`} />
                                {service.status === "active" ? "Actif" : service.status === "paused" ? "En pause" : service.status}
                              </span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-sm font-black text-[#FA8112]">{(service.price ?? 0).toLocaleString("fr-DZ")} DA</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                          <button
                            onClick={() => handleToggleStatus(service.id, service.status)}
                            className="px-3 py-1.5 rounded-lg border border-[#F0E8E0] dark:border-[#3a3a3a] text-xs font-medium text-gray-600 dark:text-gray-400 hover:border-[#FA8112]/40 hover:text-[#FA8112] transition-all"
                          >
                            {service.status === "active" ? "Mettre en pause" : "Réactiver"}
                          </button>
                          <Link
                            href={`/services/${service.id}`}
                            className="px-3 py-1.5 rounded-lg border border-[#F0E8E0] dark:border-[#3a3a3a] text-xs font-medium text-gray-600 dark:text-gray-400 hover:border-[#FA8112]/40 hover:text-[#FA8112] transition-all"
                          >
                            Voir la fiche
                          </Link>
                          <button
                            onClick={() => handleDelete(service.id)}
                            disabled={deleting === service.id}
                            className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/40 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50"
                          >
                            {deleting === service.id ? "Suppression…" : "Supprimer"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
          }
        </div>
      </div>
    </div>
  )
}
