"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const popularTags = [
  "Logo Design",
  "Développement Web",
  "Montage Vidéo",
  "SEO",
  "Traduction",
  "Motion Design",
  "Application Mobile",
];

export default function Hero() {
  const [query, setQuery] = useState("");

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-700 dark:from-violet-950 dark:via-violet-900 dark:to-indigo-950">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-violet-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-48 -left-32 w-[500px] h-[500px] bg-indigo-400/20 rounded-full blur-3xl animate-float-delay" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-24 sm:py-32 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6 border border-white/20">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          +5,000 freelances actifs en Algérie
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4 tracking-tight">
          Trouvez le talent
          <br />
          <span className="text-yellow-300">qu'il vous faut,</span> maintenant.
        </h1>
        <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-xl mx-auto">
          La marketplace numérique algérienne — services, ressources et
          freelances de qualité.
        </p>

        {/* Search bar */}
        <div className="flex items-center bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden max-w-2xl mx-auto ring-4 ring-white/20">
          <div className="flex items-center gap-2 pl-4 text-gray-400">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un service… ex: création de logo"
            className="flex-1 px-3 py-4 text-gray-900 dark:text-gray-100 bg-transparent outline-none text-sm sm:text-base placeholder-gray-400 dark:placeholder-gray-500"
          />
          <button className="m-1.5 px-6 py-3 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-semibold rounded-lg transition-colors text-sm sm:text-base shrink-0">
            Rechercher
          </button>
        </div>

        {/* CTA pill buttons */}
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          {/* Button 1 – Freelance */}
          <motion.a
            href="/freelance"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="relative overflow-hidden cursor-pointer inline-flex items-center group"
            style={{
              padding: "12px 28px",
              borderRadius: "999px",
              fontSize: "14px",
              fontWeight: 500,
              border: "1px solid #7C3AED",
              color: "#7C3AED",
              background: "transparent",
            }}
          >
            {/* Fill layer */}
            <span
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: "#7C3AED" }}
            />
            {/* Shimmer */}
            <span
              className="absolute inset-0 rounded-full translate-x-[-160%] group-hover:translate-x-[160%] transition-transform duration-[600ms] ease-out skew-x-[-15deg]"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)" }}
            />
            <span className="relative group-hover:text-white transition-colors duration-300">
              Je cherche un freelance
            </span>
          </motion.a>

          {/* Button 2 – Produit digital */}
          <motion.a
            href="/marketplace"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="relative overflow-hidden cursor-pointer inline-flex items-center group"
            style={{
              padding: "12px 28px",
              borderRadius: "999px",
              fontSize: "14px",
              fontWeight: 500,
              border: "1px solid #111",
              color: "#111",
              background: "transparent",
            }}
          >
            {/* Fill layer */}
            <span
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: "#111" }}
            />
            {/* Shimmer */}
            <span
              className="absolute inset-0 rounded-full translate-x-[-160%] group-hover:translate-x-[160%] transition-transform duration-[600ms] ease-out skew-x-[-15deg]"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)" }}
            />
            <span className="relative group-hover:text-white transition-colors duration-300">
              Je cherche un produit digital
            </span>
          </motion.a>
        </div>

        {/* Popular tags */}
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <span className="text-white/70 text-sm mr-1 self-center">Populaire :</span>
          {popularTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setQuery(tag)}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm rounded-full border border-white/20 hover:border-white/40 transition-all"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
