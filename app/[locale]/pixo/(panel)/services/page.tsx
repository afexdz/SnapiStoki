"use client"

import { useEffect, useState, useCallback } from 'react'
import { useToast } from '../AdminShell'

type Service = { id: string; title: string; category: string | null; price: number; is_active: boolean; approved: boolean | null; created_at: string; images: string[] | null; rating: number | null; total_orders: number | null; profiles: { full_name: string; avatar_url: string | null } | null }

const CARD = { background: '#1A1A1A', border: '1px solid #242424', borderRadius: 14 }

export default function ServicesPage() {
  const { toast }          = useToast()
  const [services, setServices] = useState<Service[]>([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [search, setSearch]     = useState('')
  const [loading, setLoading]   = useState(true)
  const [working, setWorking]   = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), search })
    fetch(`/api/pixo/services?${params}`)
      .then(r => r.json())
      .then(d => { setServices(d.services ?? []); setTotal(d.total ?? 0) })
      .finally(() => setLoading(false))
  }, [page, search])

  useEffect(() => { load() }, [load])

  async function patch(id: string, body: Record<string, unknown>) {
    setWorking(id)
    try {
      const r = await fetch(`/api/pixo/services/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!r.ok) throw new Error((await r.json()).error)
      toast('Service mis à jour')
      load()
    } catch (e: unknown) { toast((e as Error).message, 'error') }
    finally { setWorking(null) }
  }

  async function remove(id: string) {
    if (!confirm('Supprimer ce service ?')) return
    setWorking(id)
    try {
      const r = await fetch(`/api/pixo/services/${id}`, { method: 'DELETE' })
      if (!r.ok) throw new Error((await r.json()).error)
      toast('Service supprimé')
      load()
    } catch (e: unknown) { toast((e as Error).message, 'error') }
    finally { setWorking(null) }
  }

  const perPage = 20
  const totalPages = Math.ceil(total / perPage)

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 20 }}>Services</h1>

      <div style={{ marginBottom: 20 }}>
        <input placeholder="Rechercher un service..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          style={{ background: '#1A1A1A', border: '1px solid #2a2a2a', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 13, outline: 'none', width: '100%', maxWidth: 400 }} />
      </div>

      <div style={{ ...CARD, overflow: 'hidden', padding: 0 }}>
        {loading ? <div style={{ padding: 40, textAlign: 'center', color: '#555' }}>Chargement...</div> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #242424', background: '#161616' }}>
                  {['Service', 'Vendeur', 'Catégorie', 'Prix', 'Note', 'Commandes', 'Statut', 'Actions'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: '#555', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {services.length === 0 && <tr><td colSpan={8} style={{ padding: 32, textAlign: 'center', color: '#444' }}>Aucun service</td></tr>}
                {services.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #1c1c1c' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#1e1e1e')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {s.images?.[0] && <img src={s.images[0]} style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} alt="" />}
                        <span style={{ color: '#ddd', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{s.title}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#888' }}>{s.profiles?.full_name || '—'}</td>
                    <td style={{ padding: '12px 16px', color: '#888' }}>{s.category || '—'}</td>
                    <td style={{ padding: '12px 16px', color: '#FA8112', fontWeight: 700 }}>{(s.price / 100).toFixed(0)} DA</td>
                    <td style={{ padding: '12px 16px', color: '#888' }}>{s.rating?.toFixed(1) ?? '—'}</td>
                    <td style={{ padding: '12px 16px', color: '#888' }}>{s.total_orders ?? 0}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {s.is_active ? <span style={{ background: '#1a3a1a', color: '#88cc88', fontSize: 10, padding: '2px 7px', borderRadius: 5 }}>Actif</span> : <span style={{ background: '#2a2a2a', color: '#666', fontSize: 10, padding: '2px 7px', borderRadius: 5 }}>Inactif</span>}
                        {s.approved === false ? <span style={{ background: '#3a1010', color: '#ff8888', fontSize: 10, padding: '2px 7px', borderRadius: 5 }}>Rejeté</span> : <span style={{ background: '#1a2a3a', color: '#88aaff', fontSize: 10, padding: '2px 7px', borderRadius: 5 }}>Approuvé</span>}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button onClick={() => patch(s.id, { approved: s.approved === false ? true : false })} disabled={working === s.id}
                          style={{ fontSize: 11, padding: '4px 8px', borderRadius: 5, border: '1px solid #2a4a2a', background: 'transparent', color: s.approved === false ? '#88cc88' : '#ff8888', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          {s.approved === false ? 'Approuver' : 'Rejeter'}
                        </button>
                        <button onClick={() => remove(s.id)} disabled={working === s.id}
                          style={{ fontSize: 11, padding: '4px 8px', borderRadius: 5, border: '1px solid #3a1010', background: 'transparent', color: '#ff6b6b', cursor: 'pointer' }}>
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

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '8px 16px', borderRadius: 8, background: '#1A1A1A', border: '1px solid #2a2a2a', color: '#888', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}>←</button>
          <span style={{ padding: '8px 16px', color: '#888', fontSize: 13 }}>{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '8px 16px', borderRadius: 8, background: '#1A1A1A', border: '1px solid #2a2a2a', color: '#888', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}>→</button>
        </div>
      )}
    </div>
  )
}
