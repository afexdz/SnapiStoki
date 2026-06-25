const freelancers = [
  {
    initials: "KB",
    name: "Karim Bensalem",
    role: "Développeur Web Full-Stack",
    rating: 4.9,
    reviews: 142,
    price: "8 500",
    color: "from-[#FA8112] to-[#E8730F]",
    badge: "Top Vendeur",
  },
  {
    initials: "SM",
    name: "Sara Mekkaoui",
    role: "Designer UI/UX",
    rating: 5.0,
    reviews: 98,
    price: "12 000",
    color: "from-pink-500 to-rose-500",
    badge: "Recommandé",
  },
  {
    initials: "AT",
    name: "Anis Touati",
    role: "Motion Designer",
    rating: 4.8,
    reviews: 76,
    price: "15 000",
    color: "from-amber-500 to-orange-500",
    badge: null,
  },
  {
    initials: "LK",
    name: "Leila Khaldi",
    role: "Rédactrice Web & SEO",
    rating: 4.7,
    reviews: 211,
    price: "5 000",
    color: "from-emerald-500 to-teal-500",
    badge: "Top Vendeur",
  },
  {
    initials: "YR",
    name: "Youcef Rahmani",
    role: "Développeur Mobile",
    rating: 4.9,
    reviews: 53,
    price: "20 000",
    color: "from-sky-500 to-blue-600",
    badge: null,
  },
  {
    initials: "NB",
    name: "Nadia Boudiaf",
    role: "Illustratrice & Art digital",
    rating: 5.0,
    reviews: 38,
    price: "9 500",
    color: "from-fuchsia-500 to-purple-600",
    badge: "Recommandé",
  },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`w-3.5 h-3.5 ${
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

export default function TopFreelancers() {
  return (
    <section className="py-16 bg-white dark:bg-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] dark:text-[#FAF3E1]">
              Meilleurs freelances
            </h2>
            <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
              Les talents les mieux notés de la plateforme
            </p>
          </div>
          <a
            href="#"
            className="hidden sm:inline-flex text-sm font-medium text-[#FA8112] hover:text-[#E8730F] transition-colors"
          >
            Voir tout →
          </a>
        </div>

        <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
          {freelancers.map((f) => (
            <div
              key={f.name}
              className="group flex-shrink-0 w-60 bg-white dark:bg-[#2a2a2a] rounded-2xl border border-[#F0E8E0] dark:border-[#3a3a3a] hover:border-[#FA8112]/30 dark:hover:border-[#FA8112]/30 hover:shadow-xl hover:shadow-[#FA8112]/10 transition-all duration-200 overflow-hidden"
            >
              {/* Gradient banner */}
              <div className={`h-20 bg-gradient-to-br ${f.color} relative`}>
                {f.badge && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full border border-white/30">
                    {f.badge}
                  </span>
                )}
              </div>

              <div className="px-5 pb-5">
                {/* Avatar */}
                <div
                  className={`-mt-8 w-14 h-14 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-[#FAF3E1] dark:border-[#2a2a2a]`}
                >
                  {f.initials}
                </div>

                <div className="mt-3">
                  <h3 className="font-semibold text-[#1A1A1A] dark:text-[#FAF3E1] text-sm leading-tight group-hover:text-[#FA8112] transition-colors">
                    {f.name}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                    {f.role}
                  </p>
                </div>

                <div className="mt-3 flex items-center gap-1.5">
                  <Stars rating={f.rating} />
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {f.rating}
                  </span>
                  <span className="text-xs text-gray-400">({f.reviews})</span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-400">À partir de</span>
                    <div className="text-sm font-bold text-[#1A1A1A] dark:text-[#FAF3E1]">
                      {f.price} <span className="text-[#FA8112]">DA</span>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 bg-[#FA8112]/10 text-[#FA8112] text-xs font-semibold rounded-lg hover:bg-[#FA8112]/20 transition-colors">
                    Voir profil
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
