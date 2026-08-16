"use client"

import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"

export default function Footer() {
  const t = useTranslations("footer")

  const footerLinks = {
    [t("marketplace.label")]: [
      { label: t("marketplace.services"), href: "/freelances" },
      { label: t("marketplace.digitalProducts"), href: "/marketplace" },
      { label: t("marketplace.categories"), href: "/search" },
      { label: t("marketplace.becomeSeller"), href: "/register" },
    ],
    [t("support.label")]: [
      { label: t("support.helpCenter"), href: "#" },
      { label: t("support.howToOrder"), href: "#" },
      { label: t("support.payments"), href: "#" },
      { label: t("support.contact"), href: "#" },
    ],
    [t("legal.label")]: [
      { label: t("legal.terms"), href: "#" },
      { label: t("legal.privacy"), href: "#" },
      { label: t("legal.sellerRules"), href: "#" },
    ],
  }

  return (
    <footer
      className="border-t"
      style={{
        background: "var(--cream)",
        borderColor: "var(--ink-12)",
        padding: "60px 0 32px",
        marginTop: "20px",
      }}
    >
      <div className="max-w-[1180px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-9 mb-11">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-0 mb-3 font-jakarta">
              <span className="text-2xl font-extrabold" style={{ color: "var(--orange)" }}>Pix</span>
              <span className="text-2xl font-extrabold" style={{ color: "var(--ink)" }}>Raise</span>
            </Link>
            <p className="text-[14px] leading-relaxed max-w-[280px] mt-3" style={{ color: "var(--ink-60)" }}>
              {t("tagline")}
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([group, items]) => (
            <div key={group}>
              <h4
                className="font-jakarta font-bold text-[14px] uppercase mb-4"
                style={{ letterSpacing: "0.04em", color: "var(--ink)" }}
              >
                {group}
              </h4>
              <ul className="flex flex-col gap-2.5 text-[14.5px]">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="transition-colors hover:text-[var(--orange)]"
                      style={{ color: "var(--ink-60)" }}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="flex justify-between items-center flex-wrap gap-4 pt-6"
          style={{
            borderTop: "1px solid var(--ink-12)",
            fontSize: "13.5px",
            color: "var(--ink-60)",
          }}
        >
          <span>{t("copyright")}</span>
          <span className="flex items-center gap-1.5">
            <span>🇩🇿</span>
            {t("madeIn")}
          </span>
        </div>
      </div>
    </footer>
  )
}
