const categories = [
  { emoji: "🎨", label: "Design", count: "1,240 services" },
  { emoji: "💻", label: "Développement", count: "980 services" },
  { emoji: "🎬", label: "Vidéo", count: "650 services" },
  { emoji: "✍️", label: "Rédaction", count: "830 services" },
  { emoji: "🎙️", label: "Audio", count: "410 services" },
  { emoji: "📦", label: "Templates", count: "1,100 services" },
  { emoji: "🖼️", label: "Art digital", count: "720 services" },
  { emoji: "📱", label: "Marketing", count: "560 services" },
  { emoji: "📷", label: "Photo", count: "340 services" },
];

export default function Categories() {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Explorez les catégories
            </h2>
            <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
              Trouvez le service parfait pour votre projet
            </p>
          </div>
          <a
            href="#"
            className="hidden sm:inline-flex text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
          >
            Voir tout →
          </a>
        </div>

        {/* Horizontal scroll */}
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
          {categories.map((cat) => (
            <a
              key={cat.label}
              href="#"
              className="group flex-shrink-0 flex flex-col items-center gap-3 p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-600 hover:shadow-lg hover:shadow-violet-100 dark:hover:shadow-violet-900/30 transition-all duration-200 w-36"
            >
              <div className="w-14 h-14 flex items-center justify-center bg-violet-50 dark:bg-violet-900/30 rounded-xl group-hover:bg-violet-100 dark:group-hover:bg-violet-900/50 transition-colors text-3xl">
                {cat.emoji}
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                  {cat.label}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {cat.count}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
