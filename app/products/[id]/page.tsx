"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import ProductCard from "@/components/ProductCard"
import { createClient } from "@/lib/supabase/client"

type Product = {
  id: string
  title: string
  category: string | null
  description: string | null
  price: number
  is_free: boolean | null
  file_url: string | null
  preview_urls: string[] | null
  preview_images: string[] | null
  file_format: string | null
  format: string | null
  file_size: string | null
  license: string | null
  tags: string[] | null
  avg_rating: number | null
  reviews_count: number | null
  sales_count: number | null
  downloads: number | null
  created_at: string
  seller_id: string
  seller?: {
    id: string
    full_name: string | null
    avatar_url: string | null
    wilaya: string | null
    bio: string | null
    created_at: string
    whatsapp: string | null
  } | null
}

type Review = {
  id: string
  rating: number
  comment: string | null
  created_at: string
  reviewer?: { full_name: string | null; avatar_url: string | null } | null
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const justCreated  = searchParams.get("created") === "1"

  const [product, setProduct]   = useState<Product | null>(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [related, setRelated]   = useState<Product[]>([])
  const [reviews, setReviews]   = useState<Review[]>([])
  const [galleryIdx, setGalleryIdx] = useState(0)
  const [showToast, setShowToast]   = useState(justCreated)
  const [downloading, setDownloading] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    if (showToast) setTimeout(() => setShowToast(false), 4000)
  }, [showToast])

  useEffect(() => {
    async function load() {
      setLoading(true)
      const sb = createClient()

      const { data: { user } } = await sb.auth.getUser()
      setCurrentUserId(user?.id ?? null)

      const { data: prod, error: err } = await sb
        .from("digital_products")
        .select(`
          id, title, category, description, price, is_free, file_url,
          preview_urls, preview_images, file_format, format, file_size, license, tags,
          avg_rating, reviews_count, sales_count, downloads, created_at, seller_id,
          seller:profiles!digital_products_seller_id_fkey(id, full_name, avatar_url, wilaya, bio, created_at, whatsapp)
        `)
        .eq("id", id)
        .single()

      if (err || !prod) { setError("Produit introuvable"); setLoading(false); return }
      setProduct(prod as unknown as Product)

      const { data: rvs } = await sb
        .from("reviews")
        .select("id, rating, comment, created_at, reviewer:profiles!reviews_reviewer_id_fkey(full_name, avatar_url)")
        .eq("product_id", id)
        .order("created_at", { ascending: false })
        .limit(10)
      if (rvs) setReviews(rvs as unknown as Review[])

      const { data: rel } = await sb
        .from("digital_products")
        .select(`id, title, category, price, is_free, avg_rating, rating, reviews_count, preview_urls, preview_images, format, file_format, license, created_at, sales_count,
          seller:profiles!digital_products_seller_id_fkey(full_name, avatar_url)`)
        .eq("category", prod.category)
        .eq("is_active", true)
        .neq("id", id)
        .limit(4)
      if (rel) setRelated(rel as unknown as Product[])

      setLoading(false)
    }
    load()
  }, [id])

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-[var(--white)]">
          <div className="w-8 h-8 border-[3px] border-[var(--orange)] border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    )
  }

  if (error || !product) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <p className="text-lg font-semibold text-[var(--ink)]">{error ?? "Produit introuvable"}</p>
          <Link href="/marketplace" className="text-[var(--orange)] underline text-sm">Voir la marketplace</Link>
        </div>
      </>
    )
  }

  const gallery = [...(product.preview_urls ?? []), ...(product.preview_images ?? [])].filter(Boolean)
  const allImages = [...new Set(gallery)]
  const avgRating   = Number(product.avg_rating ?? 0)
  const reviewCount = product.reviews_count ?? 0
  const sales       = product.sales_count ?? product.downloads ?? 0
  const sellerName  = product.seller?.full_name ?? "Vendeur"
  const sellerInitials = sellerName.trim().split(/\s+/).map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?"
  const fmt         = product.format ?? product.file_format ?? null
  const isOwner     = currentUserId !== null && currentUserId === product.seller_id

  function StarBar({ rating }: { rating: number }) {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <svg key={i} className={`w-4 h-4 ${i <= Math.round(rating) ? "text-[var(--orange)]" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )
  }

  async function handleDownload() {
    if (!product?.file_url) return
    setDownloading(true)
    try {
      const sb = createClient()
      const { data, error } = await sb.storage.from("digital-products").download(product.file_url)
      if (error || !data) throw error
      const url = URL.createObjectURL(data)
      const a = document.createElement("a")
      a.href = url
      a.download = product.title.replace(/\s+/g, "_")
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert("Erreur lors du téléchargement")
    } finally {
      setDownloading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[var(--background)] pb-20 lg:pb-0">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="text-xs text-gray-400 flex items-center gap-1.5 mb-6">
            <Link href="/" className="hover:text-[var(--orange)]">Accueil</Link>
            <span>›</span>
            <Link href="/marketplace" className="hover:text-[var(--orange)]">Marketplace</Link>
            {product.category && <><span>›</span><span className="text-[var(--ink)]">{product.category}</span></>}
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ── LEFT ── */}
            <div className="lg:col-span-2 space-y-6">
              {/* Gallery */}
              <div className="bg-[var(--white)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden">
                {allImages.length > 0 ? (
                  <>
                    <div className="relative w-full" style={{ paddingBottom: "62.5%" }}>
                      <div className="absolute inset-0">
                        <img src={allImages[galleryIdx]} alt={product.title} className="w-full h-full object-cover" />
                        {allImages.length > 1 && (
                          <>
                            <button onClick={() => setGalleryIdx(i => (i - 1 + allImages.length) % allImages.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 text-white rounded-full flex items-center justify-center hover:bg-black/60">‹</button>
                            <button onClick={() => setGalleryIdx(i => (i + 1) % allImages.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 text-white rounded-full flex items-center justify-center hover:bg-black/60">›</button>
                          </>
                        )}
                        {fmt && <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#1A1A1A]/80 text-white text-xs font-bold rounded-lg">{fmt}</span>}
                        {product.is_free && <span className="absolute top-3 right-3 px-2.5 py-1 bg-green-500 text-white text-xs font-bold rounded-lg">Gratuit</span>}
                      </div>
                    </div>
                    {allImages.length > 1 && (
                      <div className="flex gap-2 p-3 overflow-x-auto">
                        {allImages.map((img, i) => (
                          <button key={i} onClick={() => setGalleryIdx(i)} className={`shrink-0 w-16 h-11 rounded-lg overflow-hidden border-2 transition ${i === galleryIdx ? "border-[var(--orange)]" : "border-transparent"}`}>
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full aspect-video bg-gray-100 dark:bg-[var(--ink-12)] flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Title + seller */}
              <div className="bg-[var(--white)] rounded-2xl border border-[var(--border-subtle)] p-6">
                {product.category && <span className="text-xs font-semibold text-[var(--orange)] bg-[var(--cream)] px-2.5 py-1 rounded-full">{product.category}</span>}
                <h1 className="text-xl font-bold text-[var(--ink)] mt-3 leading-snug">{product.title}</h1>

                <div className="flex items-center gap-3 mt-4 flex-wrap">
                  <Link href={`/profile/${product.seller_id}`} className="flex items-center gap-2 hover:opacity-80">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--orange)] flex items-center justify-center shrink-0">
                      {product.seller?.avatar_url ? (
                        <img src={product.seller.avatar_url} alt={sellerName} className="w-full h-full object-cover" />
                      ) : <span className="text-white text-sm font-bold">{sellerInitials}</span>}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--ink)]">{sellerName}</p>
                      {product.seller?.wilaya && <p className="text-xs text-gray-400">{product.seller.wilaya}</p>}
                    </div>
                  </Link>
                  {reviewCount > 0 && (
                    <div className="flex items-center gap-1.5 ml-auto">
                      <StarBar rating={avgRating} />
                      <span className="text-sm font-bold text-[var(--ink)]">{avgRating.toFixed(1)}</span>
                      <span className="text-sm text-gray-400">({reviewCount} avis)</span>
                    </div>
                  )}
                </div>

                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {product.tags.map(t => <span key={t} className="px-2.5 py-1 bg-[var(--cream)] text-[var(--ink)] text-xs rounded-full">{t}</span>)}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="bg-[var(--white)] rounded-2xl border border-[var(--border-subtle)] p-6">
                <h2 className="text-base font-bold text-[var(--ink)] mb-3">Description</h2>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{product.description}</p>
              </div>

              {/* Reviews */}
              <div className="bg-[var(--white)] rounded-2xl border border-[var(--border-subtle)] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-[var(--ink)]">Avis</h2>
                  {reviewCount > 0 && (
                    <div className="flex items-center gap-2">
                      <StarBar rating={avgRating} />
                      <span className="text-sm font-bold">{avgRating.toFixed(1)}/5</span>
                    </div>
                  )}
                </div>
                {reviews.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">Aucun avis pour le moment</p>
                ) : (
                  <div className="space-y-5">
                    {reviews.map(r => {
                      const rName = r.reviewer?.full_name ?? "Acheteur"
                      const rInitials = rName.trim().split(/\s+/).map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?"
                      return (
                        <div key={r.id} className="border-b border-[var(--border-subtle)] pb-5 last:border-0 last:pb-0">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-[var(--orange)] flex items-center justify-center shrink-0">
                              {r.reviewer?.avatar_url ? <img src={r.reviewer.avatar_url} alt={rName} className="w-full h-full object-cover" /> : <span className="text-white text-xs font-bold">{rInitials}</span>}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[var(--ink)]">{rName}</p>
                              <div className="flex items-center gap-1">
                                <StarBar rating={r.rating} />
                                <span className="text-xs text-gray-400 ml-1">{new Date(r.created_at).toLocaleDateString("fr-DZ")}</span>
                              </div>
                            </div>
                          </div>
                          {r.comment && <p className="text-sm text-gray-700 leading-relaxed">{r.comment}</p>}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Seller card */}
              {product.seller && (
                <div className="bg-[var(--white)] rounded-2xl border border-[var(--border-subtle)] p-6">
                  <h2 className="text-base font-bold text-[var(--ink)] mb-4">À propos du créateur</h2>
                  <div className="flex items-start gap-4">
                    <Link href={`/profile/${product.seller_id}`} className="shrink-0">
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-[var(--orange)] flex items-center justify-center">
                        {product.seller.avatar_url ? <img src={product.seller.avatar_url} alt={sellerName} className="w-full h-full object-cover" /> : <span className="text-white text-lg font-bold">{sellerInitials}</span>}
                      </div>
                    </Link>
                    <div>
                      <Link href={`/profile/${product.seller_id}`} className="font-bold text-[var(--ink)] hover:text-[var(--orange)]">{sellerName}</Link>
                      {product.seller.wilaya && <p className="text-xs text-gray-400">{product.seller.wilaya}</p>}
                      {product.seller.bio && <p className="text-sm text-gray-700 mt-2 leading-relaxed">{product.seller.bio}</p>}
                      <p className="text-xs text-gray-400 mt-2">Membre depuis {new Date(product.seller.created_at).toLocaleDateString("fr-DZ", { year: "numeric", month: "long" })}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── RIGHT: Buy Box / Owner Panel ── */}
            <div className="lg:col-span-1">
              <div className="hidden lg:block sticky top-6">
                {isOwner ? (
                  <div className="bg-[var(--white)] rounded-2xl border border-[var(--orange)]/30 p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-[var(--orange)]/10 text-[var(--orange)] text-xs font-bold rounded-lg">Votre produit</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 dark:bg-[var(--white)] rounded-xl text-center">
                        <p className="text-lg font-black text-[var(--orange)]">{sales}</p>
                        <p className="text-xs text-gray-500">ventes</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-[var(--white)] rounded-xl text-center">
                        <p className="text-lg font-black text-[var(--ink)]">{avgRating > 0 ? avgRating.toFixed(1) : "—"}</p>
                        <p className="text-xs text-gray-500">note moy.</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-[var(--white)] rounded-xl text-center">
                        <p className="text-lg font-black text-[var(--ink)]">{reviewCount}</p>
                        <p className="text-xs text-gray-500">avis</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-[var(--white)] rounded-xl text-center">
                        <p className="text-lg font-black text-[var(--ink)]">{product.is_free ? "Gratuit" : `${product.price.toLocaleString("fr-DZ")}`}</p>
                        <p className="text-xs text-gray-500">{product.is_free ? "" : "DA"}</p>
                      </div>
                    </div>
                    <Link href={`/dashboard/freelance/products/${product.id}/edit`} className="flex items-center justify-center gap-2 w-full py-3 bg-[var(--orange)] text-white font-bold text-sm rounded-xl hover:bg-[var(--orange-dark)] transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      Modifier ce produit
                    </Link>
                    <Link href="/dashboard/freelance/products" className="flex items-center justify-center gap-2 w-full py-2.5 border border-[var(--border-subtle)] text-[var(--ink)] text-sm font-semibold rounded-xl hover:border-[var(--orange)]/40 transition-colors">
                      Gérer mes produits
                    </Link>
                  </div>
                ) : (
                  <div className="bg-[var(--white)] rounded-2xl border border-[var(--border-subtle)] p-5 shadow-sm space-y-4">
                    {/* Price */}
                    <div>
                      {product.is_free ? (
                        <p className="text-2xl font-bold text-green-600">Gratuit</p>
                      ) : (
                        <>
                          <p className="text-xs text-gray-400">Prix</p>
                          <p className="text-2xl font-bold text-[var(--ink)]">{product.price.toLocaleString("fr-DZ")} <span className="text-base text-[var(--orange)]">DA</span></p>
                        </>
                      )}
                    </div>

                    {/* File info */}
                    <div className="border border-[var(--border-subtle)] rounded-xl p-3 space-y-2 text-xs text-gray-600">
                      {fmt && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Format</span>
                          <span className="font-semibold px-2 py-0.5 bg-[var(--cream)] rounded">{fmt}</span>
                        </div>
                      )}
                      {product.file_size && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Taille</span>
                          <span className="font-medium">{product.file_size}</span>
                        </div>
                      )}
                      {product.license && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Licence</span>
                          <span className="font-medium">{product.license}</span>
                        </div>
                      )}
                      {sales > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Téléchargements</span>
                          <span className="font-medium">{sales.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    {product.is_free ? (
                      <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="w-full py-3 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {downloading ? (
                          <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Téléchargement...</>
                        ) : (
                          <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" /></svg> Télécharger gratuitement</>
                        )}
                      </button>
                    ) : product.seller?.whatsapp ? (
                      <a
                        href={`https://wa.me/${product.seller.whatsapp.replace(/[^\d]/g, "")}?text=${encodeURIComponent(`Bonjour, je suis intéressé par votre produit « ${product.title} » sur PixRaise.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-3 bg-[var(--orange)] hover:bg-[var(--orange-dark)] text-white font-bold text-sm rounded-xl transition-colors"
                      >
                        <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        Contacter sur WhatsApp
                      </a>
                    ) : (
                      <button disabled className="w-full py-3 border border-[var(--border-subtle)] text-gray-400 text-sm font-medium rounded-xl cursor-not-allowed">
                        Coordonnées non disponibles
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Related products */}
          {related.length > 0 && (
            <div className="mt-12">
              <h2 className="text-lg font-bold text-[var(--ink)] mb-5">Produits similaires</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {related.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile sticky bottom buy bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface-3)] border-t border-[var(--border-strong)] px-4 py-3 flex items-center justify-between gap-4 shadow-[var(--shadow-elevation)]">
        {isOwner ? (
          <>
            <span className="px-2.5 py-1 bg-[var(--orange)]/10 text-[var(--orange)] text-xs font-bold rounded-lg">Votre produit</span>
            <Link href={`/dashboard/freelance/products/${product.id}/edit`} className="flex-1 max-w-[220px] py-3 bg-[var(--orange)] text-white font-bold text-sm rounded-xl hover:bg-[var(--orange-dark)] transition-colors text-center">
              Modifier
            </Link>
          </>
        ) : (
          <>
            <div>
              {product.is_free ? (
                <p className="text-xl font-bold text-green-600">Gratuit</p>
              ) : (
                <>
                  <p className="text-xs text-gray-400">Prix</p>
                  <p className="text-xl font-bold text-[var(--ink)]">{product.price.toLocaleString("fr-DZ")} <span className="text-sm text-[var(--orange)]">DA</span></p>
                </>
              )}
            </div>
            {product.is_free ? (
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex-1 max-w-[220px] py-3 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {downloading ? "Téléchargement..." : "Télécharger gratuitement"}
              </button>
            ) : product.seller?.whatsapp ? (
              <a
                href={`https://wa.me/${product.seller.whatsapp.replace(/[^\d]/g, "")}?text=${encodeURIComponent(`Bonjour, je suis intéressé par votre produit « ${product.title} » sur PixRaise.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 flex-1 max-w-[220px] py-3 bg-[var(--orange)] text-white font-bold text-sm rounded-xl hover:bg-[var(--orange-dark)] transition-colors"
              >
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
            ) : (
              <button disabled className="flex-1 max-w-[220px] py-3 border border-[var(--border-subtle)] text-gray-400 text-xs font-medium rounded-xl cursor-not-allowed">
                Non disponible
              </button>
            )}
          </>
        )}
      </div>

      {showToast && (
        <div className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 bg-green-600 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg z-50">
          Produit publié avec succès !
        </div>
      )}
    </>
  )
}
