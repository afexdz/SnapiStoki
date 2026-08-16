"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname, useRouter } from "@/i18n/navigation"
import { Link } from "@/i18n/navigation"
import { useTranslations, useLocale } from "next-intl"
import { createClient } from "@/lib/supabase/client"
import { isSeller } from "@/lib/auth/role"
import UnreadBadge from "@/components/UnreadBadge"
import type { User } from "@supabase/supabase-js"

const LOCALES = [
  { code: "fr", label: "FR", flag: "🇫🇷" },
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "ar", label: "AR", flag: "🇩🇿" },
] as const

function LanguageSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0]

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-[rgba(26,26,26,0.7)] dark:text-gray-400 hover:bg-[var(--orange-soft)] dark:hover:bg-[#2a2a2a] transition-colors border border-[rgba(26,26,26,0.12)] dark:border-[var(--border-subtle)]"
        aria-label="Changer de langue"
      >
        <span>{current.flag}</span>
        <span className="hidden sm:inline font-semibold">{current.label}</span>
        <svg className={`w-3 h-3 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute end-0 top-full mt-1.5 w-32 bg-[var(--white)] dark:bg-[var(--white)] rounded-xl border border-[rgba(26,26,26,0.12)] shadow-xl py-1 z-50">
          {LOCALES.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setOpen(false)
                router.replace(pathname, { locale: l.code })
              }}
              className={`flex items-center gap-2.5 w-full px-3 py-2 text-sm transition-colors hover:bg-[var(--orange-soft)] hover:text-[var(--orange)] ${
                l.code === locale ? "font-bold text-[var(--orange)]" : "text-[rgba(26,26,26,0.7)] dark:text-gray-300"
              }`}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const t = useTranslations("nav")
  const router = useRouter()
  const pathname = usePathname()
  const [dark, setDark] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const navLinks = [
    { labelKey: "link.services" as const, href: "/freelances" },
    { labelKey: "link.digitalProducts" as const, href: "/marketplace" },
    { labelKey: "link.howItWorks" as const, href: "/#how-it-works" },
    { labelKey: "link.becomeSeller" as const, href: "/register" },
  ]

  useEffect(() => {
    const saved = localStorage.getItem("theme")
    if (saved === "dark") {
      setDark(true)
      document.documentElement.classList.add("dark")
    }

    const supabase = createClient()

    const fetchProfile = async (uid: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("avatar_url, role")
        .eq("id", uid)
        .single()
      setAvatarUrl(data?.avatar_url ?? null)
      setUserRole(data?.role ?? null)
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) fetchProfile(data.user.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setAvatarUrl(null)
        setUserRole(null)
      }
    })

    const onClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", onClickOutside)

    return () => {
      subscription.unsubscribe()
      document.removeEventListener("mousedown", onClickOutside)
    }
  }, [])

  const toggleDark = () => {
    const next = !dark
    setDark(next)
    if (next) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setDropdownOpen(false)
    router.push("/")
    router.refresh()
  }

  const displayName = user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? ""
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "?"
  const seller = isSeller(userRole)

  return (
    <nav className="sticky top-0 z-50 bg-[var(--white)]/92 dark:bg-[var(--surface-3)]/95 backdrop-blur-md border-b border-[var(--border-subtle)] dark:border-[var(--border-strong)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[70px]">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-0 shrink-0 font-jakarta">
            <span className="text-2xl font-extrabold text-[var(--orange)] tracking-tight">Pix</span>
            <span className="text-2xl font-extrabold text-[var(--ink)] dark:text-[var(--ink)] tracking-tight">Raise</span>
          </Link>

          {/* Nav links – desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors font-jakarta ${
                    active
                      ? "text-[var(--orange)]"
                      : "text-[rgba(26,26,26,0.62)] dark:text-gray-400 hover:text-[var(--ink)] dark:hover:text-[var(--ink)]"
                  }`}
                >
                  {t(link.labelKey)}
                </Link>
              )
            })}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Language switcher */}
            <LanguageSwitcher />

            {/* Dark mode toggle */}
            <button
              onClick={toggleDark}
              className="p-2 rounded-lg text-[rgba(26,26,26,0.5)] dark:text-gray-400 hover:bg-[var(--orange-soft)] dark:hover:bg-[#2a2a2a] transition-colors"
              aria-label={t("aria.toggleTheme")}
            >
              {dark ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl hover:bg-[var(--orange-soft)] dark:hover:bg-[#2a2a2a] transition-colors"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="avatar" className="w-8 h-8 rounded-[10px] object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-[var(--orange)] to-[#E06F05] flex items-center justify-center text-white text-xs font-black">
                      {initials}
                    </div>
                  )}
                  <span className="hidden sm:block text-sm font-medium text-[var(--ink)] dark:text-[var(--ink)] max-w-[100px] truncate font-jakarta">
                    {displayName}
                  </span>
                  <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute end-0 top-full mt-2 w-52 bg-[var(--white)] dark:bg-[var(--white)] rounded-2xl border border-[rgba(26,26,26,0.12)] dark:border-[var(--border-subtle)] shadow-xl shadow-gray-200/60 dark:shadow-black/40 py-1.5 z-50">
                    <div className="px-4 py-2.5 border-b border-[var(--border-subtle)]">
                      <p className="text-xs font-semibold text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link href="/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[rgba(26,26,26,0.7)] dark:text-gray-300 hover:bg-[var(--orange-soft)] hover:text-[var(--orange)] transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                      {t("dropdown.dashboard")}
                    </Link>
                    <Link href="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[rgba(26,26,26,0.7)] dark:text-gray-300 hover:bg-[var(--orange-soft)] hover:text-[var(--orange)] transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      {t("dropdown.profile")}
                    </Link>
                    <Link href="/messages" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[rgba(26,26,26,0.7)] dark:text-gray-300 hover:bg-[var(--orange-soft)] hover:text-[var(--orange)] transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                      {t("dropdown.messages")}
                      <UnreadBadge className="ms-auto" />
                    </Link>
                    <div className="border-t border-[var(--border-subtle)] mt-1 pt-1">
                      {seller ? (
                        <>
                          <Link href="/services/new" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[rgba(26,26,26,0.7)] dark:text-gray-300 hover:bg-[var(--orange-soft)] hover:text-[var(--orange)] transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            {t("dropdown.publishService")}
                          </Link>
                          <Link href="/products/new" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[rgba(26,26,26,0.7)] dark:text-gray-300 hover:bg-[var(--orange-soft)] hover:text-[var(--orange)] transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                            {t("dropdown.sellProduct")}
                          </Link>
                        </>
                      ) : (
                        <Link href="/devenir-vendeur" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[rgba(26,26,26,0.7)] dark:text-gray-300 hover:bg-[var(--orange-soft)] hover:text-[var(--orange)] transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                          {t("dropdown.becomeSeller")}
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-[var(--border-subtle)] mt-1 pt-1">
                      <button onClick={handleSignOut} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        {t("dropdown.signOut")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden md:inline-flex text-sm font-medium text-[rgba(26,26,26,0.7)] dark:text-gray-300 hover:text-[var(--ink)] dark:hover:text-white transition-colors px-3 py-2 rounded-[10px] font-jakarta"
                >
                  {t("login")}
                </Link>
                <Link
                  href="/register"
                  className="hidden md:inline-flex items-center px-4 py-2 bg-[var(--orange)] hover:bg-[var(--orange-dark)] text-white text-sm font-semibold rounded-[10px] transition-all hover:-translate-y-px shadow-[0_4px_14px_rgba(250,129,18,0.35)] hover:shadow-[0_4px_18px_rgba(250,129,18,0.45)] font-jakarta"
                >
                  {t("register")}
                </Link>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-[rgba(26,26,26,0.6)] hover:bg-[var(--orange-soft)] dark:text-gray-400 dark:hover:bg-[#2a2a2a] transition-colors"
              aria-label={t("aria.menu")}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-1 border-t border-[var(--border-subtle)] dark:border-[#2a2a2a] pt-3 animate-slide-down">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center px-3 py-3 text-sm font-medium text-[rgba(26,26,26,0.7)] dark:text-gray-400 hover:text-[var(--ink)] dark:hover:text-[var(--ink)] hover:bg-[var(--orange-soft)] dark:hover:bg-[#2a2a2a] rounded-[10px] transition-colors font-jakarta min-h-[44px]"
              >
                {t(link.labelKey)}
              </Link>
            ))}
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center px-3 py-3 text-sm font-medium text-[rgba(26,26,26,0.7)] dark:text-gray-400 hover:text-[var(--orange)] rounded-[10px] hover:bg-[var(--orange-soft)] dark:hover:bg-[#2a2a2a] transition-colors font-jakarta min-h-[44px]">
                  {t("dropdown.dashboard")}
                </Link>
                <Link href="/messages" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-3 text-sm font-medium text-[rgba(26,26,26,0.7)] dark:text-gray-400 hover:text-[var(--orange)] rounded-[10px] hover:bg-[var(--orange-soft)] dark:hover:bg-[#2a2a2a] transition-colors font-jakarta min-h-[44px]">
                  {t("dropdown.messages")}
                  <UnreadBadge />
                </Link>
                {seller ? (
                  <>
                    <Link href="/services/new" onClick={() => setMenuOpen(false)} className="flex items-center px-3 py-3 text-sm font-medium text-[rgba(26,26,26,0.7)] dark:text-gray-400 hover:text-[var(--orange)] rounded-[10px] hover:bg-[var(--orange-soft)] dark:hover:bg-[#2a2a2a] transition-colors font-jakarta min-h-[44px]">
                      {t("dropdown.publishService")}
                    </Link>
                    <Link href="/products/new" onClick={() => setMenuOpen(false)} className="flex items-center px-3 py-3 text-sm font-medium text-[rgba(26,26,26,0.7)] dark:text-gray-400 hover:text-[var(--orange)] rounded-[10px] hover:bg-[var(--orange-soft)] dark:hover:bg-[#2a2a2a] transition-colors font-jakarta min-h-[44px]">
                      {t("dropdown.sellProduct")}
                    </Link>
                  </>
                ) : (
                  <Link href="/devenir-vendeur" onClick={() => setMenuOpen(false)} className="flex items-center px-3 py-3 text-sm font-medium text-[var(--orange)] rounded-[10px] hover:bg-[var(--orange-soft)] dark:hover:bg-[#2a2a2a] transition-colors font-jakarta min-h-[44px]">
                    {t("dropdown.becomeSeller")}
                  </Link>
                )}
                <button onClick={handleSignOut} className="flex items-center w-full text-left px-3 py-3 text-sm font-medium text-red-600 dark:text-red-400 rounded-[10px] hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-jakarta min-h-[44px]">
                  {t("dropdown.signOut")}
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2 border-t border-[var(--border-subtle)] dark:border-[#2a2a2a]">
                <Link href="/login" onClick={() => setMenuOpen(false)} className="flex items-center justify-center px-3 py-3 text-sm font-semibold text-[rgba(26,26,26,0.7)] dark:text-gray-400 hover:text-[var(--orange)] rounded-[10px] border border-[rgba(26,26,26,0.12)] hover:border-[var(--orange)]/40 transition-colors font-jakarta min-h-[44px]">
                  {t("login")}
                </Link>
                <Link href="/register" onClick={() => setMenuOpen(false)} className="flex items-center justify-center px-3 py-3 text-sm font-semibold bg-[var(--orange)] hover:bg-[var(--orange-dark)] text-white rounded-[10px] transition-colors font-jakarta min-h-[44px]">
                  {t("registerFree")}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
