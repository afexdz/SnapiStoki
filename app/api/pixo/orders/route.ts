import { NextRequest, NextResponse } from 'next/server'
import { isValidAdminRequest } from '@/lib/pixo-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  if (!isValidAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page    = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const status  = searchParams.get('status') ?? ''
  const perPage = 20
  const from    = (page - 1) * perPage

  const sb = createAdminClient()
  let query = sb.from('orders')
    .select(
      `id, status, total_price, price, payment_status, order_type, created_at,
       buyer:profiles!buyer_id(full_name, avatar_url),
       seller:profiles!seller_id(full_name, avatar_url)`,
      { count: 'exact' }
    )

  if (status) query = query.eq('status', status)
  query = query.order('created_at', { ascending: false }).range(from, from + perPage - 1)

  const { data, count, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ orders: data ?? [], total: count ?? 0, page, perPage })
}
