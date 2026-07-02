import { NextRequest, NextResponse } from 'next/server'
import { isValidAdminRequest } from '@/lib/pixo-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  if (!isValidAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sb = createAdminClient()
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString()

  const [
    usersRes,
    newUsersRes,
    servicesRes,
    productsRes,
    ordersRes,
    revenueRes,
    reportsRes,
    regChartRes,
    latestUsersRes,
    latestOrdersRes,
  ] = await Promise.allSettled([
    sb.from('profiles').select('id', { count: 'exact', head: true }),
    sb.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo),
    sb.from('services').select('id', { count: 'exact', head: true }),
    sb.from('digital_products').select('id', { count: 'exact', head: true }),
    sb.from('orders').select('id', { count: 'exact', head: true }),
    sb.from('orders').select('total_price').eq('status', 'completed'),
    sb.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    sb.from('profiles').select('created_at').gte('created_at', monthAgo).order('created_at'),
    sb.from('profiles').select('id, full_name, avatar_url, role, wilaya, created_at, suspended').order('created_at', { ascending: false }).limit(10),
    sb.from('orders').select('id, buyer_id, seller_id, total_price, status, created_at, order_type').order('created_at', { ascending: false }).limit(10),
  ])

  const totalUsers    = usersRes.status === 'fulfilled'    ? (usersRes.value.count ?? 0) : 0
  const newUsers      = newUsersRes.status === 'fulfilled' ? (newUsersRes.value.count ?? 0) : 0
  const totalServices = servicesRes.status === 'fulfilled' ? (servicesRes.value.count ?? 0) : 0
  const totalProducts = productsRes.status === 'fulfilled' ? (productsRes.value.count ?? 0) : 0
  const totalOrders   = ordersRes.status === 'fulfilled'   ? (ordersRes.value.count ?? 0) : 0
  const pendingReports= reportsRes.status === 'fulfilled'  ? (reportsRes.value.count ?? 0) : 0

  const revenueRows = revenueRes.status === 'fulfilled' ? (revenueRes.value.data ?? []) : []
  const totalRevenue = revenueRows.reduce((s: number, r: { total_price?: number }) => s + (r.total_price ?? 0), 0)

  // Build 30-day registration chart from raw profiles
  const regRows = regChartRes.status === 'fulfilled' ? (regChartRes.value.data ?? []) : []
  const regMap: Record<string, number> = {}
  for (const r of regRows) {
    const day = (r.created_at ?? '').slice(0, 10)
    if (day) regMap[day] = (regMap[day] ?? 0) + 1
  }
  const today = new Date()
  const regChart = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (29 - i))
    const key = d.toISOString().slice(0, 10)
    return { date: key, count: regMap[key] ?? 0 }
  })

  const latestUsers  = latestUsersRes.status === 'fulfilled'  ? (latestUsersRes.value.data ?? []) : []
  const latestOrders = latestOrdersRes.status === 'fulfilled' ? (latestOrdersRes.value.data ?? []) : []

  return NextResponse.json({
    stats: { totalUsers, newUsers, totalServices, totalProducts, totalOrders, totalRevenue, pendingReports },
    regChart,
    latestUsers,
    latestOrders,
  })
}
