"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

type Props = {
  productId: string
  sellerId: string
  title: string
  price: number
  isFree: boolean
  fileUrl: string | null
  isOwner: boolean
  currentUserId: string | null
}

export default function ProductMobileBar({ productId, sellerId, title, price, isFree, fileUrl, isOwner, currentUserId }: Props) {
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
      alert("Erreur lors du téléchargement")
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface-3)] border-t border-[var(--border-strong)] px-4 py-3 flex items-center justify-between gap-4 shadow-[var(--shadow-elevation)]">
      {isOwner ? (
        <>
          <span className="px-2.5 py-1 bg-[var(--orange)]/10 text-[var(--orange)] text-xs font-bold rounded-lg">Votre produit</span>
          <Link href={`/dashboard/freelance/products/${productId}/edit`} className="flex-1 max-w-[220px] py-3 bg-[var(--orange)] text-white font-bold text-sm rounded-xl hover:bg-[var(--orange-dark)] transition-colors text-center">
            Modifier
          </Link>
        </>
      ) : (
        <>
          <div>
            {isFree ? (
              <p className="text-xl font-bold text-green-600">Gratuit</p>
            ) : (
              <>
                <p className="text-xs text-gray-400">Prix</p>
                <p className="text-xl font-bold text-[var(--ink)]">{price.toLocaleString("fr-DZ")} <span className="text-sm text-[var(--orange)]">DA</span></p>
              </>
            )}
          </div>
          {isFree ? (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1 max-w-[220px] py-3 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {downloading ? "Téléchargement..." : "Télécharger gratuitement"}
            </button>
          ) : (
            <button
              onClick={handleContact}
              disabled={contacting}
              className="flex items-center justify-center gap-2 flex-1 max-w-[220px] py-3 bg-[var(--orange)] text-white font-bold text-sm rounded-xl hover:bg-[var(--orange-dark)] transition-colors disabled:opacity-60"
            >
              {contacting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Contacter
                </>
              )}
            </button>
          )}
        </>
      )}
    </div>
  )
}
