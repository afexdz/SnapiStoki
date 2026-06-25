"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const navLinks = [
  { label: "Freelances", href: "/freelance" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "Explorer", href: "/#categories" },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Theme
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setDark(true);
      document.documentElement.classList.add("dark");
    }

    // Scroll
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);

    // Auth
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Close dropdown on outside click
    const onClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);

    return () => {
      window.removeEventListener("scroll", onScroll);
      subscription.unsubscribe();
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setDropdownOpen(false);
    router.push("/");
    router.refresh();
  };

  const displayName = user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 dark:bg-gray-950/95 backdrop-blur-md shadow-md"
          : "bg-white dark:bg-gray-950"
      } border-b border-gray-100 dark:border-gray-800`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-0.5 shrink-0">
            <span className="text-2xl font-extrabold text-violet-600 tracking-tight">Pix</span>
            <span className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Raise</span>
          </Link>

          {/* Nav links – desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30"
                      : "text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDark}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Basculer le thème"
            >
              {dark ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {user ? (
              /* Authenticated user avatar + dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-sm">
                    {initials}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[100px] truncate">
                    {displayName}
                  </span>
                  <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xl shadow-gray-200/60 dark:shadow-black/40 py-1.5 z-50">
                    <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Tableau de bord
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Mon profil
                    </Link>
                    <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Se déconnecter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Guest buttons */
              <>
                <Link
                  href="/login"
                  className="hidden sm:inline-flex text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center px-4 py-2 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white text-sm font-semibold rounded-lg transition-all shadow-sm shadow-violet-200 dark:shadow-none hover:shadow-violet-300 dark:hover:shadow-none hover:scale-105"
                >
                  S'inscrire
                </Link>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Menu"
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
          <div className="md:hidden pb-4 space-y-1 border-t border-gray-100 dark:border-gray-800 pt-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-violet-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  Tableau de bord
                </Link>
                <button onClick={handleSignOut} className="block w-full text-left px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  Se déconnecter
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-violet-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Connexion
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
