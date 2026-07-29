"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function MessagesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/login"); return }
      setLoading(false)
    })
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--cream)] dark:bg-[var(--color-bg)] flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-[var(--orange)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--cream)] dark:bg-[var(--color-bg)] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[var(--white)] dark:bg-[var(--white)] border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] shadow-sm flex items-center justify-center">
          <svg className="w-10 h-10 text-[var(--orange)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h1 className="text-2xl font-extrabold text-[var(--ink)] dark:text-[var(--ink)] mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Messagerie bientôt disponible
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8">
          La messagerie intégrée est en cours de développement. Vous pourrez bientôt échanger directement avec vos clients et freelances.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--orange)] hover:bg-[var(--orange-dark)] text-white font-semibold rounded-xl text-sm shadow-lg shadow-[var(--orange)]/30 transition-all"
        >
          ← Retour au tableau de bord
        </Link>
      </div>
    </div>
  )
}
