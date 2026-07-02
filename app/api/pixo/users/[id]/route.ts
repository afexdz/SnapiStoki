import { NextRequest, NextResponse } from 'next/server'
import { isValidAdminRequest } from '@/lib/pixo-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isValidAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const sb = createAdminClient()
  const [{ data: profile }, { data: authUser }] = await Promise.all([
    sb.from('profiles').select('*').eq('id', id).single(),
    sb.auth.admin.getUserById(id),
  ])
  return NextResponse.json({ profile, email: authUser.user?.email ?? '' })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isValidAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const sb = createAdminClient()
  const { error } = await sb.from('profiles').update(body).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isValidAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const sb = createAdminClient()
  const { error } = await sb.auth.admin.deleteUser(id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
