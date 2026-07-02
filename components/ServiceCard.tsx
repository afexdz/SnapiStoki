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

export default function ServiceCard({ service }: { service: ServiceCardService }) {
  const img     = coverImage(service)
  const price   = minPackagePrice(service)
  const rating  = Number(service.avg_rating ?? service.rating ?? 0)
  const reviews = service.reviews_count ?? 0
  const name    = service.seller?.full_name ?? "Freelance"
  const initials = name.trim().split(/\s+/).map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?"

  return (
    <Link href={`/services/${service.id}`} className="group block bg-white rounded-xl border border-[#EEEEEE] hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Cover image — 16:10 */}
      <div className="relative w-full" style={{ paddingBottom: "62.5%" }}>
        <div className="absolute inset-0">
          {img ? (
            <img
              src={img}
              alt={service.title}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {service.category && (
            <span className="absolute top-2 right-2 px-2 py-0.5 bg-white/90 text-[#1A1A1A] text-[10px] font-semibold rounded-md">
              {service.category}
            </span>
          )}
        </div>
      </div>

      <div className="p-3">
        {/* Seller row */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 bg-[#FA8112] flex items-center justify-center">
            {service.seller?.avatar_url ? (
              <img src={service.seller.avatar_url} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-[9px] font-bold">{initials}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-[#1A1A1A] truncate">{name}</p>
            {service.seller?.wilaya && (
              <p className="text-[10px] text-gray-400 truncate">{service.seller.wilaya}</p>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-medium text-[#1A1A1A] leading-snug line-clamp-2 group-hover:text-[#FA8112] transition-colors min-h-[2.5rem]">
          {service.title}
        </h3>

        {/* Rating / Nouveau */}
        <div className="mt-2 flex items-center gap-1">
          {reviews > 0 ? (
            <>
              <span className="text-[#FA8112] text-xs">★</span>
              <span className="text-xs font-semibold text-[#1A1A1A]">{rating.toFixed(1)}</span>
              <span className="text-[10px] text-gray-400">({reviews} avis)</span>
            </>
          ) : (
            <span className="text-[10px] font-semibold text-[#FA8112] border border-[#FA8112] rounded-full px-2 py-0.5">
              Nouveau
            </span>
          )}
        </div>

        {/* Price */}
        <div className="mt-2 pt-2 border-t border-[#F5F5F5] flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-400">À partir de</p>
            <p className="text-sm font-bold text-[#1A1A1A]">{price.toLocaleString("fr-DZ")} <span className="text-[#FA8112]">DA</span></p>
          </div>
        </div>
      </div>
    </Link>
  )
}
