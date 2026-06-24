"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Tab = "services" | "produits" | "avis" | "parametres";

const stats = [
  { label: "Commandes", value: "47", icon: "📦" },
  { label: "Ventes", value: "234", icon: "🛒" },
  { label: "Avis", value: "89", icon: "⭐" },
  { label: "Revenus", value: "128 500 DA", icon: "💰" },
];

const myServices = [
  { title: "Création de logo professionnel", price: "5 000", rating: 4.9, reviews: 42, color: "from-violet-500 to-indigo-600", category: "Design" },
  { title: "Site web vitrine Next.js", price: "25 000", rating: 4.8, reviews: 18, color: "from-sky-500 to-blue-600", category: "Dev" },
  { title: "Design UI/UX Figma complet", price: "18 000", rating: 5.0, reviews: 27, color: "from-fuchsia-500 to-purple-600", category: "Design" },
];

const myProducts = [
  { title: "Pack 50 Templates Logo", price: "4 500", sales: 98, color: "from-amber-400 to-orange-500", format: "AI / SVG" },
  { title: "Kit UI Dashboard Figma", price: "7 500", sales: 43, color: "from-emerald-400 to-teal-500", format: "Figma" },
  { title: "Icônes 1000+ SVG", price: "2 000", sales: 156, color: "from-pink-400 to-rose-500", format: "SVG / PNG" },
];

const reviews = [
  { author: "Youcef R.", initials: "YR", rating: 5, date: "Il y a 2 jours", comment: "Travail exceptionnel, livré avant le délai prévu. Je recommande vivement !", color: "from-sky-500 to-blue-600" },
  { author: "Sara M.", initials: "SM", rating: 5, date: "Il y a 1 semaine", comment: "Logo magnifique, très professionnel. La communication était excellente.", color: "from-pink-500 to-rose-500" },
  { author: "Leila K.", initials: "LK", rating: 4, date: "Il y a 2 semaines", comment: "Super travail, quelques révisions mais le résultat final est parfait.", color: "from-emerald-500 to-teal-500" },
  { author: "Anis T.", initials: "AT", rating: 5, date: "Il y a 3 semaines", comment: "Meilleur freelance sur la plateforme ! Résultat dépasse mes attentes.", color: "from-amber-500 to-orange-500" },
];

function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const cls = size === "md" ? "w-4 h-4" : "w-3 h-3";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className={`${cls} ${i <= rating ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>("services");

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "services", label: "Mes services", count: myServices.length },
    { id: "produits", label: "Mes produits", count: myProducts.length },
    { id: "avis", label: "Avis", count: reviews.length },
    { id: "parametres", label: "Paramètres" },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-16">
        {/* Cover + Avatar */}
        <div className="relative">
          {/* Cover */}
          <div className="h-52 sm:h-64 bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-700 dark:from-violet-900 dark:via-violet-800 dark:to-indigo-900 relative overflow-hidden">
            {/* Decorative shapes */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-400/15 rounded-full blur-3xl" />
            </div>
            {/* Edit cover button */}
            <button className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-lg border border-white/30 hover:bg-white/30 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Modifier la couverture
            </button>
          </div>

          {/* Avatar */}
          <div className="absolute left-6 sm:left-10 bottom-0 translate-y-1/2">
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-3xl sm:text-4xl font-extrabold shadow-xl border-4 border-white dark:border-gray-950">
                KB
              </div>
              <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-violet-600 hover:bg-violet-700 rounded-xl flex items-center justify-center text-white shadow-lg transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              {/* Online indicator */}
              <span className="absolute top-1 right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-gray-950" />
            </div>
          </div>
        </div>

        {/* Profile info */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between pt-16 sm:pt-12 mb-6 gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                  Karim Bensalem
                </h1>
                <span className="px-3 py-1 bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-xs font-bold rounded-full">
                  Top Vendeur
                </span>
                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-full">
                  ✓ Vérifié
                </span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Designer UI/UX & Développeur Web Full-Stack
              </p>
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Stars rating={5} size="md" />
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200">4.9</span>
                  <span className="text-sm text-gray-400">(89 avis)</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Alger, Algérie
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Membre depuis Janv. 2024
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button className="px-5 py-2.5 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl hover:border-violet-400 dark:hover:border-violet-600 hover:text-violet-600 dark:hover:text-violet-400 transition-all">
                Message
              </button>
              <button className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-all hover:scale-105 shadow-lg shadow-violet-200 dark:shadow-violet-900/40">
                Modifier le profil
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 text-center hover:border-violet-200 dark:hover:border-violet-700 hover:shadow-lg hover:shadow-violet-100/30 dark:hover:shadow-violet-900/20 transition-all">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800/60 p-1 rounded-2xl mb-8 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-max flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-gray-700 text-violet-600 dark:text-violet-400 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs ${
                    activeTab === tab.id ? "bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === "services" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {myServices.map((s) => (
                <div key={s.title} className="group bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-violet-200 dark:hover:border-violet-700 hover:shadow-xl hover:shadow-violet-100/50 dark:hover:shadow-violet-900/20 transition-all overflow-hidden">
                  <div className={`h-36 bg-gradient-to-br ${s.color} relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-4 right-4 w-14 h-14 bg-white rounded-xl rotate-12" />
                      <div className="absolute bottom-3 left-6 w-10 h-10 bg-white rounded-lg -rotate-6" />
                    </div>
                    <span className="absolute top-3 left-3 px-2 py-0.5 bg-white/20 backdrop-blur-sm text-white text-xs rounded-lg">{s.category}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-2">{s.title}</h3>
                    <div className="flex items-center gap-1.5 mb-3">
                      <Stars rating={Math.floor(s.rating)} />
                      <span className="text-xs text-gray-600 dark:text-gray-400">{s.rating} ({s.reviews})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{s.price} <span className="text-violet-600 dark:text-violet-400">DA</span></span>
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-violet-400 hover:text-violet-600 transition-all">Modifier</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <button className="flex flex-col items-center justify-center gap-3 bg-white dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-violet-400 dark:hover:border-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all p-8 group">
                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 group-hover:bg-violet-100 dark:group-hover:bg-violet-900/40 flex items-center justify-center transition-colors">
                  <svg className="w-6 h-6 text-gray-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">Ajouter un service</span>
              </button>
            </div>
          )}

          {activeTab === "produits" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {myProducts.map((p) => (
                <div key={p.title} className="group bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-violet-200 dark:hover:border-violet-700 hover:shadow-xl hover:shadow-violet-100/50 dark:hover:shadow-violet-900/20 transition-all overflow-hidden">
                  <div className={`h-36 bg-gradient-to-br ${p.color} relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-4 right-4 w-14 h-14 bg-white rounded-xl rotate-12" />
                    </div>
                    <span className="absolute bottom-3 left-3 px-2 py-0.5 bg-black/30 backdrop-blur-sm text-white text-xs rounded-lg">{p.format}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{p.title}</h3>
                    <p className="text-xs text-gray-400 mb-3">{p.sales} ventes</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{p.price} <span className="text-violet-600 dark:text-violet-400">DA</span></span>
                      <button className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-violet-400 hover:text-violet-600 transition-all">Modifier</button>
                    </div>
                  </div>
                </div>
              ))}
              <button className="flex flex-col items-center justify-center gap-3 bg-white dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-violet-400 dark:hover:border-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all p-8 group">
                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 group-hover:bg-violet-100 dark:group-hover:bg-violet-900/40 flex items-center justify-center transition-colors">
                  <svg className="w-6 h-6 text-gray-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">Ajouter un produit</span>
              </button>
            </div>
          )}

          {activeTab === "avis" && (
            <div className="space-y-4 max-w-3xl">
              {reviews.map((r) => (
                <div key={r.author} className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 hover:border-violet-200 dark:hover:border-violet-700 hover:shadow-lg hover:shadow-violet-100/30 dark:hover:shadow-violet-900/20 transition-all">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${r.color} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                      {r.initials}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <span className="font-semibold text-gray-900 dark:text-white text-sm">{r.author}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Stars rating={r.rating} />
                            <span className="text-xs text-gray-400">{r.date}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">{r.comment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "parametres" && (
            <div className="max-w-2xl space-y-6">
              <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-5">Informations personnelles</h3>
                <div className="space-y-4">
                  {[
                    { label: "Nom complet", value: "Karim Bensalem", type: "text" },
                    { label: "Adresse email", value: "karim@exemple.com", type: "email" },
                    { label: "Numéro de téléphone", value: "+213 555 123 456", type: "tel" },
                    { label: "Ville", value: "Alger, Algérie", type: "text" },
                  ].map((field) => (
                    <div key={field.label}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{field.label}</label>
                      <input
                        type={field.type}
                        defaultValue={field.value}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/60 text-gray-900 dark:text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all text-sm"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Bio</label>
                    <textarea
                      rows={3}
                      defaultValue="Designer UI/UX & Développeur Web avec 5+ ans d'expérience. Spécialisé en branding et interfaces modernes."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/60 text-gray-900 dark:text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all text-sm resize-none"
                    />
                  </div>
                  <button className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-all hover:scale-105 shadow-lg shadow-violet-200 dark:shadow-violet-900/40">
                    Sauvegarder les changements
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-red-100 dark:border-red-900/30 p-6">
                <h3 className="font-bold text-red-600 dark:text-red-400 mb-2">Zone de danger</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Une fois votre compte supprimé, toutes vos données seront définitivement perdues.</p>
                <button className="px-5 py-2.5 border-2 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm font-semibold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  Supprimer mon compte
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
