"use client"

import { useEffect, useState } from 'react'
import { useToast } from '../AdminShell'

const CARD = { background: '#1A1A1A', border: '1px solid #242424', borderRadius: 14, padding: '24px 28px', marginBottom: 16 }
const LABEL = { display: 'block', color: '#999', fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }

export default function SettingsPage() {
  const { toast }              = useToast()
  const [settings, setSettings] = useState<Record<string, unknown>>({})
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)

  useEffect(() => {
    fetch('/api/pixo/settings')
      .then(r => r.json())
      .then(d => setSettings(d.settings ?? {}))
      .finally(() => setLoading(false))
  }, [])

  async function save(key: string, value: unknown) {
    setSaving(true)
    try {
      const r = await fetch('/api/pixo/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, value }) })
      if (!r.ok) throw new Error((await r.json()).error)
      setSettings(s => ({ ...s, [key]: value }))
      toast('Paramètre sauvegardé')
    } catch (e: unknown) { toast((e as Error).message, 'error') }
    finally { setSaving(false) }
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#555' }}>Chargement...</div>

  const maintenanceMode = settings['maintenance_mode'] === true || settings['maintenance_mode'] === 'true'

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Paramètres</h1>
      <p style={{ fontSize: 13, color: '#555', marginBottom: 28 }}>Configuration de la plateforme</p>

      {/* Maintenance mode */}
      <div style={CARD}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Mode Maintenance</h3>
            <p style={{ color: '#666', fontSize: 13 }}>Désactive l&apos;accès public au site. Seuls les admins peuvent se connecter.</p>
          </div>
          <button
            onClick={() => save('maintenance_mode', !maintenanceMode)}
            disabled={saving}
            style={{
              width: 52, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0,
              background: maintenanceMode ? '#FA8112' : '#333', transition: 'background 0.2s',
              opacity: saving ? 0.7 : 1,
            }}
          >
            <span style={{ position: 'absolute', top: 3, left: maintenanceMode ? 27 : 3, width: 22, height: 22, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', display: 'block' }} />
          </button>
        </div>
        <div style={{ marginTop: 12, padding: '8px 12px', background: maintenanceMode ? '#2a1a00' : '#1a2a1a', borderRadius: 8, fontSize: 12, color: maintenanceMode ? '#f59e0b' : '#4ade80' }}>
          {maintenanceMode ? '⚠ Mode maintenance ACTIVÉ — le site est inaccessible aux utilisateurs' : '✓ Site en ligne — accessible au public'}
        </div>
      </div>

      {/* Admin credentials info */}
      <div style={CARD}>
        <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Identifiants Admin</h3>
        <p style={{ color: '#666', fontSize: 13, marginBottom: 16 }}>Les identifiants sont définis via les variables d&apos;environnement. Pour les modifier, mettez à jour <code style={{ background: '#242424', padding: '2px 6px', borderRadius: 4, color: '#FA8112', fontSize: 12 }}>.env.local</code> et redémarrez le serveur.</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ background: '#242424', borderRadius: 10, padding: '12px 16px', flex: 1, minWidth: 200 }}>
            <label style={LABEL}>Identifiant</label>
            <div style={{ color: '#ddd', fontSize: 14, fontFamily: 'monospace' }}>Défini via ADMIN_USERNAME</div>
          </div>
          <div style={{ background: '#242424', borderRadius: 10, padding: '12px 16px', flex: 1, minWidth: 200 }}>
            <label style={LABEL}>Mot de passe</label>
            <div style={{ color: '#ddd', fontSize: 14, fontFamily: 'monospace' }}>Défini via ADMIN_PASSWORD</div>
          </div>
        </div>
      </div>

      {/* Platform info */}
      <div style={CARD}>
        <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Informations Système</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {[
            { label: 'Plateforme', value: 'PixRaise' },
            { label: 'Environnement', value: process.env.NODE_ENV === 'production' ? 'Production' : 'Développement' },
            { label: 'Framework', value: 'Next.js 14' },
            { label: 'Base de données', value: 'Supabase (PostgreSQL)' },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: '#242424', borderRadius: 10, padding: '12px 16px' }}>
              <label style={LABEL}>{label}</label>
              <div style={{ color: '#ddd', fontSize: 14 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div style={{ ...CARD, border: '1px solid #3a1010', background: '#1a0a0a' }}>
        <h3 style={{ color: '#ff8888', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>Zone Dangereuse</h3>
        <p style={{ color: '#666', fontSize: 13, marginBottom: 16 }}>Actions irréversibles — à utiliser avec précaution.</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              if (confirm('Vider le cache de la plateforme ?')) {
                toast('Cache vidé (simulation)', 'info')
              }
            }}
            style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid #5a2020', background: 'transparent', color: '#ff8888', fontSize: 13, cursor: 'pointer' }}
          >
            Vider le cache
          </button>
        </div>
      </div>
    </div>
  )
}
