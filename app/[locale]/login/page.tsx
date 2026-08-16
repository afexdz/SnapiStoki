"use client"

import { useState, Suspense } from "react"
import { useTranslations } from "next-intl"
import { Link, useRouter } from "@/i18n/navigation"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

const ERROR_KEYS: [string, string][] = [
  ["Invalid login credentials", "invalidCredentials"],
  ["Email not confirmed", "emailNotConfirmed"],
  ["Too many requests", "tooManyRequests"],
  ["User not found", "userNotFound"],
]

function LoginForm() {
  const t = useTranslations("auth.login")
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawNext = searchParams.get("next") || "/dashboard"
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard"
  const [email, setEmail] = useState(searchParams.get("email") ?? "")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const urlError = searchParams.get("error")
  const [error, setError] = useState(urlError === "auth" ? t("error.google") : "")

  const translateError = (msg: string): string => {
    for (const [key, tKey] of ERROR_KEYS) {
      if (msg.includes(key)) return t(`error.${tKey}` as Parameters<typeof t>[0])
    }
    return t("error.generic")
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError(translateError(authError.message))
      setLoading(false)
      return
    }
    router.push(next as "/")
    router.refresh()
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    setError("")
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    })
    if (authError) {
      setError(translateError(authError.message))
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--white)] flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-0.5">
          <span className="text-xl font-extrabold text-[var(--orange)]">Pix</span>
          <span className="text-xl font-extrabold text-[var(--ink)]">Raise</span>
        </Link>
        <Link href="/register" className="text-sm text-gray-600 dark:text-gray-400 hover:text-[var(--orange)] transition-colors">
          {t("headerLink")}
        </Link>
      </header>

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[var(--orange)]/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[var(--orange-dark)]/15 rounded-full blur-3xl" />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="relative w-full max-w-md">
          <div className="bg-[var(--white)] rounded-3xl shadow-2xl shadow-[var(--orange)]/10 border border-[var(--border-subtle)] p-8 sm:p-10">

            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-[var(--orange)] to-[var(--orange-dark)] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[var(--orange)]/30">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h1 className="text-2xl font-extrabold text-[var(--ink)]">{t("title")}</h1>
              <p className="text-gray-500 text-sm mt-1">{t("subtitle")}</p>
            </div>

            {error && (
              <div className="mb-5 flex items-start gap-3 p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <button
              onClick={handleGoogle}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 border-[var(--border-subtle)] bg-[var(--white)] text-gray-700 text-sm font-semibold hover:border-[var(--orange)]/30 hover:bg-[var(--cream)] transition-all mb-6 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              {t("googleButton")}
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-[var(--cream)]" />
              <span className="text-xs text-gray-400 font-medium">{t("orEmail")}</span>
              <div className="flex-1 h-px bg-[var(--cream)]" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--ink)] mb-1.5">{t("emailLabel")}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-3.5 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("emailPlaceholder")}
                    required
                    className="w-full ps-10 pe-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--cream)] text-[var(--ink)] placeholder-gray-400 outline-none focus:border-[var(--orange)] focus:ring-2 focus:ring-[var(--orange)]/20 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-[var(--ink)]">{t("passwordLabel")}</label>
                  <a href="#" className="text-xs text-[var(--orange)] hover:text-[var(--orange-dark)] transition-colors">
                    {t("forgotPassword")}
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 start-3.5 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full ps-10 pe-12 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--cream)] text-[var(--ink)] placeholder-gray-400 outline-none focus:border-[var(--orange)] focus:ring-2 focus:ring-[var(--orange)]/20 transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 end-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[var(--orange)] hover:bg-[var(--orange-dark)] text-white font-bold rounded-xl shadow-lg shadow-[var(--orange)]/30 transition-all hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t("submitting")}
                  </>
                ) : t("submit")}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              {t("noAccount")}{" "}
              <Link href="/register" className="text-[var(--orange)] font-semibold hover:text-[var(--orange-dark)] transition-colors">
                {t("registerLink")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
