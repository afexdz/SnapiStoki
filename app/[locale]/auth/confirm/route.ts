import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { emailRedirect } from '@/lib/auth/email-redirect'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const tokenHash = url.searchParams.get('token_hash')
  const type = url.searchParams.get('type')
  const recovery = type === 'recovery'
  const next = emailRedirect(url.searchParams.get('next'), url.origin, recovery)
  const locale = next.match(/^\/(en|ar|fr)\//)?.[1]
  const prefix = locale && locale !== 'fr' ? `/${locale}` : ''

  if (tokenHash && (type === 'signup' || type === 'recovery')) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
    if (!error) {
      const response = NextResponse.redirect(new URL(next, url.origin))
      response.headers.set('Cache-Control', 'no-store')
      response.headers.set('Referrer-Policy', 'no-referrer')
      return response
    }
  }

  const target = recovery ? `${prefix}/reset-password?error=expired` : `${prefix}/login?error=email-link`
  const response = NextResponse.redirect(new URL(target, url.origin))
  response.headers.set('Cache-Control', 'no-store')
  response.headers.set('Referrer-Policy', 'no-referrer')
  return response
}
