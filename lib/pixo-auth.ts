import { createHmac, timingSafeEqual, randomBytes } from 'crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

function getSecret() {
  return (process.env.ADMIN_PASSWORD ?? '') + (process.env.ADMIN_USERNAME ?? '')
}

export function generateToken(): string {
  const token = randomBytes(32).toString('hex')
  const sig = createHmac('sha256', getSecret()).update(token).digest('hex')
  return `${token}.${sig}`
}

export function verifyToken(signed: string): boolean {
  if (!signed) return false
  const dot = signed.lastIndexOf('.')
  if (dot === -1) return false
  const token = signed.slice(0, dot)
  const sig = signed.slice(dot + 1)
  const expected = createHmac('sha256', getSecret()).update(token).digest('hex')
  try {
    return timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))
  } catch {
    return false
  }
}

export function extractSessionFromRequest(req: Request): string | null {
  const cookie = req.headers.get('cookie') ?? ''
  const match = cookie.match(/(?:^|;\s*)pixo_session=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

export function isValidAdminRequest(req: Request): boolean {
  const token = extractSessionFromRequest(req)
  return token !== null && verifyToken(token)
}

export async function requireAdmin(): Promise<void> {
  const cookieStore = await cookies()
  const session = cookieStore.get('pixo_session')?.value
  if (!session || !verifyToken(session)) {
    redirect('/pixo')
  }
}
