const footerLinks = {
  Marketplace: [
    { label: "Services", href: "/freelances" },
    { label: "Produits digitaux", href: "/marketplace" },
    { label: "Catégories", href: "/search" },
    { label: "Devenir vendeur", href: "/register" },
  ],
  Support: [
    { label: "Centre d'aide", href: "#" },
    { label: "Comment commander", href: "#" },
    { label: "Paiements & remboursements", href: "#" },
    { label: "Nous contacter", href: "#" },
  ],
  Légal: [
    { label: "Conditions d'utilisation", href: "#" },
    { label: "Politique de confidentialité", href: "#" },
    { label: "Règles vendeurs", href: "#" },
  ],
};

export default function Footer() {
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

        {/* Top grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-9 mb-11">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <a href="/" className="inline-flex items-center gap-0 mb-3 font-jakarta">
              <span className="text-2xl font-extrabold" style={{ color: "var(--orange)" }}>Pix</span>
              <span className="text-2xl font-extrabold" style={{ color: "var(--ink)" }}>Raise</span>
            </a>
            <p className="text-[14px] leading-relaxed max-w-[280px] mt-3" style={{ color: "var(--ink-60)" }}>
              La marketplace des freelances et des produits digitaux, pour les créatifs du monde entier. Conçu et développé en Algérie.
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
                    <a
                      href={item.href}
                      className="transition-colors hover:text-[var(--orange)]"
                      style={{ color: "var(--ink-60)" }}
                    >
                      {item.label}
                    </a>
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
          <span>© 2026 PixRaise — Tous droits réservés</span>
          <span className="flex items-center gap-1.5">
            <span>🇩🇿</span>
            Conçu et développé en Algérie
          </span>
        </div>
      </div>
    </footer>
  );
}
