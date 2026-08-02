"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ContactButton({
  sellerId,
  currentUserId,
}: {
  sellerId: string
  currentUserId: string | null
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleContact() {
    if (!currentUserId) {
      router.push(`/login?next=/profile/${sellerId}`)
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erreur")
      router.push(`/messages/${data.conversationId}`)
    } catch (err) {
      console.error("[ContactButton]", err)
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleContact}
      disabled={loading}
      className="px-5 py-2.5 bg-[var(--orange)] hover:bg-[var(--orange-dark)] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? "Chargement..." : "Contacter"}
    </button>
  )
}
