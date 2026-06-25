const products = [
  { title: "Pack Logo Premium + Charte Graphique", author: "Karim B.", initials: "KB", price: "3 500", originalPrice: "5 000", category: "Design", gradient: "from-violet-400 via-violet-500 to-indigo-600", rating: 4.9, sales: 234, tag: "Bestseller", tagColor: "bg-amber-500" },
  { title: "Template E-commerce Next.js + Tailwind", author: "Sara M.", initials: "SM", price: "8 000", originalPrice: null, category: "Dev", gradient: "from-pink-400 via-rose-500 to-red-500", rating: 5.0, sales: 89, tag: "Nouveau", tagColor: "bg-emerald-500" },
  { title: "Pack 500 Icônes UI – Style Ligne", author: "Anis T.", initials: "AT", price: "2 500", originalPrice: "4 000", category: "Templates", gradient: "from-amber-400 via-orange-400 to-orange-500", rating: 4.8, sales: 412, tag: "Populaire", tagColor: "bg-violet-600" },
  { title: "Thème Blog Minimaliste Moderne", author: "Leila K.", initials: "LK", price: "5 500", originalPrice: "7 000", category: "Dev", gradient: "from-emerald-400 via-teal-500 to-cyan-500", rating: 4.7, sales: 178, tag: null, tagColor: "" },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-[3px]">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className={`w-3 h-3 ${i <= Math.floor(rating) ? "text-amber-400" : "text-zinc-200 dark:text-zinc-700"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function Marketplace() {
  return (
    <section className="py-20 bg-zinc-50 dark:bg-zinc-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold tracking-widest uppercase mb-3">
              Marketplace
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
              Ressources numériques
            </h2>
          </div>
          <a href="/marketplace" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 transition-colors group">
            Tout voir
            <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((p) => (
            <div key={p.title}
              className="group bg-white dark:bg-zinc-800/80 rounded-2xl border border-zinc-100 dark:border-zinc-700/60 hover:border-violet-200 dark:hover:border-violet-700/60 hover:shadow-2xl hover:shadow-violet-100/50 dark:hover:shadow-violet-900/25 transition-all duration-300 card-hover overflow-hidden"
            >
              {/* Thumbnail */}
              <div className={`relative h-44 bg-gradient-to-br ${p.gradient} overflow-hidden`}>
                {/* Abstract shapes */}
                <div className="absolute inset-0">
                  <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/15 rounded-full" />
                  <div className="absolute bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-xl rotate-12" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white/10 rounded-2xl -rotate-6" />
                  <div className="absolute top-4 left-4 w-8 h-8 bg-white/20 rounded-lg" />
                </div>

                {/* Tag */}
                {p.tag && (
                  <span className={`absolute top-3 left-3 px-2.5 py-1 ${p.tagColor} text-white text-[10px] font-bold rounded-lg shadow-md tracking-wide uppercase`}>
                    {p.tag}
                  </span>
                )}

                {/* Category */}
                <span className="absolute top-3 right-3 px-2 py-1 bg-black/25 backdrop-blur-sm text-white text-[10px] font-semibold rounded-lg border border-white/20">
                  {p.category}
                </span>

                {/* Hover overlay with CTA */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                  <button className="btn-shimmer px-5 py-2.5 bg-white text-zinc-900 font-bold text-xs rounded-xl transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 shadow-xl">
                    Voir le produit
                  </button>
                </div>

                {/* Wishlist */}
                <button className="absolute bottom-3 right-3 w-7 h-7 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full border border-white/30 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white/40 hover:scale-110">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Author */}
                <div className="flex items-center gap-2 mb-2.5">
                  <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${p.gradient} flex items-center justify-center text-white text-[9px] font-black shrink-0`}>
                    {p.initials}
                  </div>
                  <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">{p.author}</span>
                  <span className="ml-auto flex items-center gap-0.5">
                    <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400">{p.rating}</span>
                  </span>
                </div>

                <h3 className="text-sm font-bold text-zinc-900 dark:text-white leading-snug mb-1 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-200 line-clamp-2">
                  {p.title}
                </h3>

                <p className="text-[11px] text-zinc-400 mb-4">{p.sales} ventes</p>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-700/60">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base font-black text-zinc-900 dark:text-white">
                      {p.price} <span className="text-[13px] font-bold text-violet-600 dark:text-violet-400">DA</span>
                    </span>
                    {p.originalPrice && (
                      <span className="text-[11px] text-zinc-400 line-through">{p.originalPrice}</span>
                    )}
                  </div>
                  <button className="btn-shimmer flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-[11px] font-bold rounded-lg transition-all duration-200 shadow-sm shadow-violet-500/20 hover:shadow-violet-500/35 hover:-translate-y-0.5">
                    Acheter
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
