"use client"

import { useState, useMemo } from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { createClient } from "@/lib/supabase/client"

type AccountType = "buyer" | "seller"

function PasswordRule({ met, label }: { met: boolean; label: string }) {
  return (
    <li className={`flex items-center gap-2 text-xs transition-colors duration-200 ${met ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-gray-500"}`}>
      <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${met ? "bg-emerald-100 dark:bg-emerald-900/40" : "bg-[var(--cream)] dark:bg-[var(--white)]"}`}>
        {met ? (
          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        )}
      </span>
      {label}
    </li>
  )
}

export default function RegisterPage() {
  const t = useTranslations("auth.register")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [accountType, setAccountType] = useState<AccountType>("buyer")
  const [terms, setTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleGoogle = async () => {
    setGoogleLoading(true)
    setError(null)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (authError) {
      setError(t("error.google"))
      setGoogleLoading(false)
    }
  }

  const rules = useMemo(() => ({
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }), [password])

  const strengthCount = Object.values(rules).filter(Boolean).length
  const strengthPercent = (strengthCount / 4) * 100
  const strengthColor =
    strengthCount <= 1 ? "bg-red-500" :
    strengthCount === 2 ? "bg-amber-500" :
    strengthCount === 3 ? "bg-yellow-400" :
    "bg-emerald-500"

  const strengthLabel =
    strengthCount <= 1 ? t("strength.weak") :
    strengthCount === 2 ? t("strength.medium") :
    strengthCount === 3 ? t("strength.good") :
    t("strength.excellent")

  const strengthClass =
    strengthCount <= 1 ? "text-red-500" :
    strengthCount === 2 ? "text-amber-500" :
    strengthCount === 3 ? "text-yellow-500" :
    "text-emerald-500"

  const passwordsMatch = confirmPassword === "" || password === confirmPassword
  const canSubmit = terms && password === confirmPassword && confirmPassword !== ""

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (password !== confirmPassword) {
      setError(t("passwordMismatch"))
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role: accountType },
        emailRedirectTo: "https://pixraise.com/auth/callback",
      },
    })

    if (signUpError) {
      const msg = signUpError.message ?? ""
      if (msg.toLowerCase().includes("already registered") || msg.toLowerCase().includes("user already exists") || msg.toLowerCase().includes("email already")) {
        setError(`__DUPLICATE__${email}`)
      } else {
        setError(msg)
      }
      setLoading(false)
      return
    }

    if (data.user && (data.user.identities ?? []).length === 0) {
      setError(`__DUPLICATE__${email}`)
      setLoading(false)
      return
    }

    if (data.user) setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[var(--white)] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-[var(--white)] rounded-3xl border border-[var(--border-subtle)] shadow-2xl shadow-[var(--orange)]/10 p-10 text-center">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-[var(--ink)] mb-2">{t("success.title")}</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            {t("success.desc", { email })}
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--orange)] hover:bg-[var(--orange-dark)] text-white font-bold rounded-xl text-sm shadow-lg shadow-[var(--orange)]/30 transition-all"
          >
            {t("success.goToLogin")}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--white)] flex flex-col">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[var(--orange)]/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[var(--orange-dark)]/15 rounded-full blur-3xl" />
      </div>

      <header className="relative px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-0.5">
          <span className="text-xl font-extrabold text-[var(--orange)]">Pix</span>
          <span className="text-xl font-extrabold text-[var(--ink)]">Raise</span>
        </Link>
        <Link href="/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-[var(--orange)] transition-colors">
          {t("headerLink")}
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="relative w-full max-w-lg">
          <div className="bg-[var(--white)] rounded-3xl shadow-2xl shadow-[var(--orange)]/10 border border-[var(--border-subtle)] p-8 sm:p-10">

            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-[var(--orange)] to-[var(--orange-dark)] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[var(--orange)]/30">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h1 className="text-2xl font-extrabold text-[var(--ink)]">{t("title")}</h1>
              <p className="text-gray-500 text-sm mt-1">{t("subtitle")}</p>
            </div>

            <button
              onClick={handleGoogle}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 border-[var(--border-subtle)] bg-[var(--white)] text-gray-700 text-sm font-semibold hover:border-[var(--orange)]/30 hover:bg-[var(--cream)] transition-all mb-4 disabled:opacity-60 disabled:cursor-not-allowed"
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

            {error && typeof error === "string" && error.length > 0 && (
              error.startsWith("__DUPLICATE__") ? (
                <div className="mb-5 flex items-start gap-3 p-3.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                  <svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    {t("error.duplicate")}{" "}
                    <Link href={`/login?email=${encodeURIComponent(error.replace("__DUPLICATE__", ""))}`} className="underline font-semibold hover:text-[var(--orange)]">
                      {t("error.duplicateLogin")}
                    </Link>
                  </p>
                </div>
              ) : (
                <div className="mb-5 flex items-start gap-3 p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--ink)] mb-1.5">{t("fullNameLabel")}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-3.5 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t("fullNamePlaceholder")}
                    required
                    className="w-full ps-10 pe-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--cream)] text-[var(--ink)] placeholder-gray-400 outline-none focus:border-[var(--orange)] focus:ring-2 focus:ring-[var(--orange)]/20 transition-all text-sm"
                  />
                </div>
              </div>

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
                <label className="block text-sm font-medium text-[var(--ink)] mb-1.5">{t("passwordLabel")}</label>
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
                    minLength={8}
                    className="w-full ps-10 pe-12 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--cream)] text-[var(--ink)] placeholder-gray-400 outline-none focus:border-[var(--orange)] focus:ring-2 focus:ring-[var(--orange)]/20 transition-all text-sm"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 end-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      ) : (
                        <>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </>
                      )}
                    </svg>
                  </button>
                </div>

                {password.length > 0 && (
                  <div className="mt-2.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-gray-400">{t("passwordStrength")}</span>
                      <span className={`text-xs font-semibold ${strengthClass}`}>{strengthLabel}</span>
                    </div>
                    <div className="h-1.5 w-full bg-[var(--cream)] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-300 ${strengthColor}`} style={{ width: `${strengthPercent}%` }} />
                    </div>
                    <ul className="mt-2.5 grid grid-cols-2 gap-1">
                      <PasswordRule met={rules.length} label={t("rule.minChars")} />
                      <PasswordRule met={rules.uppercase} label={t("rule.uppercase")} />
                      <PasswordRule met={rules.number} label={t("rule.number")} />
                      <PasswordRule met={rules.special} label={t("rule.special")} />
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--ink)] mb-1.5">{t("confirmPasswordLabel")}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-3.5 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className={`w-full ps-10 pe-12 py-3 rounded-xl border bg-[var(--cream)] text-[var(--ink)] placeholder-gray-400 outline-none focus:ring-2 transition-all text-sm ${
                      passwordsMatch
                        ? "border-[var(--border-subtle)] focus:border-[var(--orange)] focus:ring-[var(--orange)]/20"
                        : "border-red-400 focus:border-red-400 focus:ring-red-400/20"
                    }`}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute inset-y-0 end-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showConfirm ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      ) : (
                        <>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </>
                      )}
                    </svg>
                  </button>
                </div>
                {!passwordsMatch && (
                  <p className="text-xs text-red-500 mt-1">{t("passwordMismatch")}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--ink)] mb-3">{t("accountTypeLabel")}</label>
                <div className="grid grid-cols-2 gap-3">
                  {(["buyer", "seller"] as AccountType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAccountType(type)}
                      className={`relative flex flex-col items-center text-center p-4 rounded-2xl border-2 transition-all duration-200 ${
                        accountType === type
                          ? "border-[var(--orange)] bg-[var(--orange)]/10 shadow-md shadow-[var(--orange)]/20"
                          : "border-[var(--border-subtle)] hover:border-[var(--orange)]/40 hover:bg-[var(--orange)]/5"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 transition-colors ${accountType === type ? "bg-[var(--orange)]/20 text-[var(--orange)]" : "bg-[var(--cream)] text-gray-500"}`}>
                        {type === "buyer" ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm font-semibold ${accountType === type ? "text-[var(--orange)]" : "text-[var(--ink)]"}`}>
                        {t(type === "buyer" ? "buyer.title" : "seller.title")}
                      </span>
                      <span className="text-xs text-gray-500 mt-0.5 leading-tight">
                        {t(type === "buyer" ? "buyer.desc" : "seller.desc")}
                      </span>
                      {accountType === type && (
                        <span className="absolute top-2.5 end-2.5 w-4 h-4 bg-[var(--orange)] rounded-full flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-xs text-gray-400 text-center -mt-1">{t("roleHint")}</p>

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5 shrink-0">
                  <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="sr-only" />
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${terms ? "bg-[var(--orange)] border-[var(--orange)]" : "border-gray-300 group-hover:border-[var(--orange)]/60"}`}>
                    {terms && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-600 leading-relaxed">
                  {t("termsText")}{" "}
                  <a href="#" className="text-[var(--orange)] hover:underline font-medium">{t("termsLink")}</a>
                  {" "}&{" "}
                  <a href="#" className="text-[var(--orange)] hover:underline font-medium">{t("privacyLink")}</a>
                </span>
              </label>

              <button
                type="submit"
                disabled={loading || !canSubmit}
                className="w-full py-3.5 bg-[var(--orange)] hover:bg-[var(--orange-dark)] text-white font-bold rounded-xl shadow-lg shadow-[var(--orange)]/30 transition-all hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
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
              {t("alreadyMember")}{" "}
              <Link href="/login" className="text-[var(--orange)] font-semibold hover:text-[var(--orange-dark)] transition-colors">
                {t("loginLink")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
