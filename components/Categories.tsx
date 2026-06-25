type Category = {
  label: string;
  count: string;
  paths: string[];
};

const categories: Category[] = [
  {
    label: "Design",
    count: "1,240 services",
    paths: [
      "M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42",
    ],
  },
  {
    label: "Développement",
    count: "980 services",
    paths: [
      "M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5",
    ],
  },
  {
    label: "Vidéo",
    count: "650 services",
    paths: [
      "M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z",
    ],
  },
  {
    label: "Rédaction",
    count: "830 services",
    paths: [
      "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10",
    ],
  },
  {
    label: "Audio",
    count: "410 services",
    paths: [
      "M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75M10.5 21h3M12 3a3 3 0 00-3 3v6a3 3 0 006 0V6a3 3 0 00-3-3z",
    ],
  },
  {
    label: "Templates",
    count: "1,100 services",
    paths: [
      "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z",
    ],
  },
  {
    label: "Art digital",
    count: "720 services",
    paths: [
      "M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z",
    ],
  },
  {
    label: "Marketing",
    count: "560 services",
    paths: [
      "M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46",
    ],
  },
  {
    label: "Photo",
    count: "340 services",
    paths: [
      "M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z",
      "M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z",
    ],
  },
];

export default function Categories() {
  return (
    <section className="py-16 bg-[#FFF8F0] dark:bg-[#2a2a2a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] dark:text-[#FAF3E1]">
              Explorez les catégories
            </h2>
            <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
              Trouvez le service parfait pour votre projet
            </p>
          </div>
          <a
            href="#"
            className="hidden sm:inline-flex text-sm font-medium text-[#FA8112] hover:text-[#E8730F] transition-colors"
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
              className="group flex-shrink-0 flex flex-col items-center gap-3 p-5 bg-white dark:bg-[#1a1a1a] rounded-2xl border border-[#F0E8E0] dark:border-[#3a3a3a] hover:border-[#FA8112]/40 dark:hover:border-[#FA8112]/40 hover:shadow-lg hover:shadow-[#FA8112]/10 transition-all duration-200 w-36"
            >
              <div className="w-16 h-16 flex items-center justify-center bg-[#FFF8F0] dark:bg-[#2a2a2a] rounded-xl group-hover:bg-[#FA8112]/10 transition-colors">
                <svg
                  className="w-8 h-8 text-[#1A1A1A] dark:text-[#FAF3E1] group-hover:text-[#FA8112] transition-colors"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  {cat.paths.map((d, i) => (
                    <path
                      key={i}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={d}
                    />
                  ))}
                </svg>
              </div>

              <div className="text-center">
                <div className="font-semibold text-[#1A1A1A] dark:text-[#FAF3E1] text-sm group-hover:text-[#FA8112] transition-colors">
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
