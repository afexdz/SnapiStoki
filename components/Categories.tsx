import Link from "next/link";

const categories = [
  {
    label: "Design & Graphisme",
    subtitle: "Logos, identités, affiches",
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
    label: "Développement web",
    subtitle: "Sites, apps, e-commerce",
    q: "Développement web",
    icon: (
      <svg className="w-[23px] h-[23px]" fill="none" stroke="#FA8112" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/>
      </svg>
    ),
  },
  {
    label: "Vidéo & Animation",
    subtitle: "Montage, motion design",
    q: "Vidéo Animation",
    icon: (
      <svg className="w-[23px] h-[23px]" fill="none" stroke="#FA8112" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <polygon points="23 7 16 12 23 17 23 7" fill="#FA8112" stroke="#FA8112"/>
        <rect x="1" y="5" width="15" height="14" rx="2"/>
      </svg>
    ),
  },
  {
    label: "Marketing digital",
    subtitle: "Meta Ads, TikTok, SEO",
    q: "Marketing digital",
    icon: (
      <svg className="w-[23px] h-[23px]" fill="none" stroke="#FA8112" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M3 11l18-8-8 18-2-8-8-2z" fill="#FA8112" stroke="#FA8112"/>
      </svg>
    ),
  },
  {
    label: "Rédaction & Traduction",
    subtitle: "FR, AR, EN, Darija",
    q: "Rédaction Traduction",
    icon: (
      <svg className="w-[23px] h-[23px]" fill="none" stroke="#FA8112" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/>
      </svg>
    ),
  },
  {
    label: "Audio & Voix off",
    subtitle: "Podcasts, doublage, jingles",
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
    label: "E-books & Formations",
    subtitle: "Guides, cours, templates",
    q: "E-books Formations",
    icon: (
      <svg className="w-[23px] h-[23px]" fill="none" stroke="#FA8112" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
      </svg>
    ),
  },
  {
    label: "Templates & Assets",
    subtitle: "Canva, Notion, UI kits",
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
];

export default function Categories() {
  return (
    <section className="py-[88px] bg-white dark:bg-[#1a1a1a]">
      <div className="max-w-[1180px] mx-auto px-6">

        {/* Section head */}
        <div className="flex items-end justify-between gap-6 flex-wrap mb-11">
          <div>
            <span className="eyebrow inline-block font-jakarta font-bold text-[13px] tracking-[.08em] uppercase text-[#FA8112] mb-3">
              Catégories
            </span>
            <h2 className="font-extrabold text-[#1A1A1A] dark:text-[#FAF3E1]" style={{ fontSize: "clamp(26px, 3.4vw, 38px)", letterSpacing: "-0.02em", lineHeight: 1.15 }}>
              Explorez par domaine
            </h2>
            <p className="text-[rgba(26,26,26,0.62)] dark:text-gray-400 max-w-[460px] mt-2">
              Des compétences créatives aux services techniques, tout ce dont votre projet a besoin.
            </p>
          </div>
          <Link href="/freelances" className="font-semibold text-[#FA8112] hover:underline whitespace-nowrap font-jakarta">
            Toutes les catégories →
          </Link>
        </div>

        {/* 4-col grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[18px]">
          {categories.map((cat) => (
            <Link
              key={cat.label}
              href={`/search?q=${encodeURIComponent(cat.q)}`}
              className="group block border-[1.5px] border-[rgba(26,26,26,0.12)] dark:border-[#3a3a3a] rounded-[14px] bg-white dark:bg-[#2a2a2a] transition-all duration-[180ms] ease-out hover:border-[#FA8112] hover:shadow-[0_12px_30px_rgba(250,129,18,0.14)] hover:-translate-y-[3px]"
              style={{ padding: "26px 22px" }}
            >
              <div
                className="flex items-center justify-center rounded-[12px] mb-4"
                style={{ width: "46px", height: "46px", background: "#FFEAD5", flexShrink: 0 }}
              >
                {cat.icon}
              </div>
              <h3 className="font-bold text-[16.5px] text-[#1A1A1A] dark:text-[#FAF3E1] mb-1 group-hover:text-[#FA8112] transition-colors font-jakarta">
                {cat.label}
              </h3>
              <p className="text-[13.5px] text-[rgba(26,26,26,0.62)] dark:text-gray-500">
                {cat.subtitle}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
