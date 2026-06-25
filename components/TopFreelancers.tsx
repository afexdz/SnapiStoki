const freelancers = [
  { initials: "KB", name: "Karim Bensalem", role: "Full-Stack Developer", rating: 4.9, reviews: 142, price: "8 500", gradient: "from-violet-500 to-indigo-600", badge: "Top #1", online: true },
  { initials: "SM", name: "Sara Mekkaoui", role: "UI/UX Designer", rating: 5.0, reviews: 98, price: "12 000", gradient: "from-pink-500 to-rose-500", badge: "Recommandé", online: true },
  { initials: "AT", name: "Anis Touati", role: "Motion Designer", rating: 4.8, reviews: 76, price: "15 000", gradient: "from-amber-500 to-orange-500", badge: null, online: false },
  { initials: "LK", name: "Leila Khaldi", role: "Rédactrice SEO", rating: 4.7, reviews: 211, price: "5 000", gradient: "from-emerald-500 to-teal-500", badge: "Top #1", online: true },
  { initials: "YR", name: "Youcef Rahmani", role: "Développeur Mobile", rating: 4.9, reviews: 53, price: "20 000", gradient: "from-sky-500 to-blue-600", badge: null, online: false },
  { initials: "NB", name: "Nadia Boudiaf", role: "Illustratrice", rating: 5.0, reviews: 38, price: "9 500", gradient: "from-fuchsia-500 to-purple-600", badge: "Recommandé", online: true },
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

export default function TopFreelancers() {
  return (
    <section className="py-20 bg-white dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold tracking-widest uppercase mb-3">
              Talents
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
              Meilleurs freelances
            </h2>
          </div>
          <a href="/freelance" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 transition-colors group">
            Voir tout
            <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>

        <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
          {freelancers.map((f) => (
            <div key={f.name}
              className="group flex-shrink-0 w-56 bg-white dark:bg-zinc-800/80 rounded-2xl border border-zinc-100 dark:border-zinc-700/60 hover:border-violet-200 dark:hover:border-violet-700/60 hover:shadow-2xl hover:shadow-violet-100/50 dark:hover:shadow-violet-900/25 transition-all duration-300 card-hover overflow-hidden"
            >
              {/* Gradient banner with pattern */}
              <div className={`relative h-20 bg-gradient-to-br ${f.gradient}`}>
                <div className="absolute inset-0 opacity-20"
                  style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)", backgroundSize: "14px 14px" }}
                />
                {f.badge && (
                  <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold rounded-full border border-white/30 tracking-wide">
                    {f.badge}
                  </span>
                )}
              </div>

              <div className="px-4 pb-5">
                {/* Avatar */}
                <div className="relative -mt-7 mb-3">
                  <div className={`w-[52px] h-[52px] rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-white font-black text-base border-[3px] border-white dark:border-zinc-800 shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                    {f.initials}
                  </div>
                  {f.online && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white dark:border-zinc-800 shadow-sm" />
                  )}
                </div>

                <h3 className="font-bold text-zinc-900 dark:text-white text-sm leading-tight group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-200">
                  {f.name}
                </h3>
                <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-0.5 mb-3">{f.role}</p>

                <div className="flex items-center gap-1.5 mb-4">
                  <Stars rating={f.rating} />
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{f.rating}</span>
                  <span className="text-xs text-zinc-400">({f.reviews})</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-700/60">
                  <div>
                    <div className="text-[10px] text-zinc-400 tracking-wide uppercase font-medium">À partir de</div>
                    <div className="text-sm font-black text-zinc-900 dark:text-white">
                      {f.price} <span className="text-violet-600 dark:text-violet-400 font-bold">DA</span>
                    </div>
                  </div>
                  <button className="btn-shimmer px-3 py-1.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-[11px] font-bold rounded-lg transition-all duration-200 shadow-sm shadow-violet-500/20 hover:shadow-violet-500/35 hover:-translate-y-0.5 active:translate-y-0">
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
