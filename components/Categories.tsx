"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"

const categoryMeta = [
  {
    key: "design",
    q: "Design Graphisme",
    icon: (
      <svg className="w-[23px] h-[23px]" fill="none" stroke="#FA8112" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M12 19l7-7 3 3-7 7-3-3z"/>
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
        <circle cx="11" cy="11" r="2"/>
      </svg>
    ),
  },
  {
    key: "web",
    q: "Développement web",
    icon: (
      <svg className="w-[23px] h-[23px]" fill="none" stroke="#FA8112" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/>
      </svg>
    ),
  },
  {
    key: "video",
    q: "Vidéo Animation",
    icon: (
      <svg className="w-[23px] h-[23px]" fill="none" stroke="#FA8112" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <polygon points="23 7 16 12 23 17 23 7" fill="#FA8112" stroke="#FA8112"/>
        <rect x="1" y="5" width="15" height="14" rx="2"/>
      </svg>
    ),
  },
  {
    key: "marketing",
    q: "Marketing digital",
    icon: (
      <svg className="w-[23px] h-[23px]" fill="none" stroke="#FA8112" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M3 11l18-8-8 18-2-8-8-2z" fill="#FA8112" stroke="#FA8112"/>
      </svg>
    ),
  },
  {
    key: "writing",
    q: "Rédaction Traduction",
    icon: (
      <svg className="w-[23px] h-[23px]" fill="none" stroke="#FA8112" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/>
      </svg>
    ),
  },
  {
    key: "audio",
    q: "Audio Voix off",
    icon: (
      <svg className="w-[23px] h-[23px]" fill="none" stroke="#FA8112" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M9 18V5l12-2v13"/>
        <circle cx="6" cy="18" r="3"/>
        <circle cx="18" cy="16" r="3"/>
      </svg>
    ),
  },
  {
    key: "ebooks",
    q: "E-books Formations",
    icon: (
      <svg className="w-[23px] h-[23px]" fill="none" stroke="#FA8112" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
      </svg>
    ),
  },
  {
    key: "templates",
    q: "Templates Assets",
    icon: (
      <svg className="w-[23px] h-[23px]" fill="none" stroke="#FA8112" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
]

export default function Categories() {
  const t = useTranslations("home.categories")

  return (
    <section className="py-[88px] bg-[var(--white)] dark:bg-[var(--color-bg)]">
      <div className="max-w-[1180px] mx-auto px-6">

        {/* Section head */}
        <div className="flex items-end justify-between gap-6 flex-wrap mb-11">
          <div>
            <span className="eyebrow inline-block font-jakarta font-bold text-[13px] tracking-[.08em] uppercase text-[var(--orange)] mb-3">
              {t("eyebrow")}
            </span>
            <h2 className="font-extrabold text-[var(--ink)] dark:text-[var(--ink)]" style={{ fontSize: "clamp(26px, 3.4vw, 38px)", letterSpacing: "-0.02em", lineHeight: 1.15 }}>
              {t("title")}
            </h2>
            <p className="text-[rgba(26,26,26,0.62)] dark:text-gray-400 max-w-[460px] mt-2">
              {t("subtitle")}
            </p>
          </div>
          <Link href="/freelances" className="font-semibold text-[var(--orange)] hover:underline whitespace-nowrap font-jakarta">
            {t("allCta")}
          </Link>
        </div>

        {/* 4-col grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[18px]">
          {categoryMeta.map((cat) => (
            <Link
              key={cat.key}
              href={`/search?q=${encodeURIComponent(cat.q)}`}
              className="group block border-[1.5px] border-[rgba(26,26,26,0.12)] dark:border-[var(--border-subtle)] rounded-[14px] bg-[var(--white)] dark:bg-[var(--white)] transition-all duration-[180ms] ease-out hover:border-[var(--orange)] hover:shadow-[0_12px_30px_rgba(250,129,18,0.14)] hover:-translate-y-[3px]"
              style={{ padding: "26px 22px" }}
            >
              <div
                className="flex items-center justify-center rounded-[12px] mb-4"
                style={{ width: "46px", height: "46px", background: "var(--orange-soft)", flexShrink: 0 }}
              >
                {cat.icon}
              </div>
              <h3 className="font-bold text-[16.5px] text-[var(--ink)] dark:text-[var(--ink)] mb-1 group-hover:text-[var(--orange)] transition-colors font-jakarta">
                {t(`cats.${cat.key}.label`)}
              </h3>
              <p className="text-[13.5px] text-[rgba(26,26,26,0.62)] dark:text-gray-500">
                {t(`cats.${cat.key}.sub`)}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
