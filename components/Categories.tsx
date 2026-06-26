"use client"

import { useState } from "react"

type Metier = {
  label: string
  count: string
  paths: string[]
}

type TabGroup = {
  id: string
  label: string
  emoji: string
  metiers: Metier[]
}

const tabGroups: TabGroup[] = [
  {
    id: "creatif",
    label: "Créatif",
    emoji: "🎨",
    metiers: [
      {
        label: "Designer graphique",
        count: "1 240 services",
        paths: ["M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"],
      },
      {
        label: "Photographe",
        count: "340 services",
        paths: [
          "M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z",
          "M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z",
        ],
      },
      {
        label: "Motion designer",
        count: "650 services",
        paths: ["M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"],
      },
      {
        label: "UI/UX designer",
        count: "720 services",
        paths: ["M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"],
      },
    ],
  },
  {
    id: "tech",
    label: "Tech",
    emoji: "💻",
    metiers: [
      {
        label: "Développeur web ou mobile",
        count: "980 services",
        paths: ["M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"],
      },
      {
        label: "Data analyst ou consultant tech",
        count: "410 services",
        paths: ["M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"],
      },
      {
        label: "Expert SEO",
        count: "560 services",
        paths: ["M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"],
      },
    ],
  },
  {
    id: "contenu",
    label: "Contenu",
    emoji: "✍️",
    metiers: [
      {
        label: "Rédacteur web ou copywriter",
        count: "830 services",
        paths: ["M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"],
      },
      {
        label: "Traducteur",
        count: "290 services",
        paths: ["M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802"],
      },
      {
        label: "Community manager",
        count: "460 services",
        paths: ["M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"],
      },
    ],
  },
  {
    id: "marketing",
    label: "Marketing",
    emoji: "📣",
    metiers: [
      {
        label: "Consultant marketing",
        count: "380 services",
        paths: ["M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46"],
      },
      {
        label: "Monteur vidéo",
        count: "520 services",
        paths: ["M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75.125v-6.25A1.125 1.125 0 013.375 11.25m0 8.125c-.621 0-1.125-.504-1.125-1.125v-6.25m0 7.375h17.25m0-7.375A1.125 1.125 0 0119.5 11.25m1.125 0v6.25C20.625 18.496 20.121 19 19.5 19m1.125-7.75H3.375m16.5 0V8.25A1.125 1.125 0 0019.5 7.125H4.5A1.125 1.125 0 003.375 8.25v3m0 0h17.25"],
      },
    ],
  },
]

export default function Categories() {
  const [activeTab, setActiveTab] = useState("creatif")

  const current = tabGroups.find((g) => g.id === activeTab)!

  return (
    <section className="py-16 bg-[#FFF8F0] dark:bg-[#2a2a2a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] dark:text-[#FAF3E1]">
              Explorez par métier
            </h2>
            <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
              12 métiers, des milliers de talents algériens
            </p>
          </div>
          <a
            href="/freelances"
            className="hidden sm:inline-flex text-sm font-medium text-[#FA8112] hover:text-[#E8730F] transition-colors"
          >
            Voir tout →
          </a>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
          {tabGroups.map((group) => (
            <button
              key={group.id}
              onClick={() => setActiveTab(group.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 shrink-0 ${
                activeTab === group.id
                  ? "bg-[#FA8112] text-white shadow-md shadow-[#FA8112]/30"
                  : "bg-white dark:bg-[#1a1a1a] text-gray-600 dark:text-gray-400 border border-[#F0E8E0] dark:border-[#3a3a3a] hover:border-[#FA8112]/40 hover:text-[#FA8112]"
              }`}
            >
              <span>{group.emoji}</span>
              {group.label}
            </button>
          ))}
        </div>

        {/* Métiers grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {current.metiers.map((m) => (
            <a
              key={m.label}
              href="/freelances"
              className="group flex flex-col items-center gap-3 p-5 bg-white dark:bg-[#1a1a1a] rounded-2xl border border-[#F0E8E0] dark:border-[#3a3a3a] hover:border-[#FA8112]/40 dark:hover:border-[#FA8112]/40 hover:shadow-lg hover:shadow-[#FA8112]/10 transition-all duration-200 text-center"
            >
              <div className="w-14 h-14 flex items-center justify-center bg-[#FFF8F0] dark:bg-[#2a2a2a] rounded-xl group-hover:bg-[#FA8112]/10 transition-colors">
                <svg
                  className="w-7 h-7 text-[#1A1A1A] dark:text-[#FAF3E1] group-hover:text-[#FA8112] transition-colors"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  {m.paths.map((d, i) => (
                    <path key={i} strokeLinecap="round" strokeLinejoin="round" d={d} />
                  ))}
                </svg>
              </div>
              <div>
                <div className="font-semibold text-[#1A1A1A] dark:text-[#FAF3E1] text-sm leading-tight group-hover:text-[#FA8112] transition-colors">
                  {m.label}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{m.count}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
