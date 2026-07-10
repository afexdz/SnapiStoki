const steps = [
  {
    number: "01",
    title: "Trouvez votre service",
    description:
      "Parcourez des milliers de services et freelances algériens vérifiés. Filtrez par catégorie, budget et localisation.",
    icon: (
      <svg className="w-6 h-6 text-[#FA8112]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Commandez en toute confiance",
    description:
      "Passez commande en quelques clics. Paiement sécurisé en dinars, délais clairs et communication directe.",
    icon: (
      <svg className="w-6 h-6 text-[#FA8112]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Recevez et validez",
    description:
      "Recevez votre livrable dans les délais. Révisions incluses jusqu'à satisfaction totale. Garantie satisfait ou remboursé.",
    icon: (
      <svg className="w-6 h-6 text-[#FA8112]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-[88px] bg-[#FFF8F0] dark:bg-[#2a2a2a]">
      <div className="max-w-[1180px] mx-auto px-6">

        {/* Section head */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="inline-block text-[#FA8112] text-xs font-bold uppercase tracking-widest mb-3 font-jakarta">
              Comment ça marche
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] dark:text-[#FAF3E1]">
              Simple, rapide, fiable
            </h2>
            <p className="mt-2 text-[rgba(26,26,26,0.55)] dark:text-gray-400 text-sm max-w-md">
              De la recherche à la livraison, PixRaise simplifie chaque étape de votre collaboration.
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="relative bg-white dark:bg-[#1a1a1a] rounded-[14px] border border-[rgba(26,26,26,0.08)] dark:border-[#3a3a3a] p-8 hover:shadow-[0_6px_24px_rgba(250,129,18,0.10)] hover:-translate-y-1 transition-all duration-200"
            >
              {/* Number */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#FFEAD5] dark:bg-[#FA8112]/20 flex items-center justify-center shrink-0">
                  <span className="text-[#FA8112] text-sm font-extrabold font-jakarta">{step.number}</span>
                </div>
                <div className="flex-1 h-px bg-[rgba(26,26,26,0.08)] dark:bg-[#3a3a3a]" />
                {i < steps.length - 1 && (
                  <svg className="w-4 h-4 text-[rgba(26,26,26,0.20)] dark:text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>

              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-[#FFEAD5] dark:bg-[#FA8112]/20 flex items-center justify-center mb-5">
                {step.icon}
              </div>

              <h3 className="text-lg font-extrabold text-[#1A1A1A] dark:text-[#FAF3E1] mb-3 font-jakarta">
                {step.title}
              </h3>
              <p className="text-[rgba(26,26,26,0.55)] dark:text-gray-400 text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <a
            href="/register"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#FA8112] hover:bg-[#E06F05] text-white font-semibold rounded-[10px] shadow-[0_4px_14px_rgba(250,129,18,0.35)] hover:shadow-[0_6px_20px_rgba(250,129,18,0.45)] transition-all hover:-translate-y-px font-jakarta text-sm"
          >
            Commencer maintenant
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
