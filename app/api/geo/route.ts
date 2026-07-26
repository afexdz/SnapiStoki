import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { findNearestWilaya } from '@/lib/wilayas'

export async function GET(request: NextRequest) {
  try {
    // 1. Try Vercel geo headers (available in production)
    const lat = request.headers.get('x-vercel-ip-latitude')
    const lng = request.headers.get('x-vercel-ip-longitude')
    const country = request.headers.get('x-vercel-ip-country') ?? ''

    if (lat && lng) {
      const latNum = parseFloat(lat)
      const lngNum = parseFloat(lng)
      if (!isNaN(latNum) && !isNaN(lngNum)) {
        if (country !== 'DZ') {
          return NextResponse.json({ wilaya: null, detected: false })
        }
        const city = request.headers.get('x-vercel-ip-city') ?? undefined
        const wilaya = findNearestWilaya(latNum, lngNum)
        return NextResponse.json({ wilaya: wilaya.name, city, detected: true })
      }
    }

    // 2. Fallback: server-side ipapi.co call using client IP (no CORS issue)
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : ''

    // Skip loopback addresses (local dev)
    if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return NextResponse.json({ wilaya: null, detected: false })
    }

    const res = await fetch(`https://ipapi.co/${ip}/json/`, {
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return NextResponse.json({ wilaya: null, detected: false })

    const data = await res.json()
    if (data.country_code !== 'DZ') {
      return NextResponse.json({ wilaya: null, detected: false })
    }
    if (typeof data.latitude !== 'number' || typeof data.longitude !== 'number') {
      return NextResponse.json({ wilaya: null, detected: false })
    }

    const wilaya = findNearestWilaya(data.latitude, data.longitude)
    return NextResponse.json({ wilaya: wilaya.name, city: data.city ?? null, detected: true })
  } catch {
    return NextResponse.json({ wilaya: null, detected: false })
  }
}
