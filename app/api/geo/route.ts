import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ISO_TO_FRENCH: Record<string, string> = {
  DZ: 'Algérie', FR: 'France', MA: 'Maroc', TN: 'Tunisie', US: 'États-Unis',
  GB: 'Royaume-Uni', DE: 'Allemagne', ES: 'Espagne', IT: 'Italie', CA: 'Canada',
  BE: 'Belgique', CH: 'Suisse', NL: 'Pays-Bas', PT: 'Portugal', SE: 'Suède',
  NO: 'Norvège', DK: 'Danemark', FI: 'Finlande', PL: 'Pologne', AU: 'Australie',
  BR: 'Brésil', MX: 'Mexique', AR: 'Argentine', SA: 'Arabie Saoudite', AE: 'Émirats arabes unis',
  TR: 'Turquie', EG: 'Égypte', NG: 'Nigeria', SN: 'Sénégal', CI: 'Côte d\'Ivoire',
  CM: 'Cameroun', ML: 'Mali', LY: 'Libye', MR: 'Mauritanie', LB: 'Liban', JO: 'Jordanie',
}

export async function GET(request: NextRequest) {
  try {
    // 1. Try Vercel geo headers (available in production)
    const cityHeader = request.headers.get('x-vercel-ip-city')
    const isoCountry = request.headers.get('x-vercel-ip-country') ?? ''

    if (cityHeader && isoCountry) {
      const city = decodeURIComponent(cityHeader)
      const country = ISO_TO_FRENCH[isoCountry] ?? isoCountry
      // Vercel headers don't include coordinates
      return NextResponse.json({ city, country, countryCode: isoCountry, lat: null, lng: null, detected: true })
    }

    // 2. Fallback: ipapi.co (includes coordinates)
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : ''

    if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return NextResponse.json({ city: null, country: null, countryCode: null, lat: null, lng: null, detected: false })
    }

    const res = await fetch(`https://ipapi.co/${ip}/json/`, {
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return NextResponse.json({ city: null, country: null, countryCode: null, lat: null, lng: null, detected: false })

    const data = await res.json()
    const city = data.city ?? null
    const isoCode = data.country_code ?? null
    const country = ISO_TO_FRENCH[isoCode ?? ''] ?? data.country_name ?? null
    const lat = typeof data.latitude === 'number' ? data.latitude : null
    const lng = typeof data.longitude === 'number' ? data.longitude : null
    return NextResponse.json({ city, country, countryCode: isoCode, lat, lng, detected: !!(city || country) })
  } catch {
    return NextResponse.json({ city: null, country: null, countryCode: null, detected: false })
  }
}
