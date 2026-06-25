import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const displayName = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Utilisateur'
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  const accountType = user.user_metadata?.account_type ?? 'buyer'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Top bar */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-0.5">
          <span className="text-xl font-extrabold text-violet-600">Pix</span>
          <span className="text-xl font-extrabold text-gray-900 dark:text-white">Raise</span>
        </Link>
        <form action="/auth/signout" method="post">
          <Link
            href="/"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
          >
            ← Retour à l'accueil
          </Link>
        </form>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Welcome card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-8 mb-6 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-violet-200 dark:shadow-violet-900/40">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                Bonjour, {displayName} 👋
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {accountType === 'seller' ? 'Compte Vendeur / Freelance' : 'Compte Acheteur'} · {user.email}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Commandes actives', value: '0', color: 'text-violet-600 dark:text-violet-400' },
              { label: 'Messages', value: '0', color: 'text-indigo-600 dark:text-indigo-400' },
              { label: 'Favoris', value: '0', color: 'text-emerald-600 dark:text-emerald-400' },
            ].map((stat) => (
              <div key={stat.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
                <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/freelance" className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm hover:border-violet-200 dark:hover:border-violet-700 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">Explorer les freelances</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Trouvez le talent parfait pour votre projet</p>
          </Link>
          <Link href="/marketplace" className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm hover:border-violet-200 dark:hover:border-violet-700 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">Parcourir la marketplace</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Achetez des ressources numériques premium</p>
          </Link>
        </div>
      </main>
    </div>
  )
}
