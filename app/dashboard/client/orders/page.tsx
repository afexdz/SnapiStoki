"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

type Order = {
  id: string
  status: string
  total_price: number
  created_at: string
  order_type: string
  service_id: string | null
  product_id: string | null
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:   { label: "En attente",  color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  active:    { label: "En cours",    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  completed: { label: "Terminée",    color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  cancelled: { label: "Annulée",     color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
}

export default function ClientOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push("/login"); return }

      const query = sb
        .from("orders")
        .select("id, status, total_price, created_at, order_type, service_id, product_id")
        .eq("buyer_id", data.user.id)
        .order("created_at", { ascending: false })

      const { data: rows } = await query
      setOrders(rows ?? [])
      setLoading(false)
    })
  }, [router])

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter)

  const skeleton = Array.from({ length: 4 })

  return (
    <div className="min-h-screen bg-[#FFF8F0] dark:bg-[#1a1a1a]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/client" className="p-2 rounded-xl border border-[#F0E8E0] dark:border-[#3a3a3a] text-gray-500 hover:text-[#FA8112] hover:border-[#FA8112]/40 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-[#1A1A1A] dark:text-[#FAF3E1]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Mes commandes
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Suivez l'avancement de vos commandes</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
          {[
            { key: "all",       label: "Toutes" },
            { key: "pending",   label: "En attente" },
            { key: "active",    label: "En cours" },
            { key: "completed", label: "Terminées" },
            { key: "cancelled", label: "Annulées" },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === f.key
                  ? "bg-[#FA8112] text-white shadow-md shadow-[#FA8112]/20"
                  : "bg-white dark:bg-[#2a2a2a] border border-[#F0E8E0] dark:border-[#3a3a3a] text-gray-600 dark:text-gray-400 hover:border-[#FA8112]/40"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-3">
          {loading
            ? skeleton.map((_, i) => (
                <div key={i} className="bg-white dark:bg-[#2a2a2a] rounded-2xl border border-[#F0E8E0] dark:border-[#3a3a3a] p-5 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-4 w-40 bg-gray-200 dark:bg-[#3a3a3a] rounded" />
                      <div className="h-3 w-24 bg-gray-100 dark:bg-[#333] rounded" />
                    </div>
                    <div className="h-6 w-20 bg-gray-200 dark:bg-[#3a3a3a] rounded-full" />
                  </div>
                </div>
              ))
            : filtered.length === 0
              ? (
                <div className="bg-white dark:bg-[#2a2a2a] rounded-2xl border border-[#F0E8E0] dark:border-[#3a3a3a] p-16 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#FFF8F0] dark:bg-[#3a3a3a] flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Aucune commande trouvée</p>
                  <Link
                    href="/freelances"
                    className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-[#FA8112] hover:text-[#E8730F] transition-colors"
                  >
                    Trouver un freelance →
                  </Link>
                </div>
              )
              : filtered.map(order => {
                  const status = STATUS_LABELS[order.status] ?? { label: order.status, color: "bg-gray-100 text-gray-600" }
                  return (
                    <div
                      key={order.id}
                      className="bg-white dark:bg-[#2a2a2a] rounded-2xl border border-[#F0E8E0] dark:border-[#3a3a3a] p-5 hover:border-[#FA8112]/30 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-[#FA8112]/10 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-[#FA8112]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#1A1A1A] dark:text-[#FAF3E1] truncate">
                              Commande #{order.id.slice(0, 8).toUpperCase()}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5 capitalize">
                              {order.order_type === "service" ? "Service" : "Produit digital"} ·{" "}
                              {new Date(order.created_at).toLocaleDateString("fr-DZ", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                            {status.label}
                          </span>
                          <span className="text-sm font-bold text-[#1A1A1A] dark:text-[#FAF3E1]">
                            {(order.total_price ?? 0).toLocaleString("fr-DZ")} DA
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })
          }
        </div>
      </div>
    </div>
  )
}
