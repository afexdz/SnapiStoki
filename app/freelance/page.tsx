"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const categories = ["Tous", "Design", "Développement", "Vidéo", "Rédaction", "Audio", "Marketing", "Photo"];

const services = [
  {
    id: 1,
    title: "Création de logo professionnel + charte graphique complète",
    freelancer: "Karim Bensalem",
    initials: "KB",
    rating: 4.9, reviews: 142, price: "5 000", category: "Design",
    color: "from-violet-500 to-indigo-600",
    badge: "Top Vendeur", delivery: "3 jours",
  },
  {
    id: 2,
    title: "Site web vitrine moderne sur mesure (Next.js / React)",
    freelancer: "Anis Touati",
    initials: "AT",
    rating: 4.8, reviews: 76, price: "25 000", category: "Développement",
    color: "from-sky-500 to-blue-600",
    badge: null, delivery: "7 jours",
  },
  {
    id: 3,
    title: "Motion design & animation vidéo pour vos réseaux sociaux",
    freelancer: "Nadia Boudiaf",
    initials: "NB",
    rating: 5.0, reviews: 58, price: "12 000", category: "Vidéo",
    color: "from-fuchsia-500 to-purple-600",
    badge: "Recommandé", delivery: "5 jours",
  },
  {
    id: 4,
    title: "Rédaction d'articles SEO optimisés (500–2000 mots)",
    freelancer: "Sara Mekkaoui",
    initials: "SM",
    rating: 4.7, reviews: 211, price: "3 500", category: "Rédaction",
    color: "from-emerald-500 to-teal-600",
    badge: "Top Vendeur", delivery: "2 jours",
  },
  {
    id: 5,
    title: "Application mobile Flutter (iOS + Android) complète",
    freelancer: "Youcef Rahmani",
    initials: "YR",
    rating: 4.9, reviews: 53, price: "35 000", category: "Développement",
    color: "from-amber-500 to-orange-600",
    badge: null, delivery: "21 jours",
  },
  {
    id: 6,
    title: "Montage vidéo professionnel avec effets et sous-titres",
    freelancer: "Leila Khaldi",
    initials: "LK",
    rating: 4.8, reviews: 94, price: "8 000", category: "Vidéo",
    color: "from-rose-500 to-pink-600",
    badge: null, delivery: "4 jours",
  },
  {
    id: 7,
    title: "Design UI/UX complet sur Figma – maquette + prototype",
    freelancer: "Karim Bensalem",
    initials: "KB",
    rating: 4.9, reviews: 67, price: "18 000", category: "Design",
    color: "from-violet-400 to-purple-600",
    badge: "Recommandé", delivery: "6 jours",
  },
  {
    id: 8,
    title: "Gestion et stratégie réseaux sociaux (Instagram, Facebook)",
    freelancer: "Sara Mekkaoui",
    initials: "SM",
    rating: 4.6, reviews: 183, price: "6 000", category: "Marketing",
    color: "from-cyan-500 to-sky-600",
    badge: null, delivery: "En continu",
  },
];

const sortOptions = ["Pertinence", "Mieux notés", "Prix croissant", "Prix décroissant", "Récents"];

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

export default function FreelancePage() {
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [sort, setSort] = useState("Pertinence");

  const filtered = services.filter(
    (s) => activeCategory === "Tous" || s.category === activeCategory
  );

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Page hero */}
        <div className="bg-gradient-to-br from-violet-700 to-indigo-700 dark:from-violet-950 dark:to-indigo-950 py-14 px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            Trouvez le freelance idéal
          </h1>
          <p className="text-white/75 text-lg max-w-lg mx-auto">
            Des milliers de professionnels algériens prêts à réaliser votre projet.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filter bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            {/* Category pills */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
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

            {/* Sort dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm text-gray-500 dark:text-gray-400">Trier :</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 outline-none focus:border-violet-400 transition-colors"
              >
                {sortOptions.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            <span className="font-semibold text-gray-900 dark:text-white">{filtered.length}</span> services disponibles
          </p>

          {/* Services grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((service) => (
              <div
                key={service.id}
                className="group bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-violet-200 dark:hover:border-violet-700 hover:shadow-xl hover:shadow-violet-100/50 dark:hover:shadow-violet-900/20 transition-all duration-200 overflow-hidden cursor-pointer"
              >
                {/* Thumbnail */}
                <div className={`relative h-40 bg-gradient-to-br ${service.color} overflow-hidden`}>
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-4 right-4 w-16 h-16 bg-white rounded-xl rotate-12" />
                    <div className="absolute bottom-3 left-6 w-10 h-10 bg-white rounded-lg -rotate-6" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white rounded-full" />
                  </div>
                  {service.badge && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-lg border border-white/30">
                      {service.badge}
                    </span>
                  )}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/30 backdrop-blur-sm rounded-lg">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-white text-xs">{service.delivery}</span>
                  </div>
                </div>

                <div className="p-4">
                  {/* Freelancer */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${service.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                      {service.initials}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{service.freelancer}</span>
                  </div>

                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug mb-3 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-2">
                    {service.title}
                  </h3>

                  <div className="flex items-center gap-1.5 mb-4">
                    <Stars rating={service.rating} />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{service.rating}</span>
                    <span className="text-xs text-gray-400">({service.reviews})</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div>
                      <span className="text-xs text-gray-400">À partir de</span>
                      <div className="text-sm font-bold text-gray-900 dark:text-white">
                        {service.price} <span className="text-violet-600 dark:text-violet-400">DA</span>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-lg transition-all hover:scale-105">
                      Voir
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
