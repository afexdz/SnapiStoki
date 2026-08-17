"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { createClient } from "@/lib/supabase/client"

type Product = {
  id: string
  title: string
  price: number
  is_active: boolean
  is_free: boolean
  category: string | null
  sales_count: number | null
  preview_urls: string[] | null
  preview_images: string[] | null
  created_at: string
}

export default function FreelanceProductsPage() {
  const router = useRouter()
  const t = useTranslations("dashboardSeller")
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchProducts = async () => {
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) { router.push("/login"); return }

    const { data, error } = await sb
      .from("digital_products")
      .select("id, title, price, is_active, is_free, category, sales_count, preview_urls, preview_images, created_at")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false })

    if (error) console.error("[freelance/products] fetch error:", error)
    setProducts(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchProducts() }, [router])

  const handleDelete = async (id: string) => {
    if (!confirm(t("products.actions.deleteConfirm"))) return
    setDeleting(id)
    const sb = createClient()
    const { error } = await sb.from("digital_products").delete().eq("id", id)
    if (error) { console.error("[freelance/products] delete error:", error); setDeleting(null); return }
    setProducts(prev => prev.filter(p => p.id !== id))
    setDeleting(null)
  }

  const handleToggle = async (id: string, current: boolean) => {
    const sb = createClient()
    const { error } = await sb.from("digital_products").update({ is_active: !current }).eq("id", id)
    if (error) { console.error("[freelance/products] toggle error:", error); return }
    setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p))
  }

  const skeleton = Array.from({ length: 3 })

  return (
    <div className="min-h-screen bg-[var(--cream)] dark:bg-[var(--color-bg)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/freelance" className="p-2 rounded-xl border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] text-gray-500 hover:text-[var(--orange)] hover:border-[var(--orange)]/40 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-extrabold text-[var(--ink)] dark:text-[var(--ink)]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {t("products.title")}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {loading ? "…" : t("products.count", { n: products.length })}
              </p>
            </div>
          </div>
          <Link
            href="/products/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--orange)] hover:bg-[var(--orange-dark)] text-white text-sm font-semibold rounded-xl shadow-md shadow-[var(--orange)]/20 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t("products.newProduct")}
          </Link>
        </div>

        <div className="space-y-4">
          {loading
            ? skeleton.map((_, i) => (
                <div key={i} className="bg-[var(--white)] dark:bg-[var(--white)] rounded-2xl border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] p-5 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-20 h-16 rounded-xl bg-gray-200 dark:bg-[var(--cream)] shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 w-2/3 bg-gray-200 dark:bg-[var(--cream)] rounded" />
                      <div className="h-3 w-1/3 bg-gray-100 dark:bg-[var(--cream)] rounded" />
                    </div>
                  </div>
                </div>
              ))
            : products.length === 0
              ? (
                <div className="bg-[var(--white)] dark:bg-[var(--white)] rounded-2xl border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] p-16 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--cream)] dark:bg-[var(--cream)] flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{t("products.empty")}</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mb-5">{t("products.emptyHint")}</p>
                  <Link
                    href="/products/new"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--orange)] hover:bg-[var(--orange-dark)] text-white text-sm font-semibold rounded-xl shadow-md shadow-[var(--orange)]/20 transition-all"
                  >
                    {t("products.publishCta")}
                  </Link>
                </div>
              )
              : products.map(product => {
                  const thumb = product.preview_urls?.[0] ?? product.preview_images?.[0]
                  return (
                    <div key={product.id} className="bg-[var(--white)] dark:bg-[var(--white)] rounded-2xl border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] p-5 hover:border-[var(--orange)]/20 transition-all">
                      <div className="flex gap-4">
                        <div className="w-20 h-16 rounded-xl bg-[var(--cream)] dark:bg-[var(--cream)] overflow-hidden shrink-0 flex items-center justify-center">
                          {thumb ? (
                            <img src={thumb} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <svg className="w-6 h-6 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                            </svg>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="text-sm font-semibold text-[var(--ink)] dark:text-[var(--ink)] truncate">{product.title}</h3>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                {product.category && (
                                  <span className="text-xs text-gray-400 dark:text-gray-500">{product.category}</span>
                                )}
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${product.is_active ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${product.is_active ? "bg-green-500" : "bg-amber-500"}`} />
                                  {product.is_active ? t("products.status.active") : t("products.status.paused")}
                                </span>
                                {product.is_free && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{t("products.free")}</span>}
                              </div>
                            </div>
                            <div className="text-right shrink-0 space-y-0.5">
                              <div className="text-sm font-black text-[var(--orange)]">{product.is_free ? t("products.free") : `${(product.price ?? 0).toLocaleString("fr-DZ")} DA`}</div>
                              <div className="text-xs text-gray-400">{t("products.sales", { n: product.sales_count ?? 0 })}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mt-3 flex-wrap">
                            <button
                              onClick={() => handleToggle(product.id, product.is_active)}
                              className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] text-xs font-medium text-gray-600 dark:text-gray-400 hover:border-[var(--orange)]/40 hover:text-[var(--orange)] transition-all"
                            >
                              {product.is_active ? t("products.actions.pause") : t("products.actions.activate")}
                            </button>
                            <Link
                              href={`/dashboard/freelance/products/${product.id}/edit`}
                              className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] text-xs font-medium text-gray-600 dark:text-gray-400 hover:border-[var(--orange)]/40 hover:text-[var(--orange)] transition-all"
                            >
                              {t("products.actions.edit")}
                            </Link>
                            <Link
                              href={`/products/${product.id}`}
                              className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] text-xs font-medium text-gray-600 dark:text-gray-400 hover:border-[var(--orange)]/40 hover:text-[var(--orange)] transition-all"
                            >
                              {t("products.actions.view")}
                            </Link>
                            <button
                              onClick={() => handleDelete(product.id)}
                              disabled={deleting === product.id}
                              className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/40 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50"
                            >
                              {deleting === product.id ? t("products.actions.deleting") : t("products.actions.delete")}
                            </button>
                          </div>
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
