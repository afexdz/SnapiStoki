const points = [
  {
    title: "Inscription gratuite",
    desc: "Aucun frais pour créer et publier votre boutique",
  },
  {
    title: "Paiement en dinars",
    desc: "Recevez vos gains directement, sans compte étranger",
  },
  {
    title: "Des clients partout dans le monde",
    desc: "Une audience internationale dès le premier jour",
  },
];

export default function GetStarted() {
  return (
    <section className="py-[88px] bg-white dark:bg-[var(--color-bg)]">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6">
        <div
          id="vendre"
          className="relative overflow-hidden rounded-[22px] grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] items-center gap-8 lg:gap-11 bg-[#1A1A1A] dark:bg-[var(--white)]"
          style={{
            padding: "clamp(32px, 5vw, 64px) clamp(20px, 5vw, 56px)",
          }}
        >
          {/* Decorative orange glow bottom-right */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              right: "-90px",
              bottom: "-90px",
              width: "300px",
              height: "300px",
              background: "radial-gradient(circle, rgba(250,129,18,0.35), transparent 70%)",
              borderRadius: "50%",
              pointerEvents: "none",
            }}
          />

          {/* Left */}
          <div className="relative z-[1]">
            <span
              className="inline-block font-jakarta font-bold text-[13px] tracking-[.08em] uppercase mb-4"
              style={{ color: "#FFB86B" }}
            >
              Pour les vendeurs
            </span>
            <h2
              className="font-extrabold text-white leading-[1.15] mb-3.5 font-jakarta"
              style={{ fontSize: "clamp(26px, 3.2vw, 36px)", letterSpacing: "-0.02em" }}
            >
              Vous avez un talent ?<br />
              Transformez-le en revenus.
            </h2>
            <p className="mb-7 max-w-[440px]" style={{ color: "rgba(255,255,255,0.72)", fontSize: "15px", lineHeight: 1.6 }}>
              Créez votre boutique gratuitement, publiez vos services ou produits digitaux, et vendez partout en Algérie sans intermédiaire.
            </p>
            <a
              href="/register"
              className="inline-flex items-center gap-2 font-bold text-[15px] text-white rounded-[10px] font-jakarta transition-all hover:-translate-y-px bg-[#FA8112] hover:bg-[#E06F05] shadow-[0_8px_20px_rgba(250,129,18,0.28)]"
              style={{ padding: "12px 22px" }}
            >
              Ouvrir ma boutique gratuitement
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>

          {/* Right */}
          <div className="relative z-[1] flex flex-col gap-3.5">
            {points.map((point) => (
              <div
                key={point.title}
                className="flex gap-3.5 items-start rounded-[12px]"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  padding: "16px 18px",
                }}
              >
                <span
                  className="flex items-center justify-center rounded-full shrink-0"
                  style={{ width: "22px", height: "22px", background: "#FA8112", marginTop: "2px" }}
                >
                  <svg className="w-3 h-3" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M4 12l5 5L20 6" />
                  </svg>
                </span>
                <div>
                  <b className="block text-[14.5px] font-bold text-white font-jakarta">{point.title}</b>
                  <span className="text-[13px]" style={{ color: "rgba(255,255,255,0.65)" }}>{point.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
