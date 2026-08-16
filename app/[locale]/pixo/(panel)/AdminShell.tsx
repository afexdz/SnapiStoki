"use client"

import { useState, useCallback, createContext, useContext, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

// ─── Toast context ────────────────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'info'
type Toast = { id: number; msg: string; type: ToastType }
type ToastCtx = { toast: (msg: string, type?: ToastType) => void }

const ToastContext = createContext<ToastCtx>({ toast: () => {} })
export function useToast() { return useContext(ToastContext) }

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV = [
  { href: '/pixo/dashboard', label: 'Tableau de bord', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { href: '/pixo/users',     label: 'Utilisateurs',    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { href: '/pixo/services',  label: 'Services',        icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { href: '/pixo/products',  label: 'Produits',        icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { href: '/pixo/orders',    label: 'Commandes',       icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { href: '/pixo/reviews',   label: 'Avis',            icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
  { href: '/pixo/reports',   label: 'Signalements',   icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
  { href: '/pixo/settings',  label: 'Paramètres',     icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
]

// ─── Shell ────────────────────────────────────────────────────────────────────
export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()
  const [open, setOpen]     = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  let toastId = 0

  const toast = useCallback((msg: string, type: ToastType = 'success') => {
    const id = ++toastId
    setToasts(p => [...p, { id, msg, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500)
  }, [])

  async function logout() {
    await fetch('/api/pixo/logout', { method: 'POST' })
    router.push('/pixo')
  }

  useEffect(() => { setOpen(false) }, [pathname])

  const sidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #2a2a2a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#FA8112' }}>Pix</span>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>Raise</span>
          <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, color: '#FA8112', background: '#FA811220', border: '1px solid #FA811240', borderRadius: 4, padding: '1px 6px', letterSpacing: '0.05em' }}>ADMIN</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {NAV.map(n => {
          const active = pathname === n.href || (n.href !== '/pixo/dashboard' && pathname.startsWith(n.href))
          return (
            <Link key={n.href} href={n.href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, marginBottom: 2, color: active ? '#FA8112' : '#888', background: active ? '#FA811215' : 'transparent', fontWeight: active ? 600 : 400, fontSize: 14, textDecoration: 'none', transition: 'all 0.15s' }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={n.icon} />
              </svg>
              {n.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid #2a2a2a' }}>
        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', borderRadius: 10, background: 'transparent', border: 'none', color: '#666', fontSize: 14, cursor: 'pointer', textAlign: 'left', transition: 'color 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#ff6b6b')}
          onMouseLeave={e => (e.currentTarget.style.color = '#666')}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Déconnexion
        </button>
      </div>
    </div>
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#111111', color: '#e0e0e0' }}>

        {/* Desktop sidebar */}
        <aside style={{ width: 220, background: '#1A1A1A', borderRight: '1px solid #242424', flexShrink: 0, position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 40, display: 'flex', flexDirection: 'column' }}>
          {sidebarContent}
        </aside>

        {/* Mobile overlay */}
        {open && (
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 49 }} />
        )}

        {/* Mobile sidebar */}
        <aside style={{ width: 220, background: '#1A1A1A', borderRight: '1px solid #242424', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 50, display: 'flex', flexDirection: 'column', transform: open ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.25s ease', visibility: 'visible' }}
          className="md-hide">
          {sidebarContent}
        </aside>

        {/* Main */}
        <main style={{ flex: 1, marginLeft: 220, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {/* Topbar */}
          <header style={{ height: 56, background: '#1A1A1A', borderBottom: '1px solid #242424', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12, position: 'sticky', top: 0, zIndex: 30 }}>
            <button onClick={() => setOpen(o => !o)} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', display: 'none', padding: 4 }} className="mobile-menu-btn">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div style={{ flex: 1 }} />
            <div style={{ fontSize: 12, color: '#555', fontFamily: 'monospace' }}>
              {process.env.NODE_ENV === 'development' ? 'DEV' : ''}
            </div>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#FA811225', border: '1px solid #FA811240', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" fill="none" stroke="#FA8112" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </header>

          {/* Content */}
          <div style={{ flex: 1, padding: 24 }}>
            {children}
          </div>
        </main>

        {/* Toasts */}
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {toasts.map(t => (
            <div key={t.id} style={{ background: t.type === 'error' ? '#3a1010' : t.type === 'info' ? '#1a1a3a' : '#1a3a1a', border: `1px solid ${t.type === 'error' ? '#5a2020' : t.type === 'info' ? '#2a2a5a' : '#2a5a2a'}`, color: t.type === 'error' ? '#ff8888' : t.type === 'info' ? '#88aaff' : '#88cc88', borderRadius: 10, padding: '10px 16px', fontSize: 13, maxWidth: 320, boxShadow: '0 4px 20px rgba(0,0,0,0.4)', animation: 'fadeIn 0.2s ease' }}>
              {t.msg}
            </div>
          ))}
        </div>

        <style>{`
          @media (max-width: 768px) {
            main { margin-left: 0 !important; }
            aside:first-of-type { display: none !important; }
            .mobile-menu-btn { display: flex !important; }
          }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    </ToastContext.Provider>
  )
}
