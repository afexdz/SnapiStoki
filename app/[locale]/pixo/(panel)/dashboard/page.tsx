"use client"

import { useEffect, useState } from 'react'

type Stats = { totalUsers: number; newUsers: number; totalServices: number; totalProducts: number; totalOrders: number; totalRevenue: number; pendingReports: number }
type ChartDay = { date: string; count: number }

const CARD = { background: '#1A1A1A', border: '1px solid #242424', borderRadius: 14, padding: '20px 24px' }
const LABEL = { fontSize: 12, color: '#666', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 6 }

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div style={{ ...CARD, position: 'relative', overflow: 'hidden' }}>
      {accent && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#FA8112', borderRadius: '14px 14px 0 0' }} />}
      <p style={LABEL}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 800, color: accent ? '#FA8112' : '#fff', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: '#555', marginTop: 6 }}>{sub}</p>}
    </div>
  )
}

function MiniChart({ data }: { data: ChartDay[] }) {
  const max = Math.max(...data.map(d => d.count), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 60, padding: '0 2px' }}>
      {data.map(d => (
        <div key={d.date} title={`${d.date}: ${d.count}`} style={{ flex: 1, background: d.count > 0 ? '#FA8112' : '#2a2a2a', borderRadius: '2px 2px 0 0', height: `${Math.max(4, (d.count / max) * 100)}%`, minWidth: 2, transition: 'height 0.3s ease', cursor: 'default' }} />
      ))}
    </div>
  )
}

const STATUS_COLOR: Record<string, string> = { pending: '#f59e0b', in_progress: '#3b82f6', completed: '#22c55e', cancelled: '#ef4444', delivered: '#8b5cf6' }

export default function DashboardPage() {
  const [stats, setStats]           = useState<Stats | null>(null)
  const [chart, setChart]           = useState<ChartDay[]>([])
  const [latestUsers, setLatestUsers] = useState<Record<string, unknown>[]>([])
  const [latestOrders, setLatestOrders] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    fetch('/api/pixo/dashboard')
      .then(r => r.json())
      .then(d => {
        setStats(d.stats)
        setChart(d.regChart ?? [])
        setLatestUsers(d.latestUsers ?? [])
        setLatestOrders(d.latestOrders ?? [])
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ color: '#555', padding: 40, textAlign: 'center' }}>Chargement...</div>

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Tableau de bord</h1>
      <p style={{ fontSize: 13, color: '#555', marginBottom: 28 }}>Vue d&apos;ensemble de la plateforme</p>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }}>
        <StatCard label="Utilisateurs" value={stats?.totalUsers ?? 0} sub={`+${stats?.newUsers ?? 0} cette semaine`} accent />
        <StatCard label="Services" value={stats?.totalServices ?? 0} />
        <StatCard label="Produits" value={stats?.totalProducts ?? 0} />
        <StatCard label="Commandes" value={stats?.totalOrders ?? 0} />
        <StatCard label="Revenus" value={`${((stats?.totalRevenue ?? 0) / 100).toFixed(2)} DA`} />
        <StatCard label="Signalements" value={stats?.pendingReports ?? 0} sub="en attente" accent={!!stats?.pendingReports} />
      </div>

      {/* Chart + latest orders row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        {/* Registration chart */}
        <div style={CARD}>
          <p style={{ ...LABEL, marginBottom: 16 }}>Inscriptions (30 derniers jours)</p>
          {chart.length ? <MiniChart data={chart} /> : <div style={{ height: 60, color: '#444', fontSize: 13, display: 'flex', alignItems: 'center' }}>Aucune donnée</div>}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{ fontSize: 11, color: '#444' }}>{chart[0]?.date}</span>
            <span style={{ fontSize: 11, color: '#444' }}>{chart[chart.length - 1]?.date}</span>
          </div>
        </div>

        {/* Latest orders */}
        <div style={CARD}>
          <p style={{ ...LABEL, marginBottom: 12 }}>Dernières commandes</p>
          {latestOrders.length === 0 && <p style={{ color: '#444', fontSize: 13 }}>Aucune commande</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {latestOrders.slice(0, 5).map((o: Record<string, unknown>) => (
              <div key={o.id as string} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 11, color: '#fff', background: STATUS_COLOR[o.status as string] ?? '#333', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>{o.status as string}</span>
                <span style={{ flex: 1, fontSize: 12, color: '#888', fontFamily: 'monospace' }}>{(o.id as string)?.slice(0, 8)}</span>
                <span style={{ fontSize: 12, color: '#FA8112', fontWeight: 700 }}>{((o.total_price as number ?? o.price as number ?? 0) / 100).toFixed(0)} DA</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Latest users */}
      <div style={CARD}>
        <p style={{ ...LABEL, marginBottom: 16 }}>Derniers inscrits</p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                {['Nom', 'Rôle', 'Wilaya', 'Inscription', 'Statut'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#555', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {latestUsers.map((u: Record<string, unknown>) => (
                <tr key={u.id as string} style={{ borderBottom: '1px solid #1f1f1f' }}>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#FA811225', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {u.avatar_url ? <img src={u.avatar_url as string} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <span style={{ fontSize: 12, fontWeight: 700, color: '#FA8112' }}>{(u.full_name as string)?.[0]?.toUpperCase() ?? '?'}</span>}
                      </div>
                      <span style={{ color: '#ddd' }}>{(u.full_name as string) || '—'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', color: '#888' }}>{(u.role as string) || '—'}</td>
                  <td style={{ padding: '10px 12px', color: '#888' }}>{(u.wilaya as string) || '—'}</td>
                  <td style={{ padding: '10px 12px', color: '#666', fontSize: 11 }}>{new Date(u.created_at as string).toLocaleDateString('fr-DZ')}</td>
                  <td style={{ padding: '10px 12px' }}>
                    {u.suspended ? <span style={{ background: '#3a1010', color: '#ff8888', fontSize: 11, padding: '2px 8px', borderRadius: 6 }}>Suspendu</span> : <span style={{ background: '#1a3a1a', color: '#88cc88', fontSize: 11, padding: '2px 8px', borderRadius: 6 }}>Actif</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
