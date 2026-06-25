const steps = [
  {
    number: "01",
    title: "Cherche",
    description: "Explorez des milliers de services et freelances. Filtrez par compétence, budget et délai pour trouver exactement ce qu'il vous faut.",
    gradient: "from-violet-600 to-purple-600",
    glow: "shadow-violet-500/30",
    iconBg: "bg-violet-100 dark:bg-violet-900/40",
    iconColor: "text-violet-600 dark:text-violet-400",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Commande",
    description: "Passez commande en quelques clics. Paiement sécurisé, délais clairs, messagerie intégrée — tout est là pour bien démarrer.",
    gradient: "from-indigo-600 to-blue-600",
    glow: "shadow-indigo-500/30",
    iconBg: "bg-indigo-100 dark:bg-indigo-900/40",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Reçois",
    description: "Votre livrable arrive dans les délais. Révisions incluses jusqu'à votre satisfaction totale. Garantie satisfait ou remboursé.",
    gradient: "from-emerald-500 to-teal-600",
    glow: "shadow-emerald-500/30",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-white dark:bg-zinc-950 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 dot-grid opacity-25 dark:opacity-40 pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-300/40 dark:via-violet-700/40 to-transparent" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-xs font-bold tracking-widest uppercase mb-5">
            Simple & Rapide
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-900 dark:text-white mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-md mx-auto">
            De la recherche à la livraison en 3 étapes. PixRaise rend chaque collaboration évidente.
          </p>
        </div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
          {/* Connector line */}
          <div className="hidden md:block absolute top-[3.5rem] left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-px">
            <div className="h-full bg-gradient-to-r from-violet-300 via-indigo-300 to-emerald-300 dark:from-violet-700 dark:via-indigo-700 dark:to-emerald-700" />
          </div>

          {steps.map((step, i) => (
            <div key={step.title}
              className="group relative bg-white dark:bg-zinc-800/60 rounded-3xl border border-zinc-100 dark:border-zinc-700/60 p-7 hover:border-violet-200 dark:hover:border-violet-700/60 hover:shadow-2xl hover:shadow-violet-100/50 dark:hover:shadow-violet-900/25 transition-all duration-300 card-hover"
            >
              {/* Step number circle */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg ${step.glow} group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                  <span className="text-xl font-black text-white">{i + 1}</span>
                </div>
                {/* Connector dot */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-[3.5rem] -right-5 z-20 w-4 h-4 rounded-full bg-white dark:bg-zinc-800 border-2 border-indigo-300 dark:border-indigo-700 shadow-sm" />
                )}
              </div>

              {/* Icon box */}
              <div className={`w-10 h-10 rounded-xl ${step.iconBg} ${step.iconColor} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200`}>
                {step.icon}
              </div>

              <h3 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white mb-3 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-200">
                {step.title}
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <a href="/freelance"
            className="btn-shimmer btn-glow inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 gradient-animate text-white font-bold text-base rounded-2xl shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-1 active:translate-y-0 transition-all duration-300"
          >
            Commencer maintenant
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500 font-medium">
            Gratuit pour commencer · Aucune carte requise
          </p>
        </div>
      </div>
    </section>
  );
}
