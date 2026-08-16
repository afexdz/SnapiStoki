"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import { createClient } from "@/lib/supabase/client"

/* Icons kept outside component — no text here, purely visual */
const BENEFIT_ICONS = [
  <svg key="publish" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>,
  <svg key="visibility" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>,
  <svg key="messaging" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>,
]

const BENEFIT_KEYS = ["publish", "visibility", "messaging"] as const

export default function DevenirVendeurPage() {
  const router = useRouter()
  const t = useTranslations("becomeSeller")

  const [loading, setLoading]       = useState(true)
  const [activating, setActivating] = useState(false)
  const [error, setError]           = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
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
    init()
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
      setError((err as Error).message ?? t("cta.error"))
      setActivating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-[var(--orange)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[var(--cream)]">
        {/* Hero */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[var(--orange)] to-[var(--orange-dark)] py-20 px-4">
          {/* Logical properties: end/start swap automatically in RTL */}
          <div className="absolute -top-32 -end-32 w-96 h-96 bg-[var(--white)]/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -start-32 w-96 h-96 bg-black/10 rounded-full blur-3xl" />
          <div className="relative max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--white)]/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold mb-6">
              <span className="w-2 h-2 bg-[var(--white)] rounded-full" />
              {t("hero.badge")}
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {t("hero.title")}
            </h1>
            <p className="text-white/80 text-lg max-w-xl mx-auto">
              {t("hero.subtitle")}
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-extrabold text-[var(--ink)] text-center mb-10" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {t("benefitsTitle")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            {BENEFIT_KEYS.map((key, i) => (
              <div
                key={key}
                className="bg-[var(--white)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-sm hover:shadow-md hover:border-[var(--orange)]/30 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--orange)]/10 text-[var(--orange)] flex items-center justify-center mb-4">
                  {BENEFIT_ICONS[i]}
                </div>
                <h3 className="font-bold text-[var(--ink)] mb-2">{t(`benefits.${key}.title`)}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{t(`benefits.${key}.desc`)}</p>
              </div>
            ))}
          </div>

          {/* CTA card */}
          <div className="bg-[var(--white)] rounded-3xl border border-[var(--border-subtle)] shadow-xl shadow-[var(--orange)]/5 p-8 sm:p-10 max-w-lg mx-auto">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--orange)] to-[var(--orange-dark)] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[var(--orange)]/30">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-extrabold text-[var(--ink)] mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {t("cta.title")}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {t("cta.desc")}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              onClick={handleActivate}
              disabled={activating}
              className="w-full py-4 bg-[var(--orange)] hover:bg-[var(--orange-dark)] text-white font-bold rounded-xl shadow-lg shadow-[var(--orange)]/30 transition-all hover:scale-[1.02] active:scale-100 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {activating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t("cta.activating")}
                </>
              ) : (
                t("cta.activate")
              )}
            </button>

            <p className="mt-4 text-xs text-gray-400 text-center">
              {t("cta.note")}
            </p>

            <div className="mt-6 pt-6 border-t border-[var(--border-subtle)] text-center">
              <Link
                href="/dashboard"
                className="text-sm text-gray-500 hover:text-[var(--orange)] transition-colors"
              >
                {t("cta.back")}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
