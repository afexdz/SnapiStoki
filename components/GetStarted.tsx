export default function GetStarted() {
  return (
    <section className="py-20 bg-white dark:bg-zinc-950 relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 dot-grid opacity-30 dark:opacity-50" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section label */}
        <div className="flex flex-col items-center text-center mb-12">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-xs font-bold tracking-widest uppercase mb-4">
            Commencer
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
            Comment voulez-vous
            <br />
            <span className="gradient-text">commencer ?</span>
          </h2>
          <p className="mt-3 text-zinc-500 dark:text-zinc-400 text-base max-w-md">
            PixRaise s'adapte à votre profil — client ou créatif, on a tout prévu.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Card 1 – Cherche un freelance */}
          <a href="/freelance" className="group relative flex flex-col p-8 rounded-3xl overflow-hidden card-hover cursor-pointer border-l-4 border-l-violet-600 border border-violet-100 dark:border-violet-900/40 bg-gradient-to-br from-violet-50 to-indigo-50/50 dark:from-violet-950/40 dark:to-indigo-950/30">
            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-40 dark:opacity-20"
              style={{ backgroundImage: "radial-gradient(circle, rgba(124,58,237,0.12) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />

            {/* Decorative gradient circle */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-violet-400/20 to-purple-400/10 rounded-full blur-2xl group-hover:from-violet-400/30 transition-all duration-500" />

            <div className="relative">
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-violet-500/30 group-hover:scale-110 group-hover:shadow-violet-500/50 transition-all duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>

              <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 text-xs font-bold tracking-wide mb-3">
                Pour les clients
              </div>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors duration-200">
                Je cherche un freelance
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mb-7">
                Parcourez des milliers de profils vérifiés. Filtrez par compétence, budget et délai. Votre projet entre de bonnes mains.
              </p>

              <span className="btn-shimmer inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-bold rounded-xl shadow-md shadow-violet-500/25 group-hover:shadow-violet-500/40 group-hover:-translate-y-0.5 transition-all duration-200">
                Explorer les freelances
                <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </div>
          </a>

          {/* Card 2 – Vends mon art */}
          <a href="/marketplace" className="group relative flex flex-col p-8 rounded-3xl overflow-hidden card-hover cursor-pointer border-l-4 border-l-amber-500 border border-amber-100 dark:border-amber-900/30 bg-white dark:bg-zinc-900/60">
            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-50 dark:opacity-30"
              style={{ backgroundImage: "radial-gradient(circle, rgba(245,158,11,0.1) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />

            {/* Decorative gradient circle */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-amber-400/15 to-orange-400/10 rounded-full blur-2xl group-hover:from-amber-400/25 transition-all duration-500" />

            <div className="relative">
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-6 shadow-lg shadow-amber-500/30 group-hover:scale-110 group-hover:shadow-amber-500/50 transition-all duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                </svg>
              </div>

              <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-bold tracking-wide mb-3">
                Pour les créatifs
              </div>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-200">
                Je vends mes créations
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mb-7">
                Publiez vos templates, logos, icons et produits numériques. Vendez à toute l'Algérie. Recevez vos paiements simplement.
              </p>

              <span className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-zinc-900 dark:border-zinc-300 text-zinc-900 dark:text-zinc-200 text-sm font-bold rounded-xl group-hover:border-amber-500 group-hover:text-amber-600 dark:group-hover:border-amber-400 dark:group-hover:text-amber-400 group-hover:-translate-y-0.5 transition-all duration-200">
                Commencer à vendre
                <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </div>
          </a>

        </div>
      </div>
    </section>
  );
}
