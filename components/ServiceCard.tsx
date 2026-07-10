"use client"

import Link from "next/link"

type Package = { price: number; name?: string; description?: string; delivery_days?: number; revisions?: number }

type ServiceCardService = {
  id: string
  title: string
  category: string | null
  price: number
  avg_rating?: number | null
  rating?: number | null
  reviews_count?: number | null
  total_orders?: number | null
  gallery?: string[] | null
  images?: string[] | null
  tags?: string[] | null
  packages?: Record<string, Package> | null
  seller?: {
    full_name: string | null
    avatar_url: string | null
    wilaya?: string | null
  } | null
}

function minPackagePrice(svc: ServiceCardService): number {
  if (svc.packages) {
    const prices = Object.values(svc.packages).map(p => p.price).filter(Boolean)
    if (prices.length) return Math.min(...prices)
  }
  return svc.price
}

function coverImage(svc: ServiceCardService): string | null {
  if (svc.gallery && svc.gallery.length > 0) return svc.gallery[0]
  if (svc.images && svc.images.length > 0) return svc.images[0]
  return null
}

export default function ServiceCard({
  service,
  isBestSeller = false,
}: {
  service: ServiceCardService
  isBestSeller?: boolean
}) {
  const img = coverImage(service)
  const price = minPackagePrice(service)
  const rating = Number(service.avg_rating ?? service.rating ?? 0)
  const reviews = service.reviews_count ?? 0
  const name = service.seller?.full_name ?? "Freelance"
  const initials = name.trim().split(/\s+/).map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?"

  return (
    <Link
      href={`/services/${service.id}`}
      className="group flex flex-col bg-white dark:bg-[#2a2a2a] rounded-[14px] border border-[rgba(26,26,26,0.10)] dark:border-[#3a3a3a] hover:shadow-[0_8px_30px_rgba(0,0,0,0.10)] hover:-translate-y-1 transition-all duration-200 overflow-hidden"
    >
      {/* Thumbnail – 150px fixed height */}
      <div className="relative h-[150px] shrink-0 overflow-hidden">
        {img ? (
          <img
            src={img}
            alt={service.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#FFEAD5] to-[#FFF8F0] dark:from-[#2a2a2a] dark:to-[#3a3a3a] flex items-center justify-center">
            <svg className="w-10 h-10 text-[#FA8112]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Best seller badge */}
        {isBestSeller && (
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-[#1A1A1A]/85 text-white text-[10px] font-bold rounded-full font-jakarta">
            Meilleure vente
          </span>
        )}

        {/* Category chip */}
        {service.category && !isBestSeller && (
          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-white/88 text-[#1A1A1A] text-[9px] font-semibold rounded-full backdrop-blur-sm font-jakarta">
            {service.category}
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        {/* Seller row */}
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 bg-gradient-to-br from-[#FA8112] to-[#E06F05] flex items-center justify-center">
            {service.seller?.avatar_url ? (
              <img src={service.seller.avatar_url} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-[9px] font-bold">{initials}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-[#1A1A1A] dark:text-[#FAF3E1] truncate font-jakarta">{name}</p>
            {service.seller?.wilaya && (
              <p className="text-[10px] text-[rgba(26,26,26,0.40)] dark:text-gray-500 truncate">{service.seller.wilaya}</p>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-[#1A1A1A] dark:text-[#FAF3E1] leading-snug line-clamp-2 group-hover:text-[#FA8112] transition-colors flex-1 mb-3 font-jakarta">
          {service.title}
        </h3>

        {/* Footer: rating + price */}
        <div className="pt-3 border-t border-[rgba(26,26,26,0.07)] dark:border-[#3a3a3a] flex items-center justify-between">
          <div>
            {reviews > 0 ? (
              <div className="flex items-center gap-1">
                <span className="text-[#FA8112] text-xs">★</span>
                <span className="text-xs font-bold text-[#1A1A1A] dark:text-[#FAF3E1]">{rating.toFixed(1)}</span>
                <span className="text-[10px] text-[rgba(26,26,26,0.40)] dark:text-gray-500">({reviews})</span>
              </div>
            ) : (
              <span className="text-[10px] font-semibold text-[#FA8112] border border-[#FA8112]/40 rounded-full px-2 py-0.5 font-jakarta">
                Nouveau
              </span>
            )}
          </div>
          <div className="text-right">
            <p className="text-[9px] text-[rgba(26,26,26,0.40)] dark:text-gray-500">À partir de</p>
            <p className="text-sm font-extrabold text-[#1A1A1A] dark:text-[#FAF3E1] font-jakarta">
              {price.toLocaleString("fr-DZ")}{" "}
              <span className="text-[#FA8112] text-xs font-bold">DA</span>
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
