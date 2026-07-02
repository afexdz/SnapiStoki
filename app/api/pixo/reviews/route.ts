import { NextRequest, NextResponse } from 'next/server'
import { isValidAdminRequest } from '@/lib/pixo-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  if (!isValidAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page    = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const perPage = 20
  const from    = (page - 1) * perPage

  const sb = createAdminClient()
  const { data, count, error } = await sb.from('reviews')
    .select(
      `id, rating, comment, created_at,
       reviewer:profiles!reviewer_id(full_name, avatar_url),
       reviewed:profiles!reviewed_id(full_name, avatar_url)`,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(from, from + perPage - 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ reviews: data ?? [], total: count ?? 0, page, perPage })
}
