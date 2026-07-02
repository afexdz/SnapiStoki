import { NextRequest, NextResponse } from 'next/server'
import { generateToken } from '@/lib/pixo-auth'

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()

  if (
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 })
  }

  const token = generateToken()

  const res = NextResponse.json({ ok: true })
  res.cookies.set('pixo_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24,
    path: '/',
  })
  return res
}
