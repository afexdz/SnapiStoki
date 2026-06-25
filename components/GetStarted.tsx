export default function GetStarted() {
  return (
    <section className="py-16 bg-white dark:bg-[#1a1a1a]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] dark:text-[#FAF3E1]">
            Comment voulez-vous commencer ?
          </h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm sm:text-base">
            PixRaise s'adapte à vos besoins — trouvez ou vendez en quelques clics.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Card 1 – Cherche un freelance */}
          <a
            href="/freelance"
            className="group relative flex flex-col p-8 rounded-3xl border border-[#FA8112]/20 dark:border-[#FA8112]/30 border-l-4 border-l-[#FA8112] bg-[#FFF3E6] dark:bg-[#FA8112]/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#FA8112]/20 dark:hover:shadow-[#FA8112]/10 overflow-hidden"
          >
            {/* Background pattern */}
            <div className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-10"
              style={{
                backgroundImage: "radial-gradient(circle, rgba(250,129,18,0.15) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />

            <div className="relative">
              {/* Icon */}
              <div className="mb-6 w-16 h-16 rounded-2xl bg-[#FA8112]/10 dark:bg-[#FA8112]/20 flex items-center justify-center group-hover:bg-[#FA8112]/20 dark:group-hover:bg-[#FA8112]/30 transition-colors">
                <svg
                  className="w-9 h-9 text-[#FA8112] transition-transform duration-300 group-hover:scale-110"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>

              {/* Text */}
              <h3 className="text-xl font-extrabold text-[#1A1A1A] dark:text-[#FAF3E1] mb-2 group-hover:text-[#FA8112] transition-colors">
                Je cherche un freelance
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                Trouvez le talent parfait pour votre projet parmi des milliers de
                freelances algériens vérifiés et évalués.
              </p>

              {/* Button */}
              <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FA8112] group-hover:bg-[#E8730F] text-white text-sm font-semibold rounded-xl transition-colors shadow-md shadow-[#FA8112]/30 w-fit">
                Explorer les freelances
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </div>
          </a>

          {/* Card 2 – Vends mon art */}
          <a
            href="/marketplace"
            className="group relative flex flex-col p-8 rounded-3xl border border-[#F0E8E0] dark:border-[#3a3a3a] border-l-4 border-l-amber-500 bg-white dark:bg-[#2a2a2a] transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-100/80 dark:hover:shadow-amber-900/20 overflow-hidden"
          >
            {/* Background pattern */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(circle, rgba(245,158,11,0.08) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />

            <div className="relative">
              {/* Icon */}
              <div className="mb-6 w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30 transition-colors">
                <svg
                  className="w-9 h-9 text-amber-600 dark:text-amber-400 transition-transform duration-300 group-hover:scale-110"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                </svg>
              </div>

              {/* Text */}
              <h3 className="text-xl font-extrabold text-[#1A1A1A] dark:text-[#FAF3E1] mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                Je vends mon art / produit digital
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                Vendez vos créations à toute l'Algérie — templates, logos, icônes,
                formations et bien plus encore.
              </p>

              {/* Button */}
              <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-transparent border-2 border-[#1A1A1A] dark:border-[#FAF3E1] text-[#1A1A1A] dark:text-[#FAF3E1] group-hover:border-amber-500 group-hover:text-amber-600 dark:group-hover:border-amber-500 dark:group-hover:text-amber-400 text-sm font-semibold rounded-xl transition-all w-fit">
                Commencer à vendre
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
