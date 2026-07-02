"use client"

import Link from "next/link"

type ProductCardProduct = {
  id: string
  title: string
  category: string | null
  price: number
  is_free?: boolean | null
  avg_rating?: number | null
  rating?: number | null
  reviews_count?: number | null
  sales_count?: number | null
  downloads?: number | null
  preview_urls?: string[] | null
  preview_images?: string[] | null
  images?: string[] | null
  format?: string | null
  file_format?: string | null
  license?: string | null
  tags?: string[] | null
  seller?: {
    full_name: string | null
    avatar_url: string | null
  } | null
}

export default function ProductCard({ product }: { product: ProductCardProduct }) {
  const img     = product.preview_urls?.[0] ?? product.preview_images?.[0] ?? null
  const rating  = Number(product.avg_rating ?? product.rating ?? 0)
  const reviews = product.reviews_count ?? 0
  const sales   = product.sales_count ?? product.downloads ?? 0
  const fmt     = product.format ?? product.file_format ?? null
  const name    = product.seller?.full_name ?? "Vendeur"
  const initials = name.trim().split(/\s+/).map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?"

  return (
    <Link href={`/products/${product.id}`} className="group block bg-white rounded-xl border border-[#EEEEEE] hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Cover image — 16:10 */}
      <div className="relative w-full" style={{ paddingBottom: "62.5%" }}>
        <div className="absolute inset-0">
          {img ? (
            <img src={img} alt={product.title} loading="lazy" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          )}
          {/* Format badge */}
          {fmt && (
            <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#1A1A1A]/80 text-white text-[10px] font-semibold rounded-md">
              {fmt}
            </span>
          )}
          {product.is_free && (
            <span className="absolute top-2 right-2 px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-md">
              Gratuit
            </span>
          )}
        </div>
      </div>

      <div className="p-3">
        {/* Seller row */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 bg-[#FA8112] flex items-center justify-center">
            {product.seller?.avatar_url ? (
              <img src={product.seller.avatar_url} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-[9px] font-bold">{initials}</span>
            )}
          </div>
          <p className="text-xs font-medium text-[#1A1A1A] truncate">{name}</p>
        </div>

        {/* Title */}
        <h3 className="text-sm font-medium text-[#1A1A1A] leading-snug line-clamp-2 group-hover:text-[#FA8112] transition-colors min-h-[2.5rem]">
          {product.title}
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
          {sales > 0 && (
            <span className="ml-auto text-[10px] text-gray-400">{sales} vente{sales > 1 ? "s" : ""}</span>
          )}
        </div>

        {/* Price + license */}
        <div className="mt-2 pt-2 border-t border-[#F5F5F5] flex items-center justify-between">
          <div>
            {product.is_free ? (
              <p className="text-sm font-bold text-green-600">Gratuit</p>
            ) : (
              <>
                <p className="text-[10px] text-gray-400">À partir de</p>
                <p className="text-sm font-bold text-[#1A1A1A]">{product.price.toLocaleString("fr-DZ")} <span className="text-[#FA8112]">DA</span></p>
              </>
            )}
          </div>
          {product.license && (
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              {product.license}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
