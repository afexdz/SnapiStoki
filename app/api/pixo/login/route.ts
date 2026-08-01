import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { generateToken } from '@/lib/pixo-auth'

// In-memory rate limiter: max 5 attempts per IP per 15 minutes
const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 5
const attempts = new Map<string, { count: number; resetAt: number }>()

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-real-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    'unknown'
  )
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const record = attempts.get(ip)
  if (!record || now > record.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }
  record.count++
  return record.count > MAX_ATTEMPTS
}

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Trop de tentatives. Réessayez dans 15 minutes.' },
      { status: 429 }
    )
  }

  const { username, password } = await req.json()

  const validUsername = safeCompare(username ?? '', process.env.ADMIN_USERNAME ?? '')
  const validPassword = safeCompare(password ?? '', process.env.ADMIN_PASSWORD ?? '')

  if (!validUsername || !validPassword) {
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
