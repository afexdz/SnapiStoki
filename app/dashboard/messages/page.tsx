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
      <div className="min-h-screen bg-[#FFF8F0] dark:bg-[#1a1a1a] flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-[#FA8112] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] dark:bg-[#1a1a1a] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white dark:bg-[#2a2a2a] border border-[#F0E8E0] dark:border-[#3a3a3a] shadow-sm flex items-center justify-center">
          <svg className="w-10 h-10 text-[#FA8112]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h1 className="text-2xl font-extrabold text-[#1A1A1A] dark:text-[#FAF3E1] mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Messagerie bientôt disponible
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8">
          La messagerie intégrée est en cours de développement. Vous pourrez bientôt échanger directement avec vos clients et freelances.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#FA8112] hover:bg-[#E8730F] text-white font-semibold rounded-xl text-sm shadow-lg shadow-[#FA8112]/30 transition-all"
        >
          ← Retour au tableau de bord
        </Link>
      </div>
    </div>
  )
}
