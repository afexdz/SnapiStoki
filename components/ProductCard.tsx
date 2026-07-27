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
  const img = product.preview_urls?.[0] ?? product.preview_images?.[0] ?? null
  const rating = Number(product.avg_rating ?? product.rating ?? 0)
  const reviews = product.reviews_count ?? 0
  const sales = product.sales_count ?? product.downloads ?? 0
  const fmt = product.format ?? product.file_format ?? null
  const name = product.seller?.full_name ?? "Vendeur"
  const initials = name.trim().split(/\s+/).map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?"

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col bg-white dark:bg-[var(--white)] rounded-[14px] border border-[rgba(26,26,26,0.10)] dark:border-[var(--ink-12)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.10)] hover:-translate-y-1 transition-all duration-200 overflow-hidden"
    >
      {/* Thumbnail – 150px fixed height */}
      <div className="relative h-[150px] shrink-0 overflow-hidden">
        {img ? (
          <img
            src={img}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#FFEAD5] to-[#FFF8F0] dark:from-[#2a2a2a] dark:to-[#3a3a3a] flex items-center justify-center">
            <svg className="w-10 h-10 text-[#FA8112]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}

        {/* Format badge (dark pill top-left) */}
        {fmt && (
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-[#1A1A1A]/85 text-white text-[10px] font-bold rounded-full backdrop-blur-sm font-jakarta">
            {fmt}
          </span>
        )}

        {/* Free badge */}
        {product.is_free && (
          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full font-jakarta">
            Gratuit
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        {/* Seller row */}
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 bg-gradient-to-br from-[#FA8112] to-[#E06F05] flex items-center justify-center">
            {product.seller?.avatar_url ? (
              <img src={product.seller.avatar_url} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-[9px] font-bold">{initials}</span>
            )}
          </div>
          <p className="text-[11px] font-semibold text-[#1A1A1A] dark:text-[#FAF3E1] truncate font-jakarta">{name}</p>
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-[#1A1A1A] dark:text-[#FAF3E1] leading-snug line-clamp-2 group-hover:text-[#FA8112] transition-colors flex-1 mb-3 font-jakarta">
          {product.title}
        </h3>

        {/* Footer: rating + price */}
        <div className="pt-3 border-t border-[rgba(26,26,26,0.07)] dark:border-[var(--ink-12)] flex items-center justify-between">
          <div>
            {reviews > 0 ? (
              <div className="flex items-center gap-1">
                <span className="text-[#FA8112] text-xs">★</span>
                <span className="text-xs font-bold text-[#1A1A1A] dark:text-[#FAF3E1]">{rating.toFixed(1)}</span>
                <span className="text-[10px] text-[rgba(26,26,26,0.40)] dark:text-gray-500">({reviews})</span>
              </div>
            ) : sales > 0 ? (
              <span className="text-[10px] text-[rgba(26,26,26,0.40)] dark:text-gray-500">{sales} vente{sales > 1 ? "s" : ""}</span>
            ) : (
              <span className="text-[10px] font-semibold text-[#FA8112] border border-[#FA8112]/40 rounded-full px-2 py-0.5 font-jakarta">
                Nouveau
              </span>
            )}
          </div>
          <div className="text-right">
            {product.is_free ? (
              <p className="text-sm font-extrabold text-emerald-600 font-jakarta">Gratuit</p>
            ) : (
              <>
                <p className="text-[9px] text-[rgba(26,26,26,0.40)] dark:text-gray-500">À partir de</p>
                <p className="text-sm font-extrabold text-[#1A1A1A] dark:text-[#FAF3E1] font-jakarta">
                  {product.price.toLocaleString("fr-DZ")}{" "}
                  <span className="text-[#FA8112] text-xs font-bold">DA</span>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
