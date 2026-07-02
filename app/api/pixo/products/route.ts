import { NextRequest, NextResponse } from 'next/server'
import { isValidAdminRequest } from '@/lib/pixo-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  if (!isValidAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page    = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const search  = searchParams.get('search') ?? ''
  const perPage = 20
  const from    = (page - 1) * perPage

  const sb = createAdminClient()
  let query = sb.from('digital_products')
    .select('id, title, category, price, is_active, approved, created_at, seller_id, preview_images, file_format, downloads, rating, profiles!seller_id(full_name, avatar_url)', { count: 'exact' })

  if (search) query = query.ilike('title', `%${search}%`)
  query = query.order('created_at', { ascending: false }).range(from, from + perPage - 1)

  const { data, count, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ products: data ?? [], total: count ?? 0, page, perPage })
}
