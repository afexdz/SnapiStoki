import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { getTranslations, getLocale } from "next-intl/server"
import { createClient } from "@/lib/supabase/server"
import Navbar from "@/components/Navbar"
import ProductCard from "@/components/ProductCard"
import ProductGallery from "./ProductGallery"
import ProductBuyBox from "./ProductBuyBox"
import ProductMobileBar from "./ProductMobileBar"
import CreatedToast from "./CreatedToast"

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
  const { data: prod } = await sb
    .from("digital_products")
    .select("title, description, preview_urls, preview_images")
    .eq("id", id)
    .single()

  if (!prod) return { title: "Produit introuvable" }

  const description = prod.description
    ? (prod.description as string).slice(0, 160).trim()
    : `Découvrez ce produit numérique sur PixRaise.`

  const ogImage = (prod.preview_urls as string[] | null)?.[0]
    ?? (prod.preview_images as string[] | null)?.[0]
    ?? "/opengraph-image.png"

  return {
    title: prod.title as string,
    description,
    openGraph: {
      title: prod.title as string,
      description,
      url: `https://pixraise.com/products/${id}`,
      images: [{ url: ogImage }],
    },
    twitter: { card: "summary_large_image" },
    alternates: {
      canonical: `/products/${id}`,
      languages: {
        "fr": `https://pixraise.com/products/${id}`,
        "en": `https://pixraise.com/en/products/${id}`,
        "ar": `https://pixraise.com/ar/products/${id}`,
        "x-default": `https://pixraise.com/products/${id}`,
      },
    },
  }
}

export default async function ProductDetailPage({ params, searchParams }: Props) {
  const { id } = await params
  const { created } = await searchParams

  const [t, locale, sb] = await Promise.all([
    getTranslations("product"),
    getLocale(),
    createClient(),
  ])

  const localeMap: Record<string, string> = { fr: "fr-DZ", en: "en-US", ar: "ar-DZ" }
  const dateLocale = localeMap[locale] ?? "fr-DZ"
  const formatDate = (s: string) =>
    new Intl.DateTimeFormat(dateLocale, { year: "numeric", month: "long" }).format(new Date(s))

  const { data: product } = await sb
    .from("digital_products")
    .select(`
      id, title, category, description, price, is_free, file_url,
      preview_urls, preview_images, file_format, format, file_size, license, tags,
      avg_rating, reviews_count, sales_count, downloads, created_at, seller_id,
      seller:profiles!digital_products_seller_id_fkey(id, full_name, avatar_url, wilaya, bio, created_at)
    `)
    .eq("id", id)
    .single()

  if (!product) notFound()

  const [reviewsResult, relatedResult, userResult] = await Promise.all([
    sb.from("reviews")
      .select("id, rating, comment, created_at, reviewer:profiles!reviews_reviewer_id_fkey(full_name, avatar_url)")
      .eq("product_id", id)
      .order("created_at", { ascending: false })
      .limit(10),
    sb.from("digital_products")
      .select(`id, title, category, price, is_free, avg_rating, rating, reviews_count, preview_urls, preview_images, format, file_format, license, created_at, sales_count,
        seller:profiles!digital_products_seller_id_fkey(full_name, avatar_url)`)
      .eq("category", product.category)
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
  const related = (relatedResult.data ?? []) as unknown as Parameters<typeof ProductCard>[0]["product"][]
  const currentUserId = userResult.data.user?.id ?? null

  const previewUrls = (product.preview_urls as string[] | null) ?? []
  const previewImages = (product.preview_images as string[] | null) ?? []
  const gallery = [...previewUrls, ...previewImages].filter(Boolean)
  const allImages = [...new Set(gallery)]

  const avgRating = Number(product.avg_rating ?? 0)
  const reviewCount = product.reviews_count ?? 0
  const sales = (product.sales_count ?? product.downloads ?? 0) as number
  const seller = product.seller as unknown as {
    id: string; full_name: string | null; avatar_url: string | null
    wilaya: string | null; bio: string | null; created_at: string
  } | null
  const sellerName = seller?.full_name ?? "Vendeur"
  const sellerInitials = sellerName.trim().split(/\s+/).map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?"
  const fmt = (product.format ?? product.file_format ?? null) as string | null
  const isOwner = currentUserId !== null && currentUserId === product.seller_id

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[var(--background)] pb-20 lg:pb-0">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="text-xs text-gray-400 flex items-center gap-1.5 mb-6">
            <Link href="/" className="hover:text-[var(--orange)]">{t("breadcrumb.home")}</Link>
            <span>›</span>
            <Link href="/marketplace" className="hover:text-[var(--orange)]">{t("breadcrumb.marketplace")}</Link>
            {product.category && <><span>›</span><span className="text-[var(--ink)]">{product.category as string}</span></>}
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ── LEFT ── */}
            <div className="lg:col-span-2 space-y-6">
              <ProductGallery
                images={allImages}
                title={product.title as string}
                isFree={!!(product.is_free)}
                format={fmt}
              />

              {/* Title + seller */}
              <div className="bg-[var(--white)] rounded-2xl border border-[var(--border-subtle)] p-6">
                {product.category && <span className="text-xs font-semibold text-[var(--orange)] bg-[var(--cream)] px-2.5 py-1 rounded-full">{product.category as string}</span>}
                <h1 className="text-xl font-bold text-[var(--ink)] mt-3 leading-snug">{product.title as string}</h1>

                <div className="flex items-center gap-3 mt-4 flex-wrap">
                  <Link href={`/profile/${product.seller_id}`} className="flex items-center gap-2 hover:opacity-80">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--orange)] flex items-center justify-center shrink-0">
                      {seller?.avatar_url ? (
                        <img src={seller.avatar_url} alt={sellerName} className="w-full h-full object-cover" />
                      ) : <span className="text-white text-sm font-bold">{sellerInitials}</span>}
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
                      <span className="text-sm text-gray-400">{t("reviews.count", { count: reviewCount })}</span>
                    </div>
                  )}
                </div>

                {(product.tags as string[] | null) && (product.tags as string[]).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {(product.tags as string[]).map(tag => <span key={tag} className="px-2.5 py-1 bg-[var(--cream)] text-[var(--ink)] text-xs rounded-full">{tag}</span>)}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="bg-[var(--white)] rounded-2xl border border-[var(--border-subtle)] p-6">
                <h2 className="text-base font-bold text-[var(--ink)] mb-3">{t("section.description")}</h2>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{product.description as string}</p>
              </div>

              {/* Reviews */}
              <div className="bg-[var(--white)] rounded-2xl border border-[var(--border-subtle)] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-[var(--ink)]">{t("section.reviews")}</h2>
                  {reviewCount > 0 && (
                    <div className="flex items-center gap-2">
                      <StarBar rating={avgRating} />
                      <span className="text-sm font-bold">{avgRating.toFixed(1)}/5</span>
                    </div>
                  )}
                </div>
                {reviews.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">{t("reviews.empty")}</p>
                ) : (
                  <div className="space-y-5">
                    {reviews.map(r => {
                      const rName = r.reviewer?.full_name ?? t("reviews.reviewerFallback")
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
                                <span className="text-xs text-gray-400 ml-1">{new Date(r.created_at).toLocaleDateString(dateLocale)}</span>
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
                  <h2 className="text-base font-bold text-[var(--ink)] mb-4">{t("section.sellerAbout")}</h2>
                  <div className="flex items-start gap-4">
                    <Link href={`/profile/${product.seller_id}`} className="shrink-0">
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-[var(--orange)] flex items-center justify-center">
                        {seller.avatar_url ? <img src={seller.avatar_url} alt={sellerName} className="w-full h-full object-cover" /> : <span className="text-white text-lg font-bold">{sellerInitials}</span>}
                      </div>
                    </Link>
                    <div>
                      <Link href={`/profile/${product.seller_id}`} className="font-bold text-[var(--ink)] hover:text-[var(--orange)]">{sellerName}</Link>
                      {seller.wilaya && <p className="text-xs text-gray-400">{seller.wilaya}</p>}
                      {seller.bio && <p className="text-sm text-gray-700 mt-2 leading-relaxed">{seller.bio}</p>}
                      <p className="text-xs text-gray-400 mt-2">{t("seller.memberSince", { date: formatDate(seller.created_at) })}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── RIGHT ── */}
            <div className="lg:col-span-1">
              <div className="hidden lg:block sticky top-6">
                <ProductBuyBox
                  productId={product.id}
                  sellerId={product.seller_id}
                  title={product.title as string}
                  price={product.price as number}
                  isFree={!!(product.is_free)}
                  fileUrl={(product.file_url as string | null)}
                  fileSize={(product.file_size as string | null)}
                  license={(product.license as string | null)}
                  format={fmt}
                  sales={sales}
                  avgRating={avgRating}
                  reviewCount={reviewCount}
                  isOwner={isOwner}
                  currentUserId={currentUserId}
                />
              </div>
            </div>
          </div>

          {/* Related products */}
          {related.length > 0 && (
            <div className="mt-12">
              <h2 className="text-lg font-bold text-[var(--ink)] mb-5">{t("section.related")}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {related.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          )}
        </div>
      </main>

      <ProductMobileBar
        productId={product.id}
        sellerId={product.seller_id}
        title={product.title as string}
        price={product.price as number}
        isFree={!!(product.is_free)}
        fileUrl={(product.file_url as string | null)}
        isOwner={isOwner}
        currentUserId={currentUserId}
      />

      <CreatedToast show={created === "1"} />
    </>
  )
}
