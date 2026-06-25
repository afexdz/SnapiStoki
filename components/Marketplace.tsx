const products = [
  {
    title: "Pack Logo Premium + Charte Graphique",
    author: "Karim B.",
    authorInitials: "KB",
    price: "3 500",
    originalPrice: "5 000",
    category: "Design",
    color: "from-[#FA8112] to-[#E8730F]",
    rating: 4.9,
    sales: 234,
    tag: "Bestseller",
    tagColor: "bg-amber-500",
  },
  {
    title: "Template E-commerce Next.js + Tailwind",
    author: "Sara M.",
    authorInitials: "SM",
    price: "8 000",
    originalPrice: null,
    category: "Développement",
    color: "from-pink-400 to-rose-500",
    rating: 5.0,
    sales: 89,
    tag: "Nouveau",
    tagColor: "bg-green-500",
  },
  {
    title: "Pack 500 Icônes UI – Style Moderne",
    author: "Anis T.",
    authorInitials: "AT",
    price: "2 500",
    originalPrice: "4 000",
    category: "Templates",
    color: "from-amber-400 to-orange-500",
    rating: 4.8,
    sales: 412,
    tag: "Populaire",
    tagColor: "bg-[#FA8112]",
  },
  {
    title: "Thème Blog Personnel – Élégant & Minimaliste",
    author: "Leila K.",
    authorInitials: "LK",
    price: "5 500",
    originalPrice: "7 000",
    category: "Développement",
    color: "from-emerald-400 to-teal-500",
    rating: 4.7,
    sales: 178,
    tag: null,
    tagColor: "",
  },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`w-3 h-3 ${
            i <= Math.floor(rating) ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function Marketplace() {
  return (
    <section className="py-16 bg-[#F5E7C6] dark:bg-[#2a2a2a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#222222] dark:text-[#FAF3E1]">
              Marketplace numérique
            </h2>
            <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
              Templates, packs et ressources prêts à l'emploi
            </p>
          </div>
          <a
            href="#"
            className="hidden sm:inline-flex text-sm font-medium text-[#FA8112] hover:text-[#E8730F] transition-colors"
          >
            Voir tout →
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {products.map((p) => (
            <div
              key={p.title}
              className="group bg-[#FAF3E1] dark:bg-[#1a1a1a] rounded-2xl border border-[#F5E7C6] dark:border-[#3a3a3a] hover:border-[#FA8112]/30 dark:hover:border-[#FA8112]/30 hover:shadow-xl hover:shadow-[#FA8112]/10 transition-all duration-200 overflow-hidden"
            >
              {/* Thumbnail */}
              <div className={`relative h-44 bg-gradient-to-br ${p.color} overflow-hidden`}>
                {/* Decorative shapes */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-4 right-4 w-20 h-20 bg-white rounded-2xl rotate-12" />
                  <div className="absolute bottom-4 left-8 w-14 h-14 bg-white rounded-xl -rotate-6" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-white rounded-full" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-lg drop-shadow text-center px-4">
                    {p.title}
                  </span>
                </div>
                {p.tag && (
                  <span
                    className={`absolute top-3 left-3 px-2.5 py-1 ${p.tagColor} text-white text-xs font-semibold rounded-lg shadow`}
                  >
                    {p.tag}
                  </span>
                )}
                <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/20 backdrop-blur-sm text-white text-xs rounded-lg border border-white/30">
                  {p.category}
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-semibold text-[#222222] dark:text-[#FAF3E1] text-sm leading-snug mb-3 group-hover:text-[#FA8112] transition-colors line-clamp-2">
                  {p.title}
                </h3>

                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#FA8112] to-[#E8730F] flex items-center justify-center text-white text-xs font-bold">
                    {p.authorInitials}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{p.author}</span>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Stars rating={p.rating} />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {p.rating}
                  </span>
                  <span className="text-xs text-gray-400">({p.sales} ventes)</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-[#222222] dark:text-[#FAF3E1]">
                      {p.price}{" "}
                      <span className="text-[#FA8112] text-base">DA</span>
                    </span>
                    {p.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        {p.originalPrice} DA
                      </span>
                    )}
                  </div>
                  <button className="px-4 py-2 bg-[#FA8112] hover:bg-[#E8730F] active:bg-[#D46A0E] text-white text-xs font-semibold rounded-lg transition-colors">
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
