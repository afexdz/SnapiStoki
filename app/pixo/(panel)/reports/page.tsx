"use client"

import { useEffect, useState, useCallback } from 'react'
import { useToast } from '../AdminShell'

type Report = { id: string; target_type: string; target_id: string; reason: string; status: string; created_at: string; reporter: { full_name: string; avatar_url: string | null } | null }

const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  pending:   { bg: '#2a2000', color: '#f59e0b' },
  resolved:  { bg: '#001a00', color: '#4ade80' },
  dismissed: { bg: '#2a2a2a', color: '#666' },
}

const CARD = { background: '#1A1A1A', border: '1px solid #242424', borderRadius: 14 }

export default function ReportsPage() {
  const { toast }          = useToast()
  const [reports, setReports] = useState<Report[]>([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [status, setStatus]   = useState('')
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), status })
    fetch(`/api/pixo/reports?${params}`)
      .then(r => r.json())
      .then(d => { setReports(d.reports ?? []); setTotal(d.total ?? 0) })
      .finally(() => setLoading(false))
  }, [page, status])

  useEffect(() => { load() }, [load])

  async function updateStatus(id: string, newStatus: string) {
    setWorking(id)
    try {
      const r = await fetch(`/api/pixo/reports/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) })
      if (!r.ok) throw new Error((await r.json()).error)
      toast(`Signalement marqué : ${newStatus}`)
      load()
    } catch (e: unknown) { toast((e as Error).message, 'error') }
    finally { setWorking(null) }
  }

  async function remove(id: string) {
    if (!confirm('Supprimer ce signalement ?')) return
    setWorking(id)
    try {
      const r = await fetch(`/api/pixo/reports/${id}`, { method: 'DELETE' })
      if (!r.ok) throw new Error((await r.json()).error)
      toast('Signalement supprimé')
      load()
    } catch (e: unknown) { toast((e as Error).message, 'error') }
    finally { setWorking(null) }
  }

  const perPage = 20
  const totalPages = Math.ceil(total / perPage)

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 20 }}>Signalements</h1>

      <div style={{ marginBottom: 20 }}>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}
          style={{ background: '#1A1A1A', border: '1px solid #2a2a2a', borderRadius: 10, padding: '10px 14px', color: '#888', fontSize: 13, outline: 'none', cursor: 'pointer' }}>
          <option value="">Tous</option>
          <option value="pending">En attente</option>
          <option value="resolved">Résolu</option>
          <option value="dismissed">Rejeté</option>
        </select>
      </div>

      <div style={{ ...CARD, overflow: 'hidden', padding: 0 }}>
        {loading ? <div style={{ padding: 40, textAlign: 'center', color: '#555' }}>Chargement...</div> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #242424', background: '#161616' }}>
                  {['Signaleur', 'Cible', 'Raison', 'Statut', 'Date', 'Actions'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: '#555', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.length === 0 && <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#444' }}>Aucun signalement</td></tr>}
                {reports.map(rep => {
                  const s = STATUS_COLOR[rep.status] ?? { bg: '#2a2a2a', color: '#888' }
                  return (
                    <tr key={rep.id} style={{ borderBottom: '1px solid #1c1c1c' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#1e1e1e')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#FA811225', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {rep.reporter?.avatar_url ? <img src={rep.reporter.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <span style={{ fontSize: 11, fontWeight: 700, color: '#FA8112' }}>{rep.reporter?.full_name?.[0]?.toUpperCase() ?? '?'}</span>}
                          </div>
                          <span style={{ color: '#ddd' }}>{rep.reporter?.full_name || '—'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div>
                          <span style={{ background: '#1a2a3a', color: '#88aaff', fontSize: 10, padding: '2px 7px', borderRadius: 5 }}>{rep.target_type}</span>
                          <p style={{ fontSize: 10, color: '#555', fontFamily: 'monospace', marginTop: 3 }}>{rep.target_id.slice(0, 12)}...</p>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#888', maxWidth: 240 }}>
                        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rep.reason}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: s.bg, color: s.color, fontSize: 11, padding: '3px 9px', borderRadius: 6, fontWeight: 600 }}>{rep.status}</span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#555', fontSize: 11, whiteSpace: 'nowrap' }}>{new Date(rep.created_at).toLocaleDateString('fr-DZ')}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                          {rep.status !== 'resolved' && (
                            <button onClick={() => updateStatus(rep.id, 'resolved')} disabled={working === rep.id}
                              style={{ fontSize: 10, padding: '3px 8px', borderRadius: 5, border: '1px solid #2a4a2a', background: 'transparent', color: '#88cc88', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                              Résoudre
                            </button>
                          )}
                          {rep.status !== 'dismissed' && (
                            <button onClick={() => updateStatus(rep.id, 'dismissed')} disabled={working === rep.id}
                              style={{ fontSize: 10, padding: '3px 8px', borderRadius: 5, border: '1px solid #3a3a2a', background: 'transparent', color: '#aaa', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                              Rejeter
                            </button>
                          )}
                          <button onClick={() => remove(rep.id)} disabled={working === rep.id}
                            style={{ fontSize: 10, padding: '3px 8px', borderRadius: 5, border: '1px solid #3a1010', background: 'transparent', color: '#ff6b6b', cursor: 'pointer' }}>
                            Suppr.
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
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
