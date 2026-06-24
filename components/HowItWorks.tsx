const steps = [
  {
    number: "01",
    title: "Cherche",
    description:
      "Explorez des milliers de services et freelances. Filtrez par catégorie, budget et note pour trouver la perle rare.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    color: "bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400",
    accent: "border-violet-200 dark:border-violet-800",
  },
  {
    number: "02",
    title: "Commande",
    description:
      "Passez commande en quelques clics. Paiement sécurisé, délais clairs, et communication directe avec votre freelance.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    color: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400",
    accent: "border-indigo-200 dark:border-indigo-800",
  },
  {
    number: "03",
    title: "Reçois",
    description:
      "Recevez votre livrable dans les délais. Révisions incluses jusqu'à satisfaction totale. Garantie satisfait ou remboursé.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    color: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400",
    accent: "border-emerald-200 dark:border-emerald-800",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-sm font-semibold rounded-full mb-4">
            Simple & Rapide
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Comment ça marche ?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
            De la recherche à la livraison, SnapiStoki simplifie chaque étape
            de votre collaboration avec les meilleurs talents.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line – desktop */}
          <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-violet-200 via-indigo-200 to-emerald-200 dark:from-violet-800 dark:via-indigo-800 dark:to-emerald-800 -translate-y-1/2 z-0" />

          {steps.map((step, i) => (
            <div
              key={step.title}
              className={`relative group bg-white dark:bg-gray-800/60 rounded-2xl border ${step.accent} p-8 hover:shadow-xl hover:shadow-violet-100/50 dark:hover:shadow-violet-900/20 transition-all duration-200 z-10`}
            >
              {/* Step number */}
              <div className="absolute -top-4 left-8">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-white dark:bg-gray-950 border-2 border-current rounded-full text-xs font-bold text-gray-400 dark:text-gray-500 shadow-sm">
                  {step.number}
                </span>
              </div>

              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-200`}>
                {step.icon}
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {step.title}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                {step.description}
              </p>

              {/* Arrow – except last */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute -right-4 top-10 text-gray-300 dark:text-gray-700 z-20">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 text-center">
          <a
            href="#"
            className="inline-flex items-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl shadow-lg shadow-violet-200 dark:shadow-violet-900/40 transition-all hover:-translate-y-0.5 active:translate-y-0"
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
