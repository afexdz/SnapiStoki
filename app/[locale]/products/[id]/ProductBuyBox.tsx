"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { Link } from "@/i18n/navigation"
import { createClient } from "@/lib/supabase/client"

type ProductBuyBoxProps = {
  productId: string
  sellerId: string
  title: string
  price: number
  isFree: boolean
  fileUrl: string | null
  fileSize: string | null
  license: string | null
  format: string | null
  sales: number
  avgRating: number
  reviewCount: number
  isOwner: boolean
  currentUserId: string | null
}

export default function ProductBuyBox({
  productId,
  sellerId,
  title,
  price,
  isFree,
  fileUrl,
  fileSize,
  license,
  format,
  sales,
  avgRating,
  reviewCount,
  isOwner,
  currentUserId,
}: ProductBuyBoxProps) {
  const t = useTranslations("product.buybox")
  const router = useRouter()
  const [downloading, setDownloading] = useState(false)
  const [contacting, setContacting] = useState(false)

  const handleContact = async () => {
    if (!currentUserId) {
      router.push(`/login?next=/products/${productId}`)
      return
    }
    setContacting(true)
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId, listingType: "product", listingId: productId }),
      })
      const data = await res.json()
      if (data.conversationId) router.push(`/messages/${data.conversationId}`)
    } catch { /* silent */ } finally {
      setContacting(false)
    }
  }

  async function handleDownload() {
    if (!fileUrl) return
    if (!currentUserId) {
      router.push(`/login?next=/products/${productId}`)
      return
    }
    setDownloading(true)
    try {
      const sb = createClient()
      const { data, error } = await sb.storage.from("digital-products").download(fileUrl)
      if (error || !data) throw error
      const url = URL.createObjectURL(data)
      const a = document.createElement("a")
      a.href = url
      a.download = title.replace(/\s+/g, "_")
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert(t("error.download"))
    } finally {
      setDownloading(false)
    }
  }

  if (isOwner) {
    return (
      <div className="bg-[var(--white)] rounded-2xl border border-[var(--orange)]/30 p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-[var(--orange)]/10 text-[var(--orange)] text-xs font-bold rounded-lg">{t("owner.label")}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gray-50 dark:bg-[var(--white)] rounded-xl text-center">
            <p className="text-lg font-black text-[var(--orange)]">{sales}</p>
            <p className="text-xs text-gray-500">{t("owner.sales")}</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-[var(--white)] rounded-xl text-center">
            <p className="text-lg font-black text-[var(--ink)]">{avgRating > 0 ? avgRating.toFixed(1) : "—"}</p>
            <p className="text-xs text-gray-500">{t("owner.avgRating")}</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-[var(--white)] rounded-xl text-center">
            <p className="text-lg font-black text-[var(--ink)]">{reviewCount}</p>
            <p className="text-xs text-gray-500">{t("owner.reviews")}</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-[var(--white)] rounded-xl text-center">
            <p className="text-lg font-black text-[var(--ink)]">{isFree ? t("owner.free") : price.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{isFree ? "" : "DA"}</p>
          </div>
        </div>
        <Link href={`/dashboard/freelance/products/${productId}/edit`} className="flex items-center justify-center gap-2 w-full py-3 bg-[var(--orange)] text-white font-bold text-sm rounded-xl hover:bg-[var(--orange-dark)] transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          {t("owner.edit")}
        </Link>
        <Link href="/dashboard/freelance/products" className="flex items-center justify-center gap-2 w-full py-2.5 border border-[var(--border-subtle)] text-[var(--ink)] text-sm font-semibold rounded-xl hover:border-[var(--orange)]/40 transition-colors">
          {t("owner.manage")}
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-[var(--white)] rounded-2xl border border-[var(--border-subtle)] p-5 shadow-sm space-y-4">
      <div>
        {isFree ? (
          <p className="text-2xl font-bold text-green-600">{t("free")}</p>
        ) : (
          <>
            <p className="text-xs text-gray-400">{t("price.label")}</p>
            <p className="text-2xl font-bold text-[var(--ink)]">{price.toLocaleString()} <span className="text-base text-[var(--orange)]">DA</span></p>
          </>
        )}
      </div>

      <div className="border border-[var(--border-subtle)] rounded-xl p-3 space-y-2 text-xs text-gray-600">
        {format && (
          <div className="flex items-center justify-between">
            <span className="text-gray-400">{t("meta.format")}</span>
            <span className="font-semibold px-2 py-0.5 bg-[var(--cream)] rounded">{format}</span>
          </div>
        )}
        {fileSize && (
          <div className="flex items-center justify-between">
            <span className="text-gray-400">{t("meta.size")}</span>
            <span className="font-medium">{fileSize}</span>
          </div>
        )}
        {license && (
          <div className="flex items-center justify-between">
            <span className="text-gray-400">{t("meta.license")}</span>
            <span className="font-medium">{license}</span>
          </div>
        )}
        {sales > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-gray-400">{t("meta.downloads")}</span>
            <span className="font-medium">{sales.toLocaleString()}</span>
          </div>
        )}
      </div>

      {isFree ? (
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full py-3 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {downloading ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> {t("downloading")}</>
          ) : (
            <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" /></svg> {t("download")}</>
          )}
        </button>
      ) : (
        <button
          onClick={handleContact}
          disabled={contacting}
          className="flex items-center justify-center gap-2 w-full py-3 bg-[var(--orange)] hover:bg-[var(--orange-dark)] text-white font-bold text-sm rounded-xl transition-colors disabled:opacity-60"
        >
          {contacting ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> {t("contacting")}</>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {t("contact")}
            </>
          )}
        </button>
      )}
    </div>
  )
}
