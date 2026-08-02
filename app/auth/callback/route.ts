import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const rawNext = searchParams.get('next') ?? '/dashboard'
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/dashboard'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // For Google sign-in: enrich profile with provider metadata if fields are empty
      const { data: { user } } = await supabase.auth.getUser()
      if (user && user.app_metadata?.provider === 'google') {
        const meta = user.user_metadata ?? {}
        const googleName: string | null = meta.full_name ?? meta.name ?? null
        const googleAvatar: string | null = meta.avatar_url ?? meta.picture ?? null

        if (googleName || googleAvatar) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', user.id)
            .single()

          const updates: Record<string, string> = {}
          if (!profile?.full_name && googleName) updates.full_name = googleName
          if (!profile?.avatar_url && googleAvatar) updates.avatar_url = googleAvatar

          if (Object.keys(updates).length > 0) {
            await supabase.from('profiles').update(updates).eq('id', user.id)
          }
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
