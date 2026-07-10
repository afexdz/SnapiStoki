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
        background: "#FFF8F0",
        borderColor: "rgba(26,26,26,0.12)",
        padding: "60px 0 32px",
        marginTop: "20px",
      }}
    >
      <div className="max-w-[1180px] mx-auto px-6">

        {/* Top grid */}
        <div
          className="grid mb-11"
          style={{ gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: "36px" }}
        >
          {/* Brand */}
          <div>
            <a href="/" className="inline-flex items-center gap-0 mb-3 font-jakarta">
              <span className="text-2xl font-extrabold text-[#FA8112]">Pix</span>
              <span className="text-2xl font-extrabold text-[#1A1A1A]">Raise</span>
            </a>
            <p className="text-[14px] leading-relaxed max-w-[280px] mt-3" style={{ color: "rgba(26,26,26,0.62)" }}>
              La marketplace algérienne des freelances et des produits digitaux. Fait en Algérie, pour l&apos;Algérie.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([group, items]) => (
            <div key={group}>
              <h4
                className="font-jakarta font-bold text-[14px] uppercase mb-4"
                style={{ letterSpacing: "0.04em", color: "#1A1A1A" }}
              >
                {group}
              </h4>
              <ul className="flex flex-col gap-2.5 text-[14.5px]">
                {items.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-[rgba(26,26,26,0.62)] hover:text-[#FA8112] transition-colors"
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
            borderTop: "1px solid rgba(26,26,26,0.12)",
            fontSize: "13.5px",
            color: "rgba(26,26,26,0.55)",
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
