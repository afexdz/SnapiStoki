import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ContactButton from "@/components/ContactButton"
import type { Metadata } from "next"

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const sb = await createClient()
  const { data } = await sb.from("profiles").select("full_name, bio").eq("id", id).single()
  const name = data?.full_name ?? "Freelance"
  return {
    title: `${name} — Profil vendeur | SnapiStoki`,
    description: data?.bio ?? `Découvrez les services et produits de ${name} sur SnapiStoki.`,
  }
}

const memberSince = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })

export default async function PublicProfilePage({ params }: Props) {
  const { id } = await params
  const sb = await createClient()

  const { data: { user } } = await sb.auth.getUser()
  if (user?.id === id) redirect("/profile")

  const { data: profile } = await sb
    .from("profiles")
    .select("id, full_name, bio, wilaya, avatar_url, cover_url, cover_position, rating, created_at, role")
    .eq("id", id)
    .single()

  if (!profile) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <p className="text-lg font-semibold text-[var(--ink)]">Profil introuvable</p>
          <Link href="/" className="text-[var(--orange)] underline text-sm">Retour à l'accueil</Link>
        </div>
        <Footer />
      </>
    )
  }

  const [{ data: services }, { data: products }] = await Promise.all([
    sb.from("services")
      .select("id, title, price, avg_rating, reviews_count, category, gallery, images")
      .eq("seller_id", id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(6),
    sb.from("digital_products")
      .select("id, title, price, is_free, format, file_format, preview_urls, preview_images, sales_count")
      .eq("seller_id", id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(6),
  ])

  const { data: ratingData } = await sb
    .from("reviews")
    .select("rating")
    .eq("reviewed_id", id)

  const allRatings = (ratingData ?? []).map((r: { rating: number }) => r.rating)
  const avgRating = allRatings.length > 0 ? allRatings.reduce((a: number, b: number) => a + b, 0) / allRatings.length : null

  const name = profile.full_name ?? "Freelance"
  const initials = name.trim().split(/\s+/).map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "?"

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[var(--background)] dark:bg-[var(--color-bg)]">
        {/* Cover */}
        <div
          className="relative w-full bg-gradient-to-r from-[var(--orange)] to-[var(--orange-dark)]"
          style={{
            height: "200px",
            ...(profile.cover_url ? { backgroundImage: `url(${profile.cover_url})`, backgroundSize: "cover", backgroundPosition: profile.cover_position ?? "center" } : {}),
          }}
        />

        <div className="max-w-5xl mx-auto px-4">
          {/* Profile header */}
          <div className="relative -mt-16 mb-6 flex flex-col sm:flex-row sm:items-end gap-5 pb-6 border-b border-[var(--border-subtle)] dark:border-[var(--border-subtle)]">
            <div className="w-28 h-28 rounded-2xl border-4 border-white dark:border-[var(--color-surface)] overflow-hidden bg-[var(--orange)] flex items-center justify-center shadow-lg shrink-0">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-3xl font-bold">{initials}</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-extrabold text-[var(--ink)] dark:text-[var(--ink)]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {name}
              </h1>
              {profile.wilaya && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {profile.wilaya}
                </p>
              )}
              {profile.bio && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed max-w-lg">{profile.bio}</p>
              )}
              <p className="text-xs text-gray-400 mt-2">Membre depuis {memberSince(profile.created_at)}</p>
            </div>

            <div className="shrink-0">
              <ContactButton sellerId={profile.id} currentUserId={user?.id ?? null} />
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-[var(--white)] dark:bg-[var(--white)] rounded-2xl border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] p-4 text-center">
              <p className="text-xl font-extrabold text-[var(--orange)]">{(services ?? []).length}</p>
              <p className="text-xs text-gray-500 mt-0.5">services actifs</p>
            </div>
            <div className="bg-[var(--white)] dark:bg-[var(--white)] rounded-2xl border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] p-4 text-center">
              <p className="text-xl font-extrabold text-[var(--orange)]">{(products ?? []).length}</p>
              <p className="text-xs text-gray-500 mt-0.5">produits actifs</p>
            </div>
            <div className="bg-[var(--white)] dark:bg-[var(--white)] rounded-2xl border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] p-4 text-center">
              <p className="text-xl font-extrabold text-[var(--orange)]">{avgRating != null ? avgRating.toFixed(1) : "—"}</p>
              <p className="text-xs text-gray-500 mt-0.5">note moyenne</p>
            </div>
          </div>

          {/* Services */}
          {(services ?? []).length > 0 && (
            <section className="mb-10">
              <h2 className="text-lg font-bold text-[var(--ink)] dark:text-[var(--ink)] mb-4">Services</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(services ?? []).map((s: { id: string; title: string; price: number; avg_rating: number | null; reviews_count: number | null; category: string | null; gallery: string[] | null; images: string[] | null }) => {
                  const thumb = s.gallery?.[0] ?? s.images?.[0]
                  return (
                    <Link key={s.id} href={`/services/${s.id}`} className="group bg-[var(--white)] dark:bg-[var(--white)] rounded-2xl border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] hover:border-[var(--orange)]/30 hover:shadow-xl hover:shadow-[var(--orange)]/10 transition-all overflow-hidden">
                      <div className="h-36 bg-gradient-to-br from-[var(--orange)] to-[var(--orange-dark)] overflow-hidden">
                        {thumb && <img src={thumb} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />}
                      </div>
                      <div className="p-4">
                        {s.category && <p className="text-xs text-[var(--orange)] font-semibold mb-1">{s.category}</p>}
                        <h3 className="text-sm font-semibold text-[var(--ink)] dark:text-[var(--ink)] line-clamp-2 group-hover:text-[var(--orange)] transition-colors mb-2">{s.title}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-[var(--ink)] dark:text-[var(--ink)]">{s.price.toLocaleString("fr-FR")} <span className="text-[var(--orange)]">DA</span></span>
                          {s.avg_rating != null && (
                            <span className="text-xs text-gray-400">★ {s.avg_rating.toFixed(1)} ({s.reviews_count ?? 0})</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          {/* Products */}
          {(products ?? []).length > 0 && (
            <section className="mb-10">
              <h2 className="text-lg font-bold text-[var(--ink)] dark:text-[var(--ink)] mb-4">Produits numériques</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(products ?? []).map((p: { id: string; title: string; price: number; is_free: boolean | null; format: string | null; file_format: string | null; preview_urls: string[] | null; preview_images: string[] | null; sales_count: number | null }) => {
                  const thumb = p.preview_urls?.[0] ?? p.preview_images?.[0]
                  const fmt = p.format ?? p.file_format
                  return (
                    <Link key={p.id} href={`/products/${p.id}`} className="group bg-[var(--white)] dark:bg-[var(--white)] rounded-2xl border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] hover:border-[var(--orange)]/30 hover:shadow-xl hover:shadow-[var(--orange)]/10 transition-all overflow-hidden">
                      <div className="h-36 bg-gradient-to-br from-slate-700 to-slate-900 relative overflow-hidden">
                        {thumb && <img src={thumb} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />}
                        {fmt && <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 text-white text-xs rounded-lg">{fmt}</span>}
                        {p.is_free && <span className="absolute top-2 right-2 px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-lg">Gratuit</span>}
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-semibold text-[var(--ink)] dark:text-[var(--ink)] line-clamp-2 group-hover:text-[var(--orange)] transition-colors mb-2">{p.title}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-[var(--ink)] dark:text-[var(--ink)]">{p.is_free ? "Gratuit" : `${p.price.toLocaleString("fr-FR")} DA`}</span>
                          <span className="text-xs text-gray-400">{p.sales_count ?? 0} vente{(p.sales_count ?? 0) !== 1 ? "s" : ""}</span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          {(services ?? []).length === 0 && (products ?? []).length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-sm">Ce vendeur n'a pas encore publié de services ou produits.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
