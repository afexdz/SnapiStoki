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
    <svg className="w-[13px] h-[13px] fill-[#FA8112] inline-block" viewBox="0 0 24 24">
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
    <div className="w-[270px] bg-white rounded-[14px] border border-[rgba(26,26,26,0.10)] shadow-[0_18px_44px_rgba(26,26,26,0.10)] overflow-hidden">
      <div className={`h-[130px] relative ${thumbBg} flex items-center justify-center`}>
        {thumbContent}
      </div>
      <div className="p-3.5">
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="w-[22px] h-[22px] rounded-full bg-gradient-to-br from-[#FA8112] to-[#FFB86B] flex items-center justify-center shrink-0">
            <span className="text-white text-[8px] font-bold font-jakarta">{initials}</span>
          </div>
          <span className="text-[12.5px] text-[rgba(26,26,26,0.62)]">{name} — {location}</span>
        </div>
        <h3 className="text-[14.5px] font-bold text-[#1A1A1A] leading-snug mb-2.5 line-clamp-1 font-jakarta">{title}</h3>
        <div className="flex items-center justify-between">
          <span className="text-[12.5px] font-semibold text-[#1A1A1A]">
            <StarIcon /> {rating}{" "}
            <span className="text-[rgba(26,26,26,0.45)] font-normal">({reviewCount})</span>
          </span>
          <span className="text-[15px] font-extrabold text-[#1A1A1A] font-jakarta">
            {price}{" "}
            <small className="text-[11px] text-[rgba(26,26,26,0.45)] font-normal">DA</small>
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
      style={{ background: "linear-gradient(180deg, #FFF8F0 0%, #FFFFFF 100%)" }}
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
          background: "radial-gradient(circle, #FFEAD5, transparent 68%)",
          pointerEvents: "none",
        }}
      />

      <div className="relative max-w-[1180px] mx-auto px-6 py-[84px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center" style={{ gridTemplateColumns: "1.05fr 0.95fr" }}>

          {/* ── Left column ── */}
          <div>
            <h1
              className="font-extrabold text-[#1A1A1A] leading-[1.08] tracking-tight mb-5"
              style={{ fontSize: "clamp(34px, 4.6vw, 56px)", letterSpacing: "-0.03em" }}
            >
              Le talent algérien,<br />
              à portée de{" "}
              <span className="relative inline-block" style={{ whiteSpace: "nowrap" }}>
                <span className="text-[#FA8112]">clic</span>
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
                    stroke="#FA8112"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="text-[18px] text-[rgba(26,26,26,0.62)] mb-8 max-w-[480px]" style={{ lineHeight: 1.6 }}>
              Trouvez des freelances qualifiés et des produits digitaux prêts à l&apos;emploi.
              Paiement en dinars, vendeurs vérifiés, 100% algérien.
            </p>

            {/* Search bar */}
            <form
              onSubmit={handleSearch}
              className="flex bg-white rounded-[14px] overflow-hidden mb-[18px]"
              style={{
                border: "1.5px solid rgba(26,26,26,0.12)",
                boxShadow: "0 12px 34px rgba(26,26,26,0.08)",
                maxWidth: "560px",
                padding: "6px",
              }}
            >
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Essayez « logo », « site web », « montage vidéo »…'
                className="flex-1 border-none outline-none bg-transparent px-4 py-3 text-[16px] text-[#1A1A1A] placeholder-[rgba(26,26,26,0.38)] min-w-0"
                style={{ fontFamily: "var(--font-inter)" }}
              />
              <button
                type="submit"
                className="shrink-0 bg-[#FA8112] hover:bg-[#E06F05] text-white font-bold text-[15px] rounded-[10px] px-5 py-3 transition-all hover:-translate-y-px hover:shadow-[0_8px_20px_rgba(250,129,18,0.28)] font-jakarta"
              >
                Rechercher
              </button>
            </form>

            {/* Popular chips */}
            <div className="flex flex-wrap items-center gap-2.5 mb-10">
              <span className="text-[13px] text-[rgba(26,26,26,0.60)]">Populaire :</span>
              {popularChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => searchChip(chip)}
                  className="text-[13px] font-medium px-3.5 py-1.5 rounded-full bg-white border border-[rgba(26,26,26,0.12)] hover:border-[#FA8112] hover:text-[#FA8112] transition-all"
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
                    <b className="block text-[26px] font-extrabold text-[#1A1A1A] font-jakarta" style={{ letterSpacing: "-0.02em" }}>
                      {servicesCount.toLocaleString("fr-DZ")}+
                    </b>
                    <span className="text-[13.5px] text-[rgba(26,26,26,0.60)]">services actifs</span>
                  </div>
                )}
                {profilesCount > 0 && (
                  <div>
                    <b className="block text-[26px] font-extrabold text-[#1A1A1A] font-jakarta" style={{ letterSpacing: "-0.02em" }}>
                      {profilesCount.toLocaleString("fr-DZ")}+
                    </b>
                    <span className="text-[13.5px] text-[rgba(26,26,26,0.60)]">vendeurs vérifiés</span>
                  </div>
                )}
                <div>
                  <b className="block text-[26px] font-extrabold text-[#1A1A1A] font-jakarta" style={{ letterSpacing: "-0.02em" }}>
                    58
                  </b>
                  <span className="text-[13.5px] text-[rgba(26,26,26,0.60)]">wilayas couvertes</span>
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
                    boxShadow: "0 10px 26px rgba(26,26,26,0.25)",
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

              {/* Card 2 – Dev (middle-right, tilt right) */}
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
