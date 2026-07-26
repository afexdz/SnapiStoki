"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

type AccountType = "buyer" | "seller"

function PasswordRule({ met, label }: { met: boolean; label: string }) {
  return (
    <li className={`flex items-center gap-2 text-xs transition-colors duration-200 ${met ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-gray-500"}`}>
      <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${met ? "bg-emerald-100 dark:bg-emerald-900/40" : "bg-[#FFF8F0] dark:bg-[#2a2a2a]"}`}>
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

  const passwordsMatch = confirmPassword === "" || password === confirmPassword
  const canSubmit = terms && password === confirmPassword && confirmPassword !== ""

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      setLoading(false)
      return
    }

    const supabase = createClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role: accountType },
        emailRedirectTo: 'https://pixraise.com/auth/callback'
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      setSuccess(true)
    }

    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white dark:from-[#1a1a1a] dark:via-[#2a2a2a] dark:to-[#1a1a1a] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white dark:bg-[#2a2a2a] rounded-3xl border border-[#F0E8E0] dark:border-[#3a3a3a] shadow-2xl shadow-[#FA8112]/10 p-10 text-center">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-[#1A1A1A] dark:text-[#FAF3E1] mb-2">Vérifiez votre email !</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
            Un lien de confirmation a été envoyé à{" "}
            <strong className="text-[#1A1A1A] dark:text-[#FAF3E1]">{email}</strong>.
            Cliquez dessus pour activer votre compte.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#FA8112] hover:bg-[#E8730F] text-white font-bold rounded-xl text-sm shadow-lg shadow-[#FA8112]/30 transition-all"
          >
            Aller à la connexion →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:from-[#1a1a1a] dark:via-[#2a2a2a] dark:to-[#1a1a1a] flex flex-col">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#FA8112]/15 dark:bg-[#FA8112]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#E8730F]/15 dark:bg-[#FA8112]/10 rounded-full blur-3xl" />
      </div>

      <header className="relative px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-0.5">
          <span className="text-xl font-extrabold text-[#FA8112]">Pix</span>
          <span className="text-xl font-extrabold text-[#1A1A1A] dark:text-[#FAF3E1]">Raise</span>
        </Link>
        <Link href="/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#FA8112] transition-colors">
          Déjà membre ? Se connecter
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="relative w-full max-w-lg">
          <div className="bg-white dark:bg-[#2a2a2a] rounded-3xl shadow-2xl shadow-[#FA8112]/10 dark:shadow-[#FA8112]/5 border border-[#F0E8E0] dark:border-[#3a3a3a] p-8 sm:p-10">

            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-[#FA8112] to-[#E8730F] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#FA8112]/30">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h1 className="text-2xl font-extrabold text-[#1A1A1A] dark:text-[#FAF3E1]">Créer un compte</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Rejoignez la communauté PixRaise</p>
            </div>

            {error && typeof error === 'string' && error.length > 0 && (
              <div className="mb-5 flex items-start gap-3 p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full name */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#FAF3E1] mb-1.5">
                  Nom complet
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Karim Bensalem"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#F0E8E0] dark:border-[#3a3a3a] bg-[#FFF8F0] dark:bg-[#1a1a1a] text-[#1A1A1A] dark:text-[#FAF3E1] placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-[#FA8112] focus:ring-2 focus:ring-[#FA8112]/20 transition-all text-sm"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#FAF3E1] mb-1.5">
                  Adresse email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.com"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#F0E8E0] dark:border-[#3a3a3a] bg-[#FFF8F0] dark:bg-[#1a1a1a] text-[#1A1A1A] dark:text-[#FAF3E1] placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-[#FA8112] focus:ring-2 focus:ring-[#FA8112]/20 transition-all text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#FAF3E1] mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-gray-400">
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
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-[#F0E8E0] dark:border-[#3a3a3a] bg-[#FFF8F0] dark:bg-[#1a1a1a] text-[#1A1A1A] dark:text-[#FAF3E1] placeholder-gray-400 outline-none focus:border-[#FA8112] focus:ring-2 focus:ring-[#FA8112]/20 transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
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
                      <span className="text-xs text-gray-400">Force du mot de passe</span>
                      <span className={`text-xs font-semibold ${strengthCount <= 1 ? "text-red-500" : strengthCount === 2 ? "text-amber-500" : strengthCount === 3 ? "text-yellow-500" : "text-emerald-500"}`}>
                        {strengthCount <= 1 ? "Faible" : strengthCount === 2 ? "Moyen" : strengthCount === 3 ? "Bon" : "Excellent"}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[#FFF8F0] dark:bg-[#3a3a3a] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${strengthColor}`}
                        style={{ width: `${strengthPercent}%` }}
                      />
                    </div>
                    <ul className="mt-2.5 grid grid-cols-2 gap-1">
                      <PasswordRule met={rules.length} label="8 caractères min." />
                      <PasswordRule met={rules.uppercase} label="1 majuscule" />
                      <PasswordRule met={rules.number} label="1 chiffre" />
                      <PasswordRule met={rules.special} label="1 caractère spécial" />
                    </ul>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#FAF3E1] mb-1.5">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-gray-400">
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
                    className={`w-full pl-10 pr-12 py-3 rounded-xl border bg-[#FFF8F0] dark:bg-[#1a1a1a] text-[#1A1A1A] dark:text-[#FAF3E1] placeholder-gray-400 outline-none focus:ring-2 transition-all text-sm ${
                      passwordsMatch
                        ? "border-[#F0E8E0] dark:border-[#3a3a3a] focus:border-[#FA8112] focus:ring-[#FA8112]/20"
                        : "border-red-400 focus:border-red-400 focus:ring-red-400/20"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
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
                  <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas.</p>
                )}
              </div>

              {/* Account type */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#FAF3E1] mb-3">
                  Type de compte
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    {
                      type: "buyer" as AccountType,
                      title: "Acheteur",
                      desc: "Je cherche des services et produits",
                      icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      ),
                    },
                    {
                      type: "seller" as AccountType,
                      title: "Vendeur",
                      desc: "Je vends mes créations et services",
                      icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      ),
                    },
                  ] as const).map((opt) => (
                    <button
                      key={opt.type}
                      type="button"
                      onClick={() => setAccountType(opt.type)}
                      className={`relative flex flex-col items-center text-center p-4 rounded-2xl border-2 transition-all duration-200 ${
                        accountType === opt.type
                          ? "border-[#FA8112] bg-[#FA8112]/10 dark:bg-[#FA8112]/15 shadow-md shadow-[#FA8112]/20"
                          : "border-[#F0E8E0] dark:border-[#3a3a3a] hover:border-[#FA8112]/40 hover:bg-[#FA8112]/5 dark:hover:bg-[#FA8112]/10"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 transition-colors ${accountType === opt.type ? "bg-[#FA8112]/20 text-[#FA8112]" : "bg-[#FFF8F0] dark:bg-[#2a2a2a] text-gray-500"}`}>
                        {opt.icon}
                      </div>
                      <span className={`text-sm font-semibold ${accountType === opt.type ? "text-[#FA8112]" : "text-[#1A1A1A] dark:text-[#FAF3E1]"}`}>
                        {opt.title}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">
                        {opt.desc}
                      </span>
                      {accountType === opt.type && (
                        <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-[#FA8112] rounded-full flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5 shrink-0">
                  <input
                    type="checkbox"
                    checked={terms}
                    onChange={(e) => setTerms(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${terms ? "bg-[#FA8112] border-[#FA8112]" : "border-gray-300 dark:border-gray-600 group-hover:border-[#FA8112]/60"}`}>
                    {terms && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  J'accepte les{" "}
                  <a href="#" className="text-[#FA8112] hover:text-[#E8730F] hover:underline font-medium">conditions d'utilisation</a>
                  {" "}et la{" "}
                  <a href="#" className="text-[#FA8112] hover:text-[#E8730F] hover:underline font-medium">politique de confidentialité</a>
                </span>
              </label>

              <button
                type="submit"
                disabled={loading || !canSubmit}
                className="w-full py-3.5 bg-[#FA8112] hover:bg-[#E8730F] active:bg-[#D46A0E] text-white font-bold rounded-xl shadow-lg shadow-[#FA8112]/30 transition-all hover:scale-[1.02] active:scale-100 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Création du compte...
                  </>
                ) : "Créer mon compte"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              Déjà membre ?{" "}
              <Link href="/login" className="text-[#FA8112] font-semibold hover:text-[#E8730F] transition-colors">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
