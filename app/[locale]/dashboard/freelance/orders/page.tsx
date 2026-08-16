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
  buyer_id: string
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:   { label: "En attente",  color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  active:    { label: "En cours",    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  completed: { label: "Terminée",    color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  cancelled: { label: "Annulée",     color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
}

export default function FreelanceOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push("/login"); return }

      const { data: rows } = await sb
        .from("orders")
        .select("id, status, total_price, created_at, order_type, buyer_id")
        .eq("seller_id", data.user.id)
        .order("created_at", { ascending: false })

      setOrders(rows ?? [])
      setLoading(false)
    })
  }, [router])

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter)

  const totalRevenue = orders
    .filter(o => o.status === "completed")
    .reduce((s, o) => s + (o.total_price ?? 0), 0)

  const skeleton = Array.from({ length: 4 })

  return (
    <div className="min-h-screen bg-[var(--cream)] dark:bg-[var(--color-bg)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard/freelance" className="p-2 rounded-xl border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] text-gray-500 hover:text-[var(--orange)] hover:border-[var(--orange)]/40 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-[var(--ink)] dark:text-[var(--ink)]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Commandes reçues
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Gérez les commandes de vos clients</p>
          </div>
        </div>

        {/* Revenue summary */}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-[var(--white)] dark:bg-[var(--white)] rounded-2xl border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] p-4">
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{totalRevenue.toLocaleString("fr-DZ")} DA</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Revenu total</div>
            </div>
            <div className="bg-[var(--white)] dark:bg-[var(--white)] rounded-2xl border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] p-4">
              <div className="text-xl font-black text-blue-600 dark:text-blue-400">{orders.filter(o => o.status === "active" || o.status === "pending").length}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">En cours</div>
            </div>
            <div className="bg-[var(--white)] dark:bg-[var(--white)] rounded-2xl border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] p-4 col-span-2 sm:col-span-1">
              <div className="text-xl font-black text-[var(--orange)]">{orders.filter(o => o.status === "completed").length}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Terminées</div>
            </div>
          </div>
        )}

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
                  ? "bg-[var(--orange)] text-white shadow-md shadow-[var(--orange)]/20"
                  : "bg-[var(--white)] dark:bg-[var(--white)] border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] text-gray-600 dark:text-gray-400 hover:border-[var(--orange)]/40"
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
                <div key={i} className="bg-[var(--white)] dark:bg-[var(--white)] rounded-2xl border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] p-5 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-4 w-40 bg-gray-200 dark:bg-[var(--cream)] rounded" />
                      <div className="h-3 w-24 bg-gray-100 dark:bg-[var(--ink-12)] rounded" />
                    </div>
                    <div className="h-6 w-20 bg-gray-200 dark:bg-[var(--cream)] rounded-full" />
                  </div>
                </div>
              ))
            : filtered.length === 0
              ? (
                <div className="bg-[var(--white)] dark:bg-[var(--white)] rounded-2xl border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] p-16 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--cream)] dark:bg-[var(--cream)] flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Aucune commande reçue</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-1 mb-5">Publiez vos services pour commencer à recevoir des commandes</p>
                  <Link
                    href="/services/new"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--orange)] hover:bg-[var(--orange-dark)] text-white text-sm font-semibold rounded-xl shadow-md shadow-[var(--orange)]/20 transition-all"
                  >
                    Publier un service →
                  </Link>
                </div>
              )
              : filtered.map(order => {
                  const status = STATUS_LABELS[order.status] ?? { label: order.status, color: "bg-gray-100 dark:bg-[var(--ink-12)] text-gray-600" }
                  return (
                    <div key={order.id} className="bg-[var(--white)] dark:bg-[var(--white)] rounded-2xl border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] p-5 hover:border-[var(--orange)]/30 hover:shadow-md transition-all">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-[var(--orange)]/10 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-[var(--orange)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[var(--ink)] dark:text-[var(--ink)] truncate">
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
                          <span className="text-sm font-bold text-[var(--ink)] dark:text-[var(--ink)]">
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
