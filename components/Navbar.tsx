"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Freelances", href: "/freelance" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "Explorer", href: "/#categories" },
];

export default function Navbar() {
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") { setDark(true); document.documentElement.classList.add("dark"); }
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled
        ? "glass border-b border-zinc-200/50 dark:border-white/5 shadow-lg shadow-black/5 dark:shadow-black/30"
        : "bg-white/80 dark:bg-zinc-950/80 backdrop-blur-2xl border-b border-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0 group">
            <span className="text-[1.4rem] font-black tracking-tight gradient-text">Pix</span>
            <span className="text-[1.4rem] font-black tracking-tight text-zinc-900 dark:text-white">Raise</span>
            <span className="ml-2 hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-[10px] font-bold tracking-widest uppercase">Beta</span>
          </Link>

          {/* Nav links – desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link key={link.href} href={link.href}
                  className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    active
                      ? "text-violet-600 dark:text-violet-400"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  {link.label}
                  <span className={`absolute bottom-1 left-4 right-4 h-0.5 rounded-full bg-gradient-to-r from-violet-600 to-purple-500 transition-all duration-200 ${
                    active ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0 group-hover:opacity-60 group-hover:scale-x-100"
                  }`} />
                </Link>
              );
            })}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button onClick={toggleDark}
              className="p-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/8 hover:text-zinc-900 dark:hover:text-white transition-all duration-200"
              aria-label="Basculer le thème"
            >
              {dark ? (
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M18.364 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            <Link href="/login"
              className="hidden sm:inline-flex text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors px-3 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5"
            >
              Connexion
            </Link>

            <Link href="/register"
              className="btn-shimmer btn-glow relative inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 active:translate-y-0"
            >
              S'inscrire
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>

            {/* Mobile hamburger */}
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 pt-2 space-y-0.5 border-t border-zinc-100 dark:border-white/5">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                className="flex items-center px-3 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-xl transition-all"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 flex items-center gap-2 px-2">
              <Link href="/login" className="flex-1 text-center py-2.5 text-sm font-medium border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 transition-all">
                Connexion
              </Link>
              <Link href="/register" className="flex-1 text-center py-2.5 text-sm font-semibold bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:opacity-90 transition-all">
                S'inscrire
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
