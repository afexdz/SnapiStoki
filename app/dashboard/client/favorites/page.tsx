"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

type FavoriteProfile = {
  id: string
  full_name: string | null
  avatar_url: string | null
  wilaya: string | null
  rating: number | null
  role: string | null
}

export default function ClientFavoritesPage() {
  const router = useRouter()
  const [favorites, setFavorites] = useState<FavoriteProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push("/login"); return }

      // favorites table may not exist yet — tolerate the error
      const { data: rows } = await sb
        .from("favorites")
        .select("profile:profiles(id, full_name, avatar_url, wilaya, rating, role)")
        .eq("user_id", data.user.id)

      if (rows) {
        const profiles = rows
          .map((r: { profile: FavoriteProfile | FavoriteProfile[] | null }) =>
            Array.isArray(r.profile) ? r.profile[0] : r.profile
          )
          .filter((p): p is FavoriteProfile => Boolean(p))
        setFavorites(profiles)
      }
      setLoading(false)
    })
  }, [router])

  const skeleton = Array.from({ length: 3 })

  return (
    <div className="min-h-screen bg-[#FFF8F0] dark:bg-[#1a1a1a]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/client" className="p-2 rounded-xl border border-[#F0E8E0] dark:border-[#3a3a3a] text-gray-500 hover:text-[#FA8112] hover:border-[#FA8112]/40 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-[#1A1A1A] dark:text-[#FAF3E1]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Mes favoris
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Freelances et créateurs que vous suivez</p>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading
            ? skeleton.map((_, i) => (
                <div key={i} className="bg-white dark:bg-[#2a2a2a] rounded-2xl border border-[#F0E8E0] dark:border-[#3a3a3a] p-5 animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-[#3a3a3a] shrink-0" />
                    <div className="space-y-2">
                      <div className="h-4 w-28 bg-gray-200 dark:bg-[#3a3a3a] rounded" />
                      <div className="h-3 w-16 bg-gray-100 dark:bg-[#333] rounded" />
                    </div>
                  </div>
                </div>
              ))
            : favorites.length === 0
              ? (
                <div className="col-span-full bg-white dark:bg-[#2a2a2a] rounded-2xl border border-[#F0E8E0] dark:border-[#3a3a3a] p-16 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#FFF8F0] dark:bg-[#3a3a3a] flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Aucun favori pour l'instant</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mb-5">Sauvegardez vos freelances préférés pour les retrouver facilement</p>
                  <Link
                    href="/freelances"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FA8112] hover:bg-[#E8730F] text-white text-sm font-semibold rounded-xl shadow-md shadow-[#FA8112]/20 transition-all"
                  >
                    Découvrir les freelances →
                  </Link>
                </div>
              )
              : favorites.map(profile => {
                  const initials = (profile.full_name || "?").trim().split(/\s+/).map(n => n[0]).join("").toUpperCase().slice(0, 2)
                  return (
                    <div key={profile.id} className="bg-white dark:bg-[#2a2a2a] rounded-2xl border border-[#F0E8E0] dark:border-[#3a3a3a] p-5 hover:border-[#FA8112]/30 hover:shadow-md transition-all">
                      <div className="flex items-center gap-3 mb-4">
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} alt="avatar" className="w-12 h-12 rounded-xl object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FA8112] to-[#E8730F] flex items-center justify-center text-white font-bold">
                            {initials}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#1A1A1A] dark:text-[#FAF3E1] truncate">{profile.full_name ?? "Utilisateur"}</p>
                          {profile.wilaya && (
                            <p className="text-xs text-gray-400">{profile.wilaya}, Algérie</p>
                          )}
                        </div>
                      </div>
                      {profile.rating != null && (
                        <div className="flex items-center gap-1 mb-3">
                          <span className="text-yellow-400 text-xs">★</span>
                          <span className="text-xs font-medium text-[#1A1A1A] dark:text-[#FAF3E1]">{(profile.rating as number).toFixed(1)}</span>
                        </div>
                      )}
                      <Link
                        href={`/freelances`}
                        className="block w-full text-center py-2 rounded-xl border border-[#FA8112]/30 text-[#FA8112] text-xs font-semibold hover:bg-[#FA8112]/5 transition-colors"
                      >
                        Voir le profil
                      </Link>
                    </div>
                  )
                })
          }
        </div>
      </div>
    </div>
  )
}
