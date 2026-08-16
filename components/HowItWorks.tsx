"use client"

import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"

const stepIcons = [
  <svg key="1" className="w-6 h-6 text-[var(--orange)]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>,
  <svg key="2" className="w-6 h-6 text-[var(--orange)]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>,
  <svg key="3" className="w-6 h-6 text-[var(--orange)]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>,
]

export default function HowItWorks() {
  const t = useTranslations("home.hiw")

  const steps = [
    { number: "01", titleKey: "step1.title" as const, descKey: "step1.desc" as const, icon: stepIcons[0] },
    { number: "02", titleKey: "step2.title" as const, descKey: "step2.desc" as const, icon: stepIcons[1] },
    { number: "03", titleKey: "step3.title" as const, descKey: "step3.desc" as const, icon: stepIcons[2] },
  ]

  return (
    <section id="how-it-works" className="py-[88px] bg-[var(--cream)] dark:bg-[var(--white)]">
      <div className="max-w-[1180px] mx-auto px-6">

        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="inline-block text-[var(--orange)] text-xs font-bold uppercase tracking-widest mb-3 font-jakarta">
              {t("sectionLabel")}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--ink)] dark:text-[var(--ink)]">
              {t("title")}
            </h2>
            <p className="mt-2 text-[rgba(26,26,26,0.55)] dark:text-gray-400 text-sm max-w-md">
              {t("subtitle")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className="relative bg-[var(--white)] dark:bg-[var(--color-bg)] rounded-[14px] border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] p-8 hover:shadow-[0_6px_24px_rgba(250,129,18,0.10)] hover:-translate-y-1 transition-all duration-200"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[var(--orange-soft)] dark:bg-[var(--orange)]/20 flex items-center justify-center shrink-0">
                  <span className="text-[var(--orange)] text-sm font-extrabold font-jakarta">{step.number}</span>
                </div>
                <div className="flex-1 h-px bg-[rgba(26,26,26,0.08)] dark:bg-[var(--cream)]" />
                {i < steps.length - 1 && (
                  <svg className="w-4 h-4 text-[rgba(26,26,26,0.20)] dark:text-gray-600 shrink-0 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>

              <div className="w-12 h-12 rounded-xl bg-[var(--orange-soft)] dark:bg-[var(--orange)]/20 flex items-center justify-center mb-5">
                {step.icon}
              </div>

              <h3 className="text-lg font-extrabold text-[var(--ink)] dark:text-[var(--ink)] mb-3 font-jakarta">
                {t(step.titleKey)}
              </h3>
              <p className="text-[rgba(26,26,26,0.55)] dark:text-gray-400 text-sm leading-relaxed">
                {t(step.descKey)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-[var(--orange)] hover:bg-[var(--orange-dark)] text-white font-semibold rounded-[10px] shadow-[0_4px_14px_rgba(250,129,18,0.35)] hover:shadow-[0_6px_20px_rgba(250,129,18,0.45)] transition-all hover:-translate-y-px font-jakarta text-sm"
          >
            {t("cta")}
            <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
