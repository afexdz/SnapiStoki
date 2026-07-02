"use client"

import { useEffect, useState, useCallback } from 'react'
import { useToast } from '../AdminShell'

type Review = { id: string; rating: number; comment: string | null; created_at: string; reviewer: { full_name: string; avatar_url: string | null } | null; reviewed: { full_name: string } | null }

const CARD = { background: '#1A1A1A', border: '1px solid #242424', borderRadius: 14 }

function Stars({ n }: { n: number }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= n ? '#FA8112' : '#333', fontSize: 13 }}>★</span>
      ))}
    </span>
  )
}

export default function ReviewsPage() {
  const { toast }          = useToast()
  const [reviews, setReviews] = useState<Review[]>([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    fetch(`/api/pixo/reviews?page=${page}`)
      .then(r => r.json())
      .then(d => { setReviews(d.reviews ?? []); setTotal(d.total ?? 0) })
      .finally(() => setLoading(false))
  }, [page])

  useEffect(() => { load() }, [load])

  async function remove(id: string) {
    if (!confirm('Supprimer cet avis ?')) return
    setDeleting(id)
    try {
      const r = await fetch(`/api/pixo/reviews/${id}`, { method: 'DELETE' })
      if (!r.ok) throw new Error((await r.json()).error)
      toast('Avis supprimé')
      load()
    } catch (e: unknown) { toast((e as Error).message, 'error') }
    finally { setDeleting(null) }
  }

  const perPage = 20
  const totalPages = Math.ceil(total / perPage)

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 20 }}>Avis</h1>

      <div style={{ ...CARD, overflow: 'hidden', padding: 0 }}>
        {loading ? <div style={{ padding: 40, textAlign: 'center', color: '#555' }}>Chargement...</div> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #242424', background: '#161616' }}>
                  {['Auteur', 'Sur', 'Note', 'Commentaire', 'Date', 'Action'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: '#555', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reviews.length === 0 && <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#444' }}>Aucun avis</td></tr>}
                {reviews.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #1c1c1c' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#1e1e1e')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#FA811225', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {r.reviewer?.avatar_url ? <img src={r.reviewer.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <span style={{ fontSize: 11, fontWeight: 700, color: '#FA8112' }}>{r.reviewer?.full_name?.[0]?.toUpperCase() ?? '?'}</span>}
                        </div>
                        <span style={{ color: '#ddd' }}>{r.reviewer?.full_name || '—'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#888' }}>{r.reviewed?.full_name || '—'}</td>
                    <td style={{ padding: '12px 16px' }}><Stars n={r.rating} /></td>
                    <td style={{ padding: '12px 16px', color: '#888', maxWidth: 280 }}>
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.comment || '—'}</span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#555', fontSize: 11, whiteSpace: 'nowrap' }}>{new Date(r.created_at).toLocaleDateString('fr-DZ')}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => remove(r.id)} disabled={deleting === r.id}
                        style={{ fontSize: 11, padding: '4px 10px', borderRadius: 5, border: '1px solid #3a1010', background: 'transparent', color: '#ff6b6b', cursor: 'pointer', opacity: deleting === r.id ? 0.5 : 1 }}>
                        Suppr.
                      </button>
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
