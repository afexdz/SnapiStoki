import { NextRequest, NextResponse } from 'next/server'
import { isValidAdminRequest } from '@/lib/pixo-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  if (!isValidAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page   = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const search = searchParams.get('search') ?? ''
  const role   = searchParams.get('role') ?? ''
  const perPage = 20

  const sb = createAdminClient()

  // Fetch auth users (has email)
  const { data: authData } = await sb.auth.admin.listUsers({ page, perPage: 1000 })
  const authUsers = authData?.users ?? []

  // Fetch profiles with filters
  let query = sb.from('profiles')
    .select('id, full_name, avatar_url, role, wilaya, created_at, suspended, bio', { count: 'exact' })

  if (search) {
    query = query.ilike('full_name', `%${search}%`)
  }
  if (role) {
    query = query.eq('role', role)
  }

  const from = (page - 1) * perPage
  query = query.order('created_at', { ascending: false }).range(from, from + perPage - 1)

  const { data: profiles, count } = await query

  // Join email from auth users
  const emailMap: Record<string, string> = {}
  for (const u of authUsers) emailMap[u.id] = u.email ?? ''

  const users = (profiles ?? []).map(p => ({ ...p, email: emailMap[p.id] ?? '' }))

  return NextResponse.json({ users, total: count ?? 0, page, perPage })
}
