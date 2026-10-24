'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/client'

export default function PasswordRecovery({ mode, ready = true }: { mode: 'request' | 'reset'; ready?: boolean }) {
  const t = useTranslations('auth.recovery')
  const locale = useLocale()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [busy, setBusy] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const invalid = mode === 'reset' && !ready
  const inputClass = 'w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--cream)] px-4 py-3 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--orange)]'

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy || invalid) return
    setError('')
    if (mode === 'reset' && password !== confirmation) { setError(t('mismatch')); return }
    if (mode === 'reset' && password.length < 8) { setError(t('passwordHint')); return }
    setBusy(true)
    try {
      const supabase = createClient()
      if (mode === 'request') {
        const prefix = locale === 'fr' ? '' : `/${locale}`
        const { error: authError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}${prefix}/reset-password`,
        })
        if (authError) { setError(authError.status === 429 ? t('rateLimit') : t('sendError')); return }
      } else {
        const { error: authError } = await supabase.auth.updateUser({ password })
        if (authError) { setError(authError.code === 'same_password' ? t('samePassword') : t('resetError')); return }
        await supabase.auth.signOut({ scope: 'local' })
      }
      setPassword('')
      setConfirmation('')
      setSuccess(true)
    } catch {
      setError(mode === 'request' ? t('sendError') : t('resetError'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen bg-[var(--white)] px-4 py-10 text-[var(--ink)] flex flex-col items-center justify-center">
      <Link href="/" className="mb-8 text-2xl font-extrabold"><span className="text-[var(--orange)]">Pix</span>Raise</Link>
      <section className="w-full max-w-md rounded-3xl border border-[var(--border-subtle)] bg-[var(--white)] p-7 sm:p-10 shadow-xl shadow-[var(--orange)]/10" aria-labelledby="recovery-title">
        <h1 id="recovery-title" className="text-2xl font-extrabold mb-3">{t(success ? (mode === 'request' ? 'sentTitle' : 'doneTitle') : invalid ? 'expiredTitle' : mode === 'request' ? 'requestTitle' : 'resetTitle')}</h1>
        <p className="text-sm text-gray-500 mb-6" role={success ? 'status' : undefined}>{t(success ? (mode === 'request' ? 'sentDescription' : 'doneDescription') : invalid ? 'expiredDescription' : mode === 'request' ? 'requestDescription' : 'resetDescription')}</p>
        {error && <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {!success && !invalid && <form onSubmit={submit} className="space-y-5">
          {mode === 'request' ? <div><label htmlFor="recovery-email" className="block text-sm font-medium mb-2">{t('email')}</label><input id="recovery-email" name="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} className={inputClass} /></div> : <>
            <div><label htmlFor="recovery-password" className="block text-sm font-medium mb-2">{t('password')}</label><input id="recovery-password" name="password" type="password" autoComplete="new-password" required minLength={8} maxLength={128} aria-describedby="password-hint" value={password} onChange={e => setPassword(e.target.value)} className={inputClass} /><p id="password-hint" className="mt-2 text-xs text-gray-500">{t('passwordHint')}</p></div>
            <div><label htmlFor="recovery-confirm" className="block text-sm font-medium mb-2">{t('confirm')}</label><input id="recovery-confirm" name="confirmation" type="password" autoComplete="new-password" required minLength={8} maxLength={128} value={confirmation} onChange={e => setConfirmation(e.target.value)} className={inputClass} /></div>
          </>}
          <button disabled={busy} className="w-full rounded-xl bg-[var(--orange)] px-4 py-3 font-bold text-white hover:bg-[var(--orange-dark)] disabled:opacity-60">{t(busy ? 'working' : mode === 'request' ? 'send' : 'save')}</button>
        </form>}
        {invalid && <Link href="/forgot-password" className="block rounded-xl bg-[var(--orange)] px-4 py-3 text-center font-bold text-white">{t('newLink')}</Link>}
        <Link href="/login" className="block mt-6 text-center text-sm font-semibold text-[var(--orange)]">{t('backToLogin')}</Link>
      </section>
    </main>
  )
}
