"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import { createClient } from "@/lib/supabase/client"

const benefits = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
    title: "Publiez vos services et produits",
    desc: "Créez des offres de freelance et vendez vos créations numériques directement sur PixRaise.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Paiement en dinars algériens",
    desc: "Recevez vos revenus directement en DZD, sans conversion ou frais de change.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Des clients partout dans le monde",
    desc: "Accédez à une clientèle internationale — particuliers et entreprises où que vous soyez.",
  },
]

export default function DevenirVendeurPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const check = async () => {
      const sb = createClient()
      const { data: { user } } = await sb.auth.getUser()
      if (!user) { router.push("/login?next=/devenir-vendeur"); return }

      const { data: profile } = await sb
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (profile?.role === "seller" || profile?.role === "both") {
        router.push("/dashboard/freelance")
        return
      }
      setLoading(false)
    }
    check()
  }, [router])

  const handleActivate = async () => {
    setActivating(true)
    setError(null)
    try {
      const sb = createClient()
      const { data: { user } } = await sb.auth.getUser()
      if (!user) { router.push("/login?next=/devenir-vendeur"); return }

      const { error: dbError } = await sb
        .from("profiles")
        .update({ role: "both" })
        .eq("id", user.id)

      if (dbError) throw dbError
      router.push("/dashboard/freelance")
    } catch (err: unknown) {
      setError((err as Error).message ?? "Une erreur est survenue")
      setActivating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] dark:bg-[var(--color-bg)] flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-[#FA8112] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FFF8F0] dark:bg-[var(--color-bg)]">
        {/* Hero */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#FA8112] to-[#E8730F] py-20 px-4">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-black/10 rounded-full blur-3xl" />
          <div className="relative max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold mb-6">
              <span className="w-2 h-2 bg-white rounded-full" />
              Gratuit et sans engagement
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Devenez vendeur<br />sur PixRaise
            </h1>
            <p className="text-white/80 text-lg max-w-xl mx-auto">
              Transformez votre talent en revenus. Rejoignez notre communauté de freelances créatifs et vendez vos produits digitaux partout dans le monde.
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-extrabold text-[#1A1A1A] dark:text-[#FAF3E1] text-center mb-10" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Tout ce que vous obtenez gratuitement
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="bg-white dark:bg-[var(--white)] rounded-2xl border border-[#F0E8E0] dark:border-[var(--ink-12)] p-6 shadow-sm hover:shadow-md hover:border-[#FA8112]/30 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-[#FA8112]/10 text-[#FA8112] flex items-center justify-center mb-4">
                  {b.icon}
                </div>
                <h3 className="font-bold text-[#1A1A1A] dark:text-[#FAF3E1] mb-2">{b.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA card */}
          <div className="bg-white dark:bg-[var(--white)] rounded-3xl border border-[#F0E8E0] dark:border-[var(--ink-12)] shadow-xl shadow-[#FA8112]/5 p-8 sm:p-10 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 bg-gradient-to-br from-[#FA8112] to-[#E8730F] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#FA8112]/30">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-extrabold text-[#1A1A1A] dark:text-[#FAF3E1] mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Prêt à commencer ?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              Activez votre compte vendeur en un clic. Vous conservez vos capacités d'achat.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <button
              onClick={handleActivate}
              disabled={activating}
              className="w-full py-4 bg-[#FA8112] hover:bg-[#E8730F] text-white font-bold rounded-xl shadow-lg shadow-[#FA8112]/30 transition-all hover:scale-[1.02] active:scale-100 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {activating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Activation en cours…
                </>
              ) : (
                "Activer mon compte vendeur →"
              )}
            </button>

            <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
              Vous resterez acheteur en même temps. Aucun engagement.
            </p>

            <div className="mt-6 pt-6 border-t border-[#F0E8E0] dark:border-[var(--ink-12)]">
              <Link
                href="/dashboard"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-[#FA8112] transition-colors"
              >
                ← Retour au tableau de bord
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
