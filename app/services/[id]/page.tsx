"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import ServiceCard from "@/components/ServiceCard"
import { createClient } from "@/lib/supabase/client"

type Package = {
  name: string
  description: string
  delivery_days: number
  revisions: number
  price: number
}

type Service = {
  id: string
  title: string
  category: string | null
  description: string | null
  price: number
  delivery_days: number
  images: string[] | null
  gallery: string[] | null
  video_url: string | null
  tags: string[] | null
  packages: Record<string, Package> | null
  faq: { q: string; a: string }[] | null
  avg_rating: number | null
  reviews_count: number | null
  total_orders: number | null
  orders_count: number | null
  created_at: string
  seller_id: string
  seller?: {
    id: string
    full_name: string | null
    avatar_url: string | null
    wilaya: string | null
    bio: string | null
    created_at: string
  } | null
}

type Review = {
  id: string
  rating: number
  comment: string | null
  created_at: string
  reviewer?: { full_name: string | null; avatar_url: string | null } | null
}

const PKG_ORDER = ["basique", "standard", "premium"] as const

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const justCreated  = searchParams.get("created") === "1"

  const [service, setService]   = useState<Service | null>(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [related, setRelated]   = useState<Service[]>([])
  const [reviews, setReviews]   = useState<Review[]>([])
  const [galleryIdx, setGalleryIdx] = useState(0)
  const [activeTab, setActiveTab]   = useState<string>("basique")
  const [showToast, setShowToast]   = useState(justCreated)

  useEffect(() => {
    if (showToast) setTimeout(() => setShowToast(false), 4000)
  }, [showToast])

  useEffect(() => {
    async function load() {
      setLoading(true)
      const sb = createClient()

      const { data: svc, error: svcErr } = await sb
        .from("services")
        .select(`
          id, title, category, description, price, delivery_days, images, gallery, video_url, tags, packages, faq,
          avg_rating, reviews_count, total_orders, orders_count, created_at, seller_id,
          seller:profiles!services_seller_id_fkey(id, full_name, avatar_url, wilaya, bio, created_at)
        `)
        .eq("id", id)
        .single()

      if (svcErr || !svc) { setError("Service introuvable"); setLoading(false); return }
      setService(svc as unknown as Service)

      // Set default package tab
      const pkgs = (svc as unknown as Service).packages
      if (pkgs) {
        const first = PKG_ORDER.find(k => k in pkgs)
        if (first) setActiveTab(first)
      }

      // Reviews
      const { data: rvs } = await sb
        .from("reviews")
        .select("id, rating, comment, created_at, reviewer:profiles!reviews_reviewer_id_fkey(full_name, avatar_url)")
        .eq("service_id", id)
        .order("created_at", { ascending: false })
        .limit(10)
      if (rvs) setReviews(rvs as unknown as Review[])

      // Related services
      const { data: rel } = await sb
        .from("services")
        .select(`id, title, category, price, avg_rating, rating, reviews_count, gallery, images, packages, tags, created_at,
          seller:profiles!services_seller_id_fkey(full_name, avatar_url, wilaya)`)
        .eq("category", svc.category)
        .eq("is_active", true)
        .neq("id", id)
        .limit(4)
      if (rel) setRelated(rel as unknown as Service[])

      setLoading(false)
    }
    load()
  }, [id])

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="w-8 h-8 border-[3px] border-[#FA8112] border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    )
  }

  if (error || !service) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <p className="text-lg font-semibold text-[#1A1A1A]">{error ?? "Service introuvable"}</p>
          <Link href="/freelances" className="text-[#FA8112] underline text-sm">Voir tous les services</Link>
        </div>
      </>
    )
  }

  const gallery = [...(service.gallery ?? []), ...(service.images ?? [])].filter(Boolean)
  const allImages = [...new Set(gallery)]
  const pkg = service.packages && activeTab in service.packages ? service.packages[activeTab] : null
  const hasPkgs = service.packages && Object.keys(service.packages).length > 0
  const coverPrice = pkg ? pkg.price : service.price
  const sellerName = service.seller?.full_name ?? "Freelance"
  const sellerInitials = sellerName.trim().split(/\s+/).map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?"

  const avgRating = Number(service.avg_rating ?? 0)
  const reviewCount = service.reviews_count ?? 0

  function StarBar({ rating }: { rating: number }) {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <svg key={i} className={`w-4 h-4 ${i <= Math.round(rating) ? "text-[#FA8112]" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FAFAFA]">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="text-xs text-gray-400 flex items-center gap-1.5 mb-6">
            <Link href="/" className="hover:text-[#FA8112]">Accueil</Link>
            <span>›</span>
            <Link href="/freelances" className="hover:text-[#FA8112]">Services</Link>
            {service.category && <><span>›</span><span className="text-[#1A1A1A]">{service.category}</span></>}
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ── LEFT COLUMN ── */}
            <div className="lg:col-span-2 space-y-6">
              {/* Gallery */}
              <div className="bg-white rounded-2xl border border-[#EEEEEE] overflow-hidden">
                {allImages.length > 0 ? (
                  <>
                    <div className="relative w-full" style={{ paddingBottom: "60%" }}>
                      <div className="absolute inset-0">
                        <img src={allImages[galleryIdx]} alt={service.title} className="w-full h-full object-cover" />
                        {allImages.length > 1 && (
                          <>
                            <button
                              onClick={() => setGalleryIdx(i => (i - 1 + allImages.length) % allImages.length)}
                              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 text-white rounded-full flex items-center justify-center hover:bg-black/60 transition"
                            >‹</button>
                            <button
                              onClick={() => setGalleryIdx(i => (i + 1) % allImages.length)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 text-white rounded-full flex items-center justify-center hover:bg-black/60 transition"
                            >›</button>
                          </>
                        )}
                      </div>
                    </div>
                    {allImages.length > 1 && (
                      <div className="flex gap-2 p-3 overflow-x-auto">
                        {allImages.map((img, i) => (
                          <button
                            key={i}
                            onClick={() => setGalleryIdx(i)}
                            className={`shrink-0 w-16 h-11 rounded-lg overflow-hidden border-2 transition ${i === galleryIdx ? "border-[#FA8112]" : "border-transparent"}`}
                          >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full aspect-video bg-gray-100 flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Title + seller row */}
              <div className="bg-white rounded-2xl border border-[#EEEEEE] p-6">
                {service.category && (
                  <span className="text-xs font-semibold text-[#FA8112] bg-[#FFF8F0] px-2.5 py-1 rounded-full">{service.category}</span>
                )}
                <h1 className="text-xl font-bold text-[#1A1A1A] mt-3 leading-snug">{service.title}</h1>

                <div className="flex items-center gap-3 mt-4">
                  <Link href={`/profile/${service.seller_id}`} className="flex items-center gap-2 hover:opacity-80">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-[#FA8112] flex items-center justify-center shrink-0">
                      {service.seller?.avatar_url ? (
                        <img src={service.seller.avatar_url} alt={sellerName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white text-sm font-bold">{sellerInitials}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1A1A1A]">{sellerName}</p>
                      {service.seller?.wilaya && <p className="text-xs text-gray-400">{service.seller.wilaya}</p>}
                    </div>
                  </Link>
                  {reviewCount > 0 && (
                    <div className="flex items-center gap-1.5 ml-auto">
                      <StarBar rating={avgRating} />
                      <span className="text-sm font-bold text-[#1A1A1A]">{avgRating.toFixed(1)}</span>
                      <span className="text-sm text-gray-400">({reviewCount} avis)</span>
                    </div>
                  )}
                </div>

                {service.tags && service.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {service.tags.map(t => (
                      <span key={t} className="px-2.5 py-1 bg-[#F5F5F5] text-[#1A1A1A] text-xs rounded-full">{t}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl border border-[#EEEEEE] p-6">
                <h2 className="text-base font-bold text-[#1A1A1A] mb-3">Description</h2>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{service.description}</p>
              </div>

              {/* FAQ */}
              {service.faq && service.faq.length > 0 && (
                <div className="bg-white rounded-2xl border border-[#EEEEEE] p-6">
                  <h2 className="text-base font-bold text-[#1A1A1A] mb-4">Questions fréquentes</h2>
                  <div className="space-y-4">
                    {service.faq.map((item, i) => (
                      <div key={i}>
                        <p className="text-sm font-semibold text-[#1A1A1A]">Q. {item.q}</p>
                        <p className="text-sm text-gray-600 mt-1">R. {item.a}</p>
                        {i < service.faq!.length - 1 && <div className="mt-4 border-b border-[#F5F5F5]" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              <div className="bg-white rounded-2xl border border-[#EEEEEE] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-[#1A1A1A]">Avis clients</h2>
                  {reviewCount > 0 && (
                    <div className="flex items-center gap-2">
                      <StarBar rating={avgRating} />
                      <span className="text-sm font-bold">{avgRating.toFixed(1)}/5</span>
                      <span className="text-xs text-gray-400">({reviewCount})</span>
                    </div>
                  )}
                </div>

                {reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-400">Aucun avis pour le moment</p>
                    <p className="text-xs text-gray-300 mt-1">Soyez le premier à commander ce service</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {reviews.map(r => {
                      const rName = r.reviewer?.full_name ?? "Client"
                      const rInitials = rName.trim().split(/\s+/).map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?"
                      return (
                        <div key={r.id} className="border-b border-[#F5F5F5] pb-5 last:border-0 last:pb-0">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-[#FA8112] flex items-center justify-center shrink-0">
                              {r.reviewer?.avatar_url ? (
                                <img src={r.reviewer.avatar_url} alt={rName} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-white text-xs font-bold">{rInitials}</span>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#1A1A1A]">{rName}</p>
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
              {service.seller && (
                <div className="bg-white rounded-2xl border border-[#EEEEEE] p-6">
                  <h2 className="text-base font-bold text-[#1A1A1A] mb-4">À propos du vendeur</h2>
                  <div className="flex items-start gap-4">
                    <Link href={`/profile/${service.seller_id}`} className="shrink-0">
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-[#FA8112] flex items-center justify-center">
                        {service.seller.avatar_url ? (
                          <img src={service.seller.avatar_url} alt={sellerName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white text-lg font-bold">{sellerInitials}</span>
                        )}
                      </div>
                    </Link>
                    <div>
                      <Link href={`/profile/${service.seller_id}`} className="font-bold text-[#1A1A1A] hover:text-[#FA8112]">{sellerName}</Link>
                      {service.seller.wilaya && <p className="text-xs text-gray-400">{service.seller.wilaya}</p>}
                      {service.seller.bio && <p className="text-sm text-gray-700 mt-2 leading-relaxed">{service.seller.bio}</p>}
                      <p className="text-xs text-gray-400 mt-2">Membre depuis {new Date(service.seller.created_at).toLocaleDateString("fr-DZ", { year: "numeric", month: "long" })}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── RIGHT COLUMN: Buy Box ── */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 bg-white rounded-2xl border border-[#EEEEEE] p-5 shadow-sm">
                {/* Package tabs */}
                {hasPkgs && (
                  <div className="flex rounded-xl overflow-hidden border border-[#EEEEEE] mb-4">
                    {PKG_ORDER.filter(k => service.packages && k in service.packages).map(k => {
                      const label = { basique: "Basique", standard: "Standard", premium: "Premium" }[k]
                      return (
                        <button
                          key={k}
                          onClick={() => setActiveTab(k)}
                          className={`flex-1 py-2 text-xs font-semibold transition-colors ${activeTab === k ? "bg-[#FA8112] text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>
                )}

                {pkg && (
                  <>
                    <p className="text-xs text-gray-600 mb-3 leading-relaxed">{pkg.description}</p>
                    <div className="flex gap-4 mb-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {pkg.delivery_days} jour{pkg.delivery_days > 1 ? "s" : ""}
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {pkg.revisions === -1 ? "Révisions illimitées" : `${pkg.revisions} révision${pkg.revisions > 1 ? "s" : ""}`}
                      </div>
                    </div>
                  </>
                )}

                <div className="flex items-end justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-400">Prix</p>
                    <p className="text-2xl font-bold text-[#1A1A1A]">{coverPrice.toLocaleString("fr-DZ")} <span className="text-base text-[#FA8112]">DA</span></p>
                  </div>
                  {!pkg && (
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {service.delivery_days} jour{service.delivery_days > 1 ? "s" : ""}
                    </div>
                  )}
                </div>

                <button className="w-full py-3 bg-[#FA8112] text-white font-bold text-sm rounded-xl hover:bg-[#E8730F] transition-colors">
                  Commander maintenant
                </button>
                <button className="w-full py-2.5 mt-2 border border-[#EEEEEE] text-[#1A1A1A] text-sm font-semibold rounded-xl hover:border-[#FA8112]/40 transition-colors">
                  Contacter le vendeur
                </button>
              </div>
            </div>
          </div>

          {/* Related services */}
          {related.length > 0 && (
            <div className="mt-12">
              <h2 className="text-lg font-bold text-[#1A1A1A] mb-5">Services similaires</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {related.map(s => <ServiceCard key={s.id} service={s} />)}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Success toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg z-50">
          Service publié avec succès !
        </div>
      )}
    </>
  )
}
