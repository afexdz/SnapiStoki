"use client"

import { useEffect, useState, useCallback } from 'react'

type Order = { id: string; status: string; total_price: number | null; price: number | null; payment_status: string | null; order_type: string | null; created_at: string; buyer: { full_name: string } | null; seller: { full_name: string } | null }

const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  pending:     { bg: '#2a2000', color: '#f59e0b' },
  in_progress: { bg: '#001a3a', color: '#60a5fa' },
  delivered:   { bg: '#1a003a', color: '#a78bfa' },
  completed:   { bg: '#001a00', color: '#4ade80' },
  cancelled:   { bg: '#2a0000', color: '#f87171' },
}

const CARD = { background: '#1A1A1A', border: '1px solid #242424', borderRadius: 14 }

export default function OrdersPage() {
  const [orders, setOrders]   = useState<Order[]>([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [status, setStatus]   = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), status })
    fetch(`/api/pixo/orders?${params}`)
      .then(r => r.json())
      .then(d => { setOrders(d.orders ?? []); setTotal(d.total ?? 0) })
      .finally(() => setLoading(false))
  }, [page, status])

  useEffect(() => { load() }, [load])

  const perPage = 20
  const totalPages = Math.ceil(total / perPage)

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 20 }}>Commandes</h1>

      <div style={{ marginBottom: 20 }}>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}
          style={{ background: '#1A1A1A', border: '1px solid #2a2a2a', borderRadius: 10, padding: '10px 14px', color: '#888', fontSize: 13, outline: 'none', cursor: 'pointer' }}>
          <option value="">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="in_progress">En cours</option>
          <option value="delivered">Livré</option>
          <option value="completed">Complété</option>
          <option value="cancelled">Annulé</option>
        </select>
      </div>

      <div style={{ ...CARD, overflow: 'hidden', padding: 0 }}>
        {loading ? <div style={{ padding: 40, textAlign: 'center', color: '#555' }}>Chargement...</div> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #242424', background: '#161616' }}>
                  {['ID', 'Acheteur', 'Vendeur', 'Type', 'Montant', 'Paiement', 'Statut', 'Date'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: '#555', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && <tr><td colSpan={8} style={{ padding: 32, textAlign: 'center', color: '#444' }}>Aucune commande</td></tr>}
                {orders.map(o => {
                  const s = STATUS_COLOR[o.status] ?? { bg: '#2a2a2a', color: '#888' }
                  const amount = (o.total_price ?? o.price ?? 0) / 100
                  return (
                    <tr key={o.id} style={{ borderBottom: '1px solid #1c1c1c' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#1e1e1e')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#666', fontSize: 11 }}>{o.id.slice(0, 8)}...</td>
                      <td style={{ padding: '12px 16px', color: '#ddd' }}>{o.buyer?.full_name || '—'}</td>
                      <td style={{ padding: '12px 16px', color: '#888' }}>{o.seller?.full_name || '—'}</td>
                      <td style={{ padding: '12px 16px', color: '#888' }}>{o.order_type || '—'}</td>
                      <td style={{ padding: '12px 16px', color: '#FA8112', fontWeight: 700 }}>{amount.toFixed(0)} DA</td>
                      <td style={{ padding: '12px 16px', color: '#888' }}>{o.payment_status || '—'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: s.bg, color: s.color, fontSize: 11, padding: '3px 9px', borderRadius: 6, fontWeight: 600 }}>{o.status}</span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#555', fontSize: 11, whiteSpace: 'nowrap' }}>{new Date(o.created_at).toLocaleDateString('fr-DZ')}</td>
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
