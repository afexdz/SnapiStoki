"use client"

import { useEffect, useState, useCallback } from 'react'
import { useToast } from '../AdminShell'

type Product = { id: string; title: string; category: string | null; price: number; is_active: boolean; approved: boolean | null; created_at: string; preview_images: string[] | null; file_format: string | null; downloads: number | null; rating: number | null; profiles: { full_name: string; avatar_url: string | null } | null }

const CARD = { background: '#1A1A1A', border: '1px solid #242424', borderRadius: 14 }

export default function ProductsPage() {
  const { toast }            = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [search, setSearch]     = useState('')
  const [loading, setLoading]   = useState(true)
  const [working, setWorking]   = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), search })
    fetch(`/api/pixo/products?${params}`)
      .then(r => r.json())
      .then(d => { setProducts(d.products ?? []); setTotal(d.total ?? 0) })
      .finally(() => setLoading(false))
  }, [page, search])

  useEffect(() => { load() }, [load])

  async function patch(id: string, body: Record<string, unknown>) {
    setWorking(id)
    try {
      const r = await fetch(`/api/pixo/products/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!r.ok) throw new Error((await r.json()).error)
      toast('Produit mis à jour')
      load()
    } catch (e: unknown) { toast((e as Error).message, 'error') }
    finally { setWorking(null) }
  }

  async function remove(id: string) {
    if (!confirm('Supprimer ce produit ?')) return
    setWorking(id)
    try {
      const r = await fetch(`/api/pixo/products/${id}`, { method: 'DELETE' })
      if (!r.ok) throw new Error((await r.json()).error)
      toast('Produit supprimé')
      load()
    } catch (e: unknown) { toast((e as Error).message, 'error') }
    finally { setWorking(null) }
  }

  const perPage = 20
  const totalPages = Math.ceil(total / perPage)

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 20 }}>Produits Digitaux</h1>

      <div style={{ marginBottom: 20 }}>
        <input placeholder="Rechercher un produit..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          style={{ background: '#1A1A1A', border: '1px solid #2a2a2a', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 13, outline: 'none', width: '100%', maxWidth: 400 }} />
      </div>

      <div style={{ ...CARD, overflow: 'hidden', padding: 0 }}>
        {loading ? <div style={{ padding: 40, textAlign: 'center', color: '#555' }}>Chargement...</div> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #242424', background: '#161616' }}>
                  {['Produit', 'Vendeur', 'Format', 'Prix', 'Téléch.', 'Note', 'Statut', 'Actions'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: '#555', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.length === 0 && <tr><td colSpan={8} style={{ padding: 32, textAlign: 'center', color: '#444' }}>Aucun produit</td></tr>}
                {products.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #1c1c1c' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#1e1e1e')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {p.preview_images?.[0] && <img src={p.preview_images[0]} style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} alt="" />}
                        <span style={{ color: '#ddd', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{p.title}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#888' }}>{p.profiles?.full_name || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {p.file_format && <span style={{ background: '#1a2a3a', color: '#88aaff', fontSize: 10, padding: '2px 7px', borderRadius: 5, fontFamily: 'monospace' }}>{p.file_format.toUpperCase()}</span>}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#FA8112', fontWeight: 700 }}>{(p.price / 100).toFixed(0)} DA</td>
                    <td style={{ padding: '12px 16px', color: '#888' }}>{p.downloads ?? 0}</td>
                    <td style={{ padding: '12px 16px', color: '#888' }}>{p.rating?.toFixed(1) ?? '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {p.is_active ? <span style={{ background: '#1a3a1a', color: '#88cc88', fontSize: 10, padding: '2px 7px', borderRadius: 5 }}>Actif</span> : <span style={{ background: '#2a2a2a', color: '#666', fontSize: 10, padding: '2px 7px', borderRadius: 5 }}>Inactif</span>}
                        {p.approved === false ? <span style={{ background: '#3a1010', color: '#ff8888', fontSize: 10, padding: '2px 7px', borderRadius: 5 }}>Rejeté</span> : <span style={{ background: '#1a2a3a', color: '#88aaff', fontSize: 10, padding: '2px 7px', borderRadius: 5 }}>Approuvé</span>}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button onClick={() => patch(p.id, { approved: p.approved === false ? true : false })} disabled={working === p.id}
                          style={{ fontSize: 11, padding: '4px 8px', borderRadius: 5, border: '1px solid #2a4a2a', background: 'transparent', color: p.approved === false ? '#88cc88' : '#ff8888', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          {p.approved === false ? 'Approuver' : 'Rejeter'}
                        </button>
                        <button onClick={() => remove(p.id)} disabled={working === p.id}
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
