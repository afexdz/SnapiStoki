"use client"

import { useEffect, useState, useCallback } from 'react'
import { useToast } from '../AdminShell'

type User = { id: string; full_name: string | null; email: string; role: string | null; wilaya: string | null; created_at: string; suspended: boolean; avatar_url: string | null }

const CARD = { background: '#1A1A1A', border: '1px solid #242424', borderRadius: 14, padding: 20 }

export default function UsersPage() {
  const { toast }      = useToast()
  const [users, setUsers]   = useState<User[]>([])
  const [total, setTotal]   = useState(0)
  const [page, setPage]     = useState(1)
  const [search, setSearch] = useState('')
  const [role, setRole]     = useState('')
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState<{ id: string; action: 'delete' | 'suspend' | 'unsuspend' } | null>(null)
  const [working, setWorking] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), search, role })
    fetch(`/api/pixo/users?${params}`)
      .then(r => r.json())
      .then(d => { setUsers(d.users ?? []); setTotal(d.total ?? 0) })
      .finally(() => setLoading(false))
  }, [page, search, role])

  useEffect(() => { load() }, [load])

  function onSearch(v: string) { setSearch(v); setPage(1) }
  function onRole(v: string)   { setRole(v);   setPage(1) }

  async function runAction() {
    if (!confirm) return
    setWorking(true)
    try {
      if (confirm.action === 'delete') {
        const r = await fetch(`/api/pixo/users/${confirm.id}`, { method: 'DELETE' })
        if (!r.ok) throw new Error((await r.json()).error)
        toast('Utilisateur supprimé')
      } else {
        const suspended = confirm.action === 'suspend'
        const r = await fetch(`/api/pixo/users/${confirm.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ suspended }) })
        if (!r.ok) throw new Error((await r.json()).error)
        toast(suspended ? 'Utilisateur suspendu' : 'Suspension levée')
      }
      setConfirm(null)
      load()
    } catch (e: unknown) {
      toast((e as Error).message, 'error')
    } finally {
      setWorking(false)
    }
  }

  const perPage = 20
  const totalPages = Math.ceil(total / perPage)

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 20 }}>Utilisateurs</h1>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          placeholder="Rechercher par nom..."
          value={search}
          onChange={e => onSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, background: '#1A1A1A', border: '1px solid #2a2a2a', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 13, outline: 'none' }}
        />
        <select value={role} onChange={e => onRole(e.target.value)} style={{ background: '#1A1A1A', border: '1px solid #2a2a2a', borderRadius: 10, padding: '10px 14px', color: '#888', fontSize: 13, outline: 'none', cursor: 'pointer' }}>
          <option value="">Tous les rôles</option>
          <option value="buyer">Acheteur</option>
          <option value="seller">Vendeur</option>
          <option value="both">Les deux</option>
        </select>
      </div>

      <div style={{ ...CARD, padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#555' }}>Chargement...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #242424', background: '#161616' }}>
                  {['Utilisateur', 'Email', 'Rôle', 'Wilaya', 'Inscription', 'Statut', 'Actions'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: '#555', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: '#444' }}>Aucun utilisateur trouvé</td></tr>
                )}
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #1c1c1c', transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#1e1e1e')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', background: '#FA811225', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {u.avatar_url ? <img src={u.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <span style={{ fontSize: 13, fontWeight: 700, color: '#FA8112' }}>{u.full_name?.[0]?.toUpperCase() ?? '?'}</span>}
                        </div>
                        <span style={{ color: '#ddd', whiteSpace: 'nowrap' }}>{u.full_name || '—'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#888', fontSize: 12 }}>{u.email || '—'}</td>
                    <td style={{ padding: '12px 16px', color: '#888' }}>{u.role || '—'}</td>
                    <td style={{ padding: '12px 16px', color: '#888' }}>{u.wilaya || '—'}</td>
                    <td style={{ padding: '12px 16px', color: '#666', fontSize: 11, whiteSpace: 'nowrap' }}>{new Date(u.created_at).toLocaleDateString('fr-DZ')}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {u.suspended
                        ? <span style={{ background: '#3a1010', color: '#ff8888', fontSize: 11, padding: '3px 8px', borderRadius: 6, fontWeight: 600 }}>Suspendu</span>
                        : <span style={{ background: '#1a3a1a', color: '#88cc88', fontSize: 11, padding: '3px 8px', borderRadius: 6, fontWeight: 600 }}>Actif</span>
                      }
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => setConfirm({ id: u.id, action: u.suspended ? 'unsuspend' : 'suspend' })}
                          style={{ fontSize: 11, padding: '5px 10px', borderRadius: 6, border: `1px solid ${u.suspended ? '#2a4a2a' : '#4a2a2a'}`, background: 'transparent', color: u.suspended ? '#88cc88' : '#ff8888', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          {u.suspended ? 'Activer' : 'Suspendre'}
                        </button>
                        <button onClick={() => setConfirm({ id: u.id, action: 'delete' })}
                          style={{ fontSize: 11, padding: '5px 10px', borderRadius: 6, border: '1px solid #3a1010', background: 'transparent', color: '#ff6b6b', cursor: 'pointer' }}>
                          Suppr.
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '8px 16px', borderRadius: 8, background: '#1A1A1A', border: '1px solid #2a2a2a', color: '#888', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}>←</button>
          <span style={{ padding: '8px 16px', color: '#888', fontSize: 13 }}>{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '8px 16px', borderRadius: 8, background: '#1A1A1A', border: '1px solid #2a2a2a', color: '#888', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}>→</button>
        </div>
      )}

      {/* Confirm modal */}
      {confirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div style={{ background: '#1A1A1A', border: '1px solid #2a2a2a', borderRadius: 16, padding: 28, maxWidth: 360, width: '90%' }}>
            <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Confirmer</h3>
            <p style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>
              {confirm.action === 'delete' && 'Supprimer définitivement cet utilisateur ?'}
              {confirm.action === 'suspend' && 'Suspendre cet utilisateur ?'}
              {confirm.action === 'unsuspend' && 'Lever la suspension ?'}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirm(null)} style={{ padding: '9px 18px', borderRadius: 8, background: 'transparent', border: '1px solid #333', color: '#888', cursor: 'pointer' }}>Annuler</button>
              <button onClick={runAction} disabled={working} style={{ padding: '9px 18px', borderRadius: 8, background: confirm.action === 'delete' ? '#7f1d1d' : '#FA8112', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: working ? 0.7 : 1 }}>
                {working ? '...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
