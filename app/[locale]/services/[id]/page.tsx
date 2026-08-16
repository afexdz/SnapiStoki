import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import Navbar from "@/components/Navbar"
import ServiceCard from "@/components/ServiceCard"
import ServiceGallery from "./ServiceGallery"
import ServiceBuyBox from "./ServiceBuyBox"
import ServiceMobileBar from "./ServiceMobileBar"
import CreatedToast from "./CreatedToast"

type Package = {
  name: string
  description: string
  delivery_days: number
  revisions: number
  price: number
}

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ created?: string }>
}

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const sb = await createClient()
  const { data: svc } = await sb
    .from("services")
    .select("title, description, gallery, images")
    .eq("id", id)
    .single()

  if (!svc) return { title: "Service introuvable" }

  const description = svc.description
    ? svc.description.slice(0, 160).trim()
    : `Découvrez ce service sur PixRaise.`

  const ogImage = (svc.gallery as string[] | null)?.[0]
    ?? (svc.images as string[] | null)?.[0]
    ?? "/opengraph-image.png"

  return {
    title: svc.title,
    description,
    openGraph: {
      title: svc.title,
      description,
      url: `https://pixraise.com/services/${id}`,
      images: [{ url: ogImage }],
    },
    twitter: { card: "summary_large_image" },
    alternates: {
      canonical: `/services/${id}`,
      languages: {
        "fr": `https://pixraise.com/services/${id}`,
        "en": `https://pixraise.com/en/services/${id}`,
        "ar": `https://pixraise.com/ar/services/${id}`,
        "x-default": `https://pixraise.com/services/${id}`,
      },
    },
  }
}

export default async function ServiceDetailPage({ params, searchParams }: Props) {
  const { id } = await params
  const { created } = await searchParams
  const sb = await createClient()

  const { data: svc } = await sb
    .from("services")
    .select(`
      id, title, category, description, price, delivery_days, images, gallery, video_url, tags, packages, faq,
      avg_rating, reviews_count, total_orders, orders_count, created_at, seller_id,
      seller:profiles!services_seller_id_fkey(id, full_name, avatar_url, wilaya, bio, created_at)
    `)
    .eq("id", id)
    .single()

  if (!svc) notFound()

  const [reviewsResult, relatedResult, userResult] = await Promise.all([
    sb.from("reviews")
      .select("id, rating, comment, created_at, reviewer:profiles!reviews_reviewer_id_fkey(full_name, avatar_url)")
      .eq("service_id", id)
      .order("created_at", { ascending: false })
      .limit(10),
    sb.from("services")
      .select(`id, title, category, price, avg_rating, rating, reviews_count, gallery, images, packages, tags, created_at,
        seller:profiles!services_seller_id_fkey(full_name, avatar_url, wilaya)`)
      .eq("category", svc.category)
      .eq("is_active", true)
      .neq("id", id)
      .limit(4),
    sb.auth.getUser(),
  ])

  const reviews = (reviewsResult.data ?? []) as unknown as {
    id: string
    rating: number
    comment: string | null
    created_at: string
    reviewer?: { full_name: string | null; avatar_url: string | null } | null
  }[]
  const related = (relatedResult.data ?? []) as unknown as Parameters<typeof ServiceCard>[0]["service"][]
  const currentUserId = userResult.data.user?.id ?? null

  const gallery = [...((svc.gallery as string[] | null) ?? []), ...((svc.images as string[] | null) ?? [])].filter(Boolean)
  const allImages = [...new Set(gallery)]

  const packages = svc.packages as Record<string, Package> | null
  const PKG_ORDER = ["basique", "standard", "premium"] as const
  const firstPkg = PKG_ORDER.find(k => packages && k in packages)
  const coverPrice = firstPkg && packages ? packages[firstPkg].price : svc.price

  const sellerName = (svc.seller as unknown as { full_name: string | null } | null)?.full_name ?? "Freelance"
  const sellerInitials = sellerName.trim().split(/\s+/).map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?"
  const seller = svc.seller as unknown as {
    id: string; full_name: string | null; avatar_url: string | null
    wilaya: string | null; bio: string | null; created_at: string
  } | null

  const avgRating = Number(svc.avg_rating ?? 0)
  const reviewCount = svc.reviews_count ?? 0
  const isOwner = currentUserId !== null && currentUserId === svc.seller_id

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[var(--background)] pb-20 lg:pb-0">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="text-xs text-gray-400 flex items-center gap-1.5 mb-6">
            <Link href="/" className="hover:text-[var(--orange)]">Accueil</Link>
            <span>›</span>
            <Link href="/freelances" className="hover:text-[var(--orange)]">Services</Link>
            {svc.category && <><span>›</span><span className="text-[var(--ink)]">{svc.category as string}</span></>}
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ── LEFT COLUMN ── */}
            <div className="lg:col-span-2 space-y-6">
              <ServiceGallery images={allImages} title={svc.title} />

              {/* Title + seller row */}
              <div className="bg-[var(--white)] rounded-2xl border border-[var(--border-subtle)] p-6">
                {svc.category && (
                  <span className="text-xs font-semibold text-[var(--orange)] bg-[var(--cream)] px-2.5 py-1 rounded-full">{svc.category as string}</span>
                )}
                <h1 className="text-xl font-bold text-[var(--ink)] mt-3 leading-snug">{svc.title}</h1>

                <div className="flex items-center gap-3 mt-4">
                  <Link href={`/profile/${svc.seller_id}`} className="flex items-center gap-2 hover:opacity-80">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--orange)] flex items-center justify-center shrink-0">
                      {seller?.avatar_url ? (
                        <img src={seller.avatar_url} alt={sellerName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white text-sm font-bold">{sellerInitials}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--ink)]">{sellerName}</p>
                      {seller?.wilaya && <p className="text-xs text-gray-400">{seller.wilaya}</p>}
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

                {(svc.tags as string[] | null) && (svc.tags as string[]).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {(svc.tags as string[]).map(t => (
                      <span key={t} className="px-2.5 py-1 bg-[var(--cream)] text-[var(--ink)] text-xs rounded-full">{t}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="bg-[var(--white)] rounded-2xl border border-[var(--border-subtle)] p-6">
                <h2 className="text-base font-bold text-[var(--ink)] mb-3">Description</h2>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{svc.description as string}</p>
              </div>

              {/* FAQ */}
              {(svc.faq as { q: string; a: string }[] | null) && (svc.faq as { q: string; a: string }[]).length > 0 && (
                <div className="bg-[var(--white)] rounded-2xl border border-[var(--border-subtle)] p-6">
                  <h2 className="text-base font-bold text-[var(--ink)] mb-4">Questions fréquentes</h2>
                  <div className="space-y-4">
                    {(svc.faq as { q: string; a: string }[]).map((item, i) => (
                      <div key={i}>
                        <p className="text-sm font-semibold text-[var(--ink)]">Q. {item.q}</p>
                        <p className="text-sm text-gray-600 mt-1">R. {item.a}</p>
                        {i < (svc.faq as { q: string; a: string }[]).length - 1 && <div className="mt-4 border-b border-[var(--border-subtle)]" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              <div className="bg-[var(--white)] rounded-2xl border border-[var(--border-subtle)] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-[var(--ink)]">Avis clients</h2>
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
                        <div key={r.id} className="border-b border-[var(--border-subtle)] pb-5 last:border-0 last:pb-0">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-[var(--orange)] flex items-center justify-center shrink-0">
                              {r.reviewer?.avatar_url ? (
                                <img src={r.reviewer.avatar_url} alt={rName} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-white text-xs font-bold">{rInitials}</span>
                              )}
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
              {seller && (
                <div className="bg-[var(--white)] rounded-2xl border border-[var(--border-subtle)] p-6">
                  <h2 className="text-base font-bold text-[var(--ink)] mb-4">À propos du vendeur</h2>
                  <div className="flex items-start gap-4">
                    <Link href={`/profile/${svc.seller_id}`} className="shrink-0">
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-[var(--orange)] flex items-center justify-center">
                        {seller.avatar_url ? (
                          <img src={seller.avatar_url} alt={sellerName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white text-lg font-bold">{sellerInitials}</span>
                        )}
                      </div>
                    </Link>
                    <div>
                      <Link href={`/profile/${svc.seller_id}`} className="font-bold text-[var(--ink)] hover:text-[var(--orange)]">{sellerName}</Link>
                      {seller.wilaya && <p className="text-xs text-gray-400">{seller.wilaya}</p>}
                      {seller.bio && <p className="text-sm text-gray-700 mt-2 leading-relaxed">{seller.bio}</p>}
                      <p className="text-xs text-gray-400 mt-2">Membre depuis {new Date(seller.created_at).toLocaleDateString("fr-DZ", { year: "numeric", month: "long" })}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── RIGHT COLUMN ── */}
            <div className="lg:col-span-1">
              <div className="hidden lg:block sticky top-6">
                <ServiceBuyBox
                  serviceId={svc.id}
                  sellerId={svc.seller_id}
                  price={svc.price}
                  deliveryDays={svc.delivery_days}
                  packages={packages}
                  ordersCount={svc.orders_count ?? 0}
                  avgRating={avgRating}
                  reviewCount={reviewCount}
                  isOwner={isOwner}
                  currentUserId={currentUserId}
                />
              </div>
            </div>
          </div>

          {/* Related services */}
          {related.length > 0 && (
            <div className="mt-12">
              <h2 className="text-lg font-bold text-[var(--ink)] mb-5">Services similaires</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {related.map(s => <ServiceCard key={s.id} service={s} />)}
              </div>
            </div>
          )}
        </div>
      </main>

      <ServiceMobileBar
        serviceId={svc.id}
        sellerId={svc.seller_id}
        price={coverPrice}
        packages={packages}
        isOwner={isOwner}
        currentUserId={currentUserId}
      />

      <CreatedToast show={created === "1"} />
    </>
  )
}
