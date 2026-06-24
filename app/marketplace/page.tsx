"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const categories = ["Tout", "Templates", "Icônes & UI", "Polices", "Photos", "Vidéos", "Documents", "Art 3D"];

const products = [
  {
    id: 1,
    title: "Pack 50 Templates Logo Vectoriels",
    author: "Karim B.", initials: "KB",
    price: "4 500", originalPrice: "7 000",
    category: "Templates", color: "from-violet-500 to-indigo-600",
    rating: 4.9, sales: 312, tag: "Bestseller", tagColor: "bg-amber-500",
    format: "AI / SVG / PNG",
  },
  {
    id: 2,
    title: "Kit UI Dashboard Figma – 200+ composants",
    author: "Sara M.", initials: "SM",
    price: "7 500", originalPrice: null,
    category: "Icônes & UI", color: "from-pink-500 to-rose-500",
    rating: 5.0, sales: 89, tag: "Nouveau", tagColor: "bg-green-500",
    format: "Figma",
  },
  {
    id: 3,
    title: "Icônes Vectorielles 1000+ – Style Ligne",
    author: "Anis T.", initials: "AT",
    price: "2 000", originalPrice: "3 500",
    category: "Icônes & UI", color: "from-amber-400 to-orange-500",
    rating: 4.8, sales: 547, tag: "Populaire", tagColor: "bg-violet-600",
    format: "SVG / PNG / Figma",
  },
  {
    id: 4,
    title: "Template CV Premium Moderne (Word + PDF)",
    author: "Leila K.", initials: "LK",
    price: "1 500", originalPrice: "2 500",
    category: "Documents", color: "from-emerald-400 to-teal-500",
    rating: 4.7, sales: 823, tag: "Bestseller", tagColor: "bg-amber-500",
    format: "DOCX / PDF",
  },
  {
    id: 5,
    title: "Template E-commerce Next.js + Tailwind CSS",
    author: "Youcef R.", initials: "YR",
    price: "12 000", originalPrice: null,
    category: "Templates", color: "from-sky-500 to-blue-600",
    rating: 4.9, sales: 67, tag: "Premium", tagColor: "bg-gray-800",
    format: "Next.js / TSX",
  },
  {
    id: 6,
    title: "Pack Polices Arabes Modernes (10 familles)",
    author: "Nadia B.", initials: "NB",
    price: "1 800", originalPrice: "3 000",
    category: "Polices", color: "from-fuchsia-500 to-purple-600",
    rating: 4.6, sales: 234, tag: null, tagColor: "",
    format: "TTF / OTF / WOFF2",
  },
  {
    id: 7,
    title: "Mockups Produits 3D Réalistes – 40 scènes",
    author: "Karim B.", initials: "KB",
    price: "2 500", originalPrice: "4 000",
    category: "Art 3D", color: "from-rose-500 to-pink-600",
    rating: 4.8, sales: 178, tag: "Populaire", tagColor: "bg-violet-600",
    format: "PSD / PNG",
  },
  {
    id: 8,
    title: "Pack 20 Présentations PowerPoint Professionnelles",
    author: "Sara M.", initials: "SM",
    price: "3 000", originalPrice: "5 000",
    category: "Documents", color: "from-cyan-500 to-sky-500",
    rating: 4.7, sales: 401, tag: null, tagColor: "",
    format: "PPTX / Google Slides",
  },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className={`w-3 h-3 ${i <= Math.floor(rating) ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function MarketplacePage() {
  const [activeCategory, setActiveCategory] = useState("Tout");

  const filtered = products.filter(
    (p) => activeCategory === "Tout" || p.category === activeCategory
  );

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Hero */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-700 dark:from-indigo-950 dark:via-violet-950 dark:to-fuchsia-950 py-14 px-4 text-center">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 left-20 w-72 h-72 bg-fuchsia-400/15 rounded-full blur-3xl" />
          </div>
          <div className="relative">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-4 border border-white/20">
              <span className="text-lg">🛍️</span>
              Ressources numériques prêtes à télécharger
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
              Marketplace Numérique
            </h1>
            <p className="text-white/75 text-lg max-w-lg mx-auto">
              Templates, icônes, polices, mockups et bien plus — créés par des designers algériens.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-200 dark:shadow-violet-900/40"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-600 hover:text-violet-600 dark:hover:text-violet-400"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            <span className="font-semibold text-gray-900 dark:text-white">{filtered.length}</span> produits disponibles
          </p>

          {/* Products grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="group bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-violet-200 dark:hover:border-violet-700 hover:shadow-xl hover:shadow-violet-100/50 dark:hover:shadow-violet-900/20 transition-all duration-200 overflow-hidden cursor-pointer"
              >
                {/* Thumbnail */}
                <div className={`relative h-44 bg-gradient-to-br ${p.color} overflow-hidden`}>
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-4 right-4 w-16 h-16 bg-white rounded-2xl rotate-12" />
                    <div className="absolute bottom-4 left-8 w-12 h-12 bg-white rounded-xl -rotate-6" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white rounded-full" />
                  </div>
                  {p.tag && (
                    <span className={`absolute top-3 left-3 px-2.5 py-1 ${p.tagColor} text-white text-xs font-bold rounded-lg shadow`}>
                      {p.tag}
                    </span>
                  )}
                  {/* Format badge */}
                  <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/30 backdrop-blur-sm rounded-lg">
                    <span className="text-white text-xs font-medium">{p.format}</span>
                  </div>
                  {/* Wishlist */}
                  <button className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/40 transition-colors opacity-0 group-hover:opacity-100">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>

                <div className="p-4">
                  {/* Author */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${p.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                      {p.initials}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{p.author}</span>
                  </div>

                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-2">
                    {p.title}
                  </h3>

                  <div className="flex items-center gap-1.5 mb-3">
                    <Stars rating={p.rating} />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{p.rating}</span>
                    <span className="text-xs text-gray-400">({p.sales} ventes)</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-bold text-gray-900 dark:text-white">
                        {p.price} <span className="text-violet-600 dark:text-violet-400 text-sm">DA</span>
                      </span>
                      {p.originalPrice && (
                        <span className="text-xs text-gray-400 line-through">{p.originalPrice} DA</span>
                      )}
                    </div>
                    <button className="flex items-center gap-1 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-lg transition-all hover:scale-105">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      Acheter
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
