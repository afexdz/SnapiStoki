"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

type Package = {
  name: string
  description: string
  delivery_days: number
  revisions: number
  price: number
}

type ServiceBuyBoxProps = {
  serviceId: string
  sellerId: string
  price: number
  deliveryDays: number
  packages: Record<string, Package> | null
  ordersCount: number
  avgRating: number
  reviewCount: number
  isOwner: boolean
  currentUserId: string | null
}

const PKG_ORDER = ["basique", "standard", "premium"] as const

export default function ServiceBuyBox({
  serviceId,
  sellerId,
  price,
  deliveryDays,
  packages,
  ordersCount,
  avgRating,
  reviewCount,
  isOwner,
  currentUserId,
}: ServiceBuyBoxProps) {
  const router = useRouter()
  const hasPkgs = packages && Object.keys(packages).length > 0
  const firstPkg = PKG_ORDER.find(k => packages && k in packages) ?? "basique"
  const [activeTab, setActiveTab] = useState<string>(firstPkg)
  const [contacting, setContacting] = useState(false)

  const pkg = packages && activeTab in packages ? packages[activeTab] : null
  const coverPrice = pkg ? pkg.price : price

  const handleContact = async () => {
    if (!currentUserId) {
      router.push(`/login?next=/services/${serviceId}`)
      return
    }
    setContacting(true)
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId, listingType: "service", listingId: serviceId }),
      })
      const data = await res.json()
      if (data.conversationId) router.push(`/messages/${data.conversationId}`)
    } catch { /* silent */ } finally {
      setContacting(false)
    }
  }

  if (isOwner) {
    return (
      <div className="bg-[var(--white)] rounded-2xl border border-[var(--orange)]/30 p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-[var(--orange)]/10 text-[var(--orange)] text-xs font-bold rounded-lg">Votre service</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gray-50 dark:bg-[var(--white)] rounded-xl text-center">
            <p className="text-lg font-black text-[var(--orange)]">{reviewCount}</p>
            <p className="text-xs text-gray-500">avis</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-[var(--white)] rounded-xl text-center">
            <p className="text-lg font-black text-[var(--ink)]">{avgRating > 0 ? avgRating.toFixed(1) : "—"}</p>
            <p className="text-xs text-gray-500">note moy.</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-[var(--white)] rounded-xl text-center">
            <p className="text-lg font-black text-[var(--ink)]">{ordersCount}</p>
            <p className="text-xs text-gray-500">commandes</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-[var(--white)] rounded-xl text-center">
            <p className="text-lg font-black text-[var(--ink)]">{coverPrice.toLocaleString("fr-DZ")}</p>
            <p className="text-xs text-gray-500">DA dès</p>
          </div>
        </div>
        <Link href={`/dashboard/freelance/services/${serviceId}/edit`} className="flex items-center justify-center gap-2 w-full py-3 bg-[var(--orange)] text-white font-bold text-sm rounded-xl hover:bg-[var(--orange-dark)] transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          Modifier ce service
        </Link>
        <Link href="/dashboard/freelance/services" className="flex items-center justify-center gap-2 w-full py-2.5 border border-[var(--border-subtle)] text-[var(--ink)] text-sm font-semibold rounded-xl hover:border-[var(--orange)]/40 transition-colors">
          Gérer mes services
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-[var(--white)] rounded-2xl border border-[var(--border-subtle)] p-5 shadow-sm">
      {hasPkgs && (
        <div className="flex rounded-xl overflow-hidden border border-[var(--border-subtle)] mb-4">
          {PKG_ORDER.filter(k => packages && k in packages).map(k => {
            const label = { basique: "Basique", standard: "Standard", premium: "Premium" }[k]
            return (
              <button
                key={k}
                onClick={() => setActiveTab(k)}
                className={`flex-1 py-2 text-xs font-semibold transition-colors ${activeTab === k ? "bg-[var(--orange)] text-white" : "bg-[var(--white)] text-gray-600 hover:bg-gray-50 dark:bg-[var(--white)]"}`}
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
          <p className="text-2xl font-bold text-[var(--ink)]">{coverPrice.toLocaleString("fr-DZ")} <span className="text-base text-[var(--orange)]">DA</span></p>
        </div>
        {!pkg && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {deliveryDays} jour{deliveryDays > 1 ? "s" : ""}
          </div>
        )}
      </div>

      <button
        onClick={handleContact}
        disabled={contacting}
        className="flex items-center justify-center gap-2 w-full py-3 bg-[var(--orange)] hover:bg-[var(--orange-dark)] text-white font-bold text-sm rounded-xl transition-colors disabled:opacity-60"
      >
        {contacting ? (
          <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> En cours…</>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Contacter le vendeur
          </>
        )}
      </button>
    </div>
  )
}
