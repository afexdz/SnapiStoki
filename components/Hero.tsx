"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const popularTags = ["Logo Design", "Développement Web", "Montage Vidéo", "SEO", "Motion Design", "Application Mobile"];

const stats = [
  { value: "5 000+", label: "Freelances" },
  { value: "12 000+", label: "Projets livrés" },
  { value: "98%", label: "Satisfaction" },
];

export default function Hero() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  return (
    <section className="relative overflow-hidden bg-[#0d0618] min-h-[88vh] flex items-center">

      {/* Dot grid */}
      <div className="absolute inset-0 dot-grid opacity-60" />

      {/* Ambient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-violet-600/25 rounded-full blur-[120px] animate-float" />
        <div className="absolute -bottom-40 right-1/4 w-[500px] h-[500px] bg-purple-700/20 rounded-full blur-[100px] animate-float-delay" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-800/15 rounded-full blur-[140px]" />
      </div>

      {/* Spinning ring accent */}
      <div className="absolute top-16 right-16 w-32 h-32 opacity-20 hidden lg:block">
        <div className="w-full h-full rounded-full border-2 border-dashed border-violet-400/50 animate-spin-slow" />
      </div>
      <div className="absolute bottom-24 left-12 w-16 h-16 opacity-15 hidden lg:block">
        <div className="w-full h-full rounded-full border border-dashed border-purple-400/50 animate-spin-slow" style={{ animationDirection: "reverse" }} />
      </div>

      <div className="relative w-full max-w-5xl mx-auto px-4 py-24 sm:py-32 text-center">

        {/* Top badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass border border-white/15 text-white/80 text-xs font-semibold mb-10 tracking-wide uppercase">
          <span className="relative flex w-2 h-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full w-2 h-2 bg-emerald-400" />
          </span>
          Lancé en Algérie · Rejoignez 5 000+ créatifs
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-[5.5rem] font-black tracking-tighter text-white leading-[1.02] mb-6">
          Le talent algérien,
          <br />
          <span className="gradient-text">à portée de clic.</span>
        </h1>

        <p className="text-lg sm:text-xl text-white/55 mb-10 max-w-xl mx-auto font-medium leading-relaxed">
          Designers, développeurs, créatifs — trouvez votre prochain talent ou vendez votre expertise sur la marketplace numérique algérienne.
        </p>

        {/* Glass search bar */}
        <div className={`relative flex items-center max-w-2xl mx-auto rounded-2xl transition-all duration-300 ${
          focused
            ? "glass border-2 border-violet-500/60 shadow-2xl shadow-violet-500/25"
            : "glass border border-white/20 shadow-xl shadow-black/30"
        }`}>
          <div className="pl-5 text-white/40 shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Rechercher un service ou un talent…"
            className="flex-1 px-4 py-4 bg-transparent text-white placeholder-white/35 outline-none text-base font-medium"
          />
          <button className="btn-shimmer btn-glow m-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-200 text-sm shrink-0 shadow-lg shadow-violet-500/30">
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
          <span className="text-white/35 text-xs font-medium self-center tracking-wide uppercase">Tendance :</span>
          {popularTags.map((tag) => (
            <button key={tag} onClick={() => setQuery(tag)}
              className="px-3 py-1.5 rounded-full bg-white/8 hover:bg-white/16 text-white/65 hover:text-white text-xs font-medium border border-white/10 hover:border-white/25 transition-all duration-200 hover:-translate-y-0.5"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Stats row */}
        <div className="mt-14 flex items-center justify-center gap-0 sm:gap-0">
          {stats.map((stat, i) => (
            <div key={stat.label} className={`flex flex-col items-center px-8 sm:px-12 ${i < stats.length - 1 ? "border-r border-white/10" : ""}`}>
              <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">{stat.value}</span>
              <span className="text-xs text-white/45 font-medium mt-0.5 tracking-wide">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
