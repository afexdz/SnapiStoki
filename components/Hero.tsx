"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const popularChips = [
  "Design de logo",
  "Site vitrine",
  "Montage Reels",
  "Gestion Meta Ads",
];

type HeroProps = {
  servicesCount: number;
  profilesCount: number;
};

function StarIcon() {
  return (
    <svg className="w-[13px] h-[13px] fill-[var(--orange)] inline-block" viewBox="0 0 24 24">
      <path d="M12 2l3 6.6 7 .9-5.2 4.8 1.4 7-6.2-3.6L5.8 21l1.4-7L2 9.5l7-.9z" />
    </svg>
  );
}

function MiniServiceCard({
  thumbBg,
  thumbContent,
  initials,
  name,
  location,
  title,
  rating,
  reviewCount,
  price,
}: {
  thumbBg: string;
  thumbContent: React.ReactNode;
  initials: string;
  name: string;
  location: string;
  title: string;
  rating: string;
  reviewCount: string;
  price: string;
}) {
  return (
    <div
      className="w-[270px] rounded-[14px] overflow-hidden"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--ink-12)",
        boxShadow: "0 18px 44px rgba(0,0,0,0.12)",
      }}
    >
      <div className={`h-[130px] relative ${thumbBg} flex items-center justify-center`}>
        {thumbContent}
      </div>
      <div className="p-3.5">
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="w-[22px] h-[22px] rounded-full bg-gradient-to-br from-[var(--orange)] to-[#FFB86B] flex items-center justify-center shrink-0">
            <span className="text-white text-[8px] font-bold font-jakarta">{initials}</span>
          </div>
          <span className="text-[12.5px]" style={{ color: "var(--ink-60)" }}>{name} — {location}</span>
        </div>
        <h3 className="text-[14.5px] font-bold leading-snug mb-2.5 line-clamp-1 font-jakarta" style={{ color: "var(--ink)" }}>{title}</h3>
        <div className="flex items-center justify-between">
          <span className="text-[12.5px] font-semibold" style={{ color: "var(--ink)" }}>
            <StarIcon /> {rating}{" "}
            <span className="font-normal" style={{ color: "var(--ink-60)" }}>({reviewCount})</span>
          </span>
          <span className="text-[15px] font-extrabold font-jakarta" style={{ color: "var(--ink)" }}>
            {price}{" "}
            <small className="text-[11px] font-normal" style={{ color: "var(--ink-60)" }}>DA</small>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Hero({ servicesCount, profilesCount }: HeroProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const searchChip = (chip: string) => {
    router.push(`/search?q=${encodeURIComponent(chip)}`);
  };

  const showStats = servicesCount > 0 || profilesCount > 0;

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, var(--cream) 0%, var(--white) 100%)" }}
    >
      {/* Decorative radial circle top-right */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          right: "-140px",
          top: "-140px",
          width: "420px",
          height: "420px",
          borderRadius: "50%",
          background: "radial-gradient(circle, var(--orange-soft), transparent 68%)",
          pointerEvents: "none",
        }}
      />

      <div className="relative max-w-[1180px] mx-auto px-4 sm:px-6 py-12 sm:py-[84px]">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-center">

          {/* ── Left column ── */}
          <div>
            <h1
              className="font-extrabold leading-[1.08] tracking-tight mb-5"
              style={{ fontSize: "clamp(34px, 4.6vw, 56px)", letterSpacing: "-0.03em", color: "var(--ink)" }}
            >
              Le talent algérien,<br />
              à portée de{" "}
              <span className="relative inline-block" style={{ whiteSpace: "nowrap" }}>
                <span style={{ color: "var(--orange)" }}>clic</span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 200 12"
                  preserveAspectRatio="none"
                  style={{
                    position: "absolute",
                    left: 0,
                    bottom: "-10px",
                    width: "100%",
                    height: "12px",
                  }}
                >
                  <path
                    d="M3 9 Q 50 2 100 7 T 197 5"
                    fill="none"
                    stroke="var(--orange)"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="text-[18px] mb-8 max-w-[480px]" style={{ lineHeight: 1.6, color: "var(--ink-60)" }}>
              Trouvez des freelances qualifiés et des produits digitaux prêts à l&apos;emploi.
              Paiement en dinars, vendeurs vérifiés, 100% algérien.
            </p>

            {/* Search bar */}
            <form
              onSubmit={handleSearch}
              className="flex rounded-[14px] overflow-hidden mb-[18px]"
              style={{
                background: "var(--white)",
                border: "1.5px solid var(--ink-12)",
                boxShadow: "0 12px 34px rgba(0,0,0,0.06)",
                maxWidth: "560px",
                padding: "6px",
              }}
            >
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Essayez « logo », « site web », « montage vidéo »…'
                className="flex-1 border-none outline-none bg-transparent px-4 py-3 text-[16px] min-w-0"
                style={{
                  color: "var(--ink)",
                  fontFamily: "var(--font-inter)",
                }}
              />
              <button
                type="submit"
                className="shrink-0 text-white font-bold text-[15px] rounded-[10px] px-5 py-3 transition-all hover:-translate-y-px font-jakarta"
                style={{
                  background: "var(--orange)",
                  boxShadow: "0 4px 12px rgba(250,129,18,0.28)",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--orange-dark)")}
                onMouseLeave={e => (e.currentTarget.style.background = "var(--orange)")}
              >
                Rechercher
              </button>
            </form>

            {/* Popular chips */}
            <div className="flex items-center gap-2.5 mb-8 overflow-x-auto scrollbar-hide pb-1">
              <span className="text-[13px] shrink-0" style={{ color: "var(--ink-60)" }}>Populaire :</span>
              {popularChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => searchChip(chip)}
                  className="shrink-0 text-[13px] font-medium px-3.5 py-1.5 rounded-full transition-all hover:border-[var(--orange)] hover:text-[var(--orange)]"
                  style={{
                    background: "var(--white)",
                    border: "1px solid var(--ink-12)",
                    color: "var(--ink)",
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Stats row */}
            {showStats && (
              <div className="flex flex-wrap gap-9">
                {servicesCount > 0 && (
                  <div>
                    <b className="block text-[26px] font-extrabold font-jakarta" style={{ letterSpacing: "-0.02em", color: "var(--ink)" }}>
                      {servicesCount.toLocaleString("fr-DZ")}+
                    </b>
                    <span className="text-[13.5px]" style={{ color: "var(--ink-60)" }}>services actifs</span>
                  </div>
                )}
                {profilesCount > 0 && (
                  <div>
                    <b className="block text-[26px] font-extrabold font-jakarta" style={{ letterSpacing: "-0.02em", color: "var(--ink)" }}>
                      {profilesCount.toLocaleString("fr-DZ")}+
                    </b>
                    <span className="text-[13.5px]" style={{ color: "var(--ink-60)" }}>vendeurs vérifiés</span>
                  </div>
                )}
                <div>
                  <b className="block text-[26px] font-extrabold font-jakarta" style={{ letterSpacing: "-0.02em", color: "var(--ink)" }}>
                    58
                  </b>
                  <span className="text-[13.5px]" style={{ color: "var(--ink-60)" }}>wilayas couvertes</span>
                </div>
              </div>
            )}
          </div>

          {/* ── Right column: floating service cards ── */}
          <div className="hidden lg:block">
            <div className="relative" style={{ height: "440px" }}>

              {/* Delivery badge — positioned between cards */}
              <div
                className="absolute z-[4]"
                style={{ top: "110px", right: "18%" }}
              >
                <div
                  className="flex items-center gap-2 font-bold text-[13px] text-white font-jakarta"
                  style={{
                    background: "var(--ink)",
                    padding: "10px 16px",
                    borderRadius: "999px",
                    boxShadow: "0 10px 26px rgba(0,0,0,0.25)",
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full bg-[#3ECF6A] shrink-0"
                    style={{ animation: "pulse 1.8s infinite" }}
                  />
                  Commande livrée il y a 2 min
                </div>
              </div>

              {/* Card 1 – Design (top-left, tilt left) */}
              <div
                className="absolute animate-float-card"
                style={{ top: 0, left: "12%", transform: "rotate(-3deg)", zIndex: 3 }}
              >
                <MiniServiceCard
                  thumbBg="bg-gradient-to-br from-[#FA8112] via-[#FFB86B] to-[#FFE3C2]"
                  thumbContent={
                    <span className="font-extrabold text-[44px] text-white/90 font-jakarta" style={{ fontFamily: "serif" }}>
                      Aa
                    </span>
                  }
                  initials="SM"
                  name="Sarah M."
                  location="Alger"
                  title="Je crée votre identité visuelle complète"
                  rating="4,9"
                  reviewCount="127"
                  price="4 500"
                />
              </div>

              {/* Card 2 – Dev (middle-right, tilt right) — intentionally dark thumb */}
              <div
                className="absolute animate-float-card-2"
                style={{ top: "150px", right: 0, transform: "rotate(2.5deg)", zIndex: 2 }}
              >
                <MiniServiceCard
                  thumbBg="bg-[#1A1A1A]"
                  thumbContent={
                    <span className="font-bold text-[34px] text-[#FA8112]" style={{ fontFamily: "monospace" }}>
                      {"</>"}
                    </span>
                  }
                  initials="YB"
                  name="Yacine B."
                  location="Oran"
                  title="Je développe votre site e-commerce"
                  rating="5,0"
                  reviewCount="89"
                  price="25 000"
                />
              </div>

              {/* Card 3 – Video (bottom-left, slight tilt) */}
              <div
                className="absolute animate-float-card-3"
                style={{ bottom: 0, left: 0, transform: "rotate(-1.5deg)", zIndex: 1 }}
              >
                <MiniServiceCard
                  thumbBg="bg-gradient-to-br from-[#2b2b2b] to-[#5a5a5a]"
                  thumbContent={
                    <div
                      style={{
                        width: 0,
                        height: 0,
                        borderLeft: "26px solid rgba(255,255,255,0.92)",
                        borderTop: "16px solid transparent",
                        borderBottom: "16px solid transparent",
                      }}
                    />
                  }
                  initials="AK"
                  name="Amine K."
                  location="Constantine"
                  title="Montage vidéo pro pour vos Reels"
                  rating="4,8"
                  reviewCount="203"
                  price="3 000"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
