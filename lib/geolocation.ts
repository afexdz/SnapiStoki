import { type Wilaya, WILAYAS, getWilayaByName, findNearestWilaya } from './wilayas'

// English/ASCII aliases for city names returned by Vercel geo headers or ipapi.co
const CITY_ALIASES: Record<string, string> = {
  'algiers': 'Alger',
  'oran city': 'Oran',
}

function normalize(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

function resolveWilayaByName(city: string): Wilaya | undefined {
  const exact = getWilayaByName(city)
  if (exact) return exact
  const alias = CITY_ALIASES[city.toLowerCase()]
  if (alias) return getWilayaByName(alias)
  // accent-stripped comparison
  const normalCity = normalize(city)
  return WILAYAS.find((w: Wilaya) => normalize(w.name) === normalCity)
}

export async function detectUserWilaya(): Promise<Wilaya | null> {
  const cached = typeof window !== 'undefined' ? localStorage.getItem('userWilaya') : null
  if (cached) {
    try {
      return JSON.parse(cached) as Wilaya
    } catch {
      localStorage.removeItem('userWilaya')
    }
  }

  try {
    const res = await fetch('/api/geo', { signal: AbortSignal.timeout(6000) })
    if (!res.ok) return null
    const data = await res.json()

    let wilaya: Wilaya | undefined

    // Prefer coordinates — handles communes, suburbs, and non-French city names
    if (typeof data.lat === 'number' && typeof data.lng === 'number') {
      wilaya = findNearestWilaya(data.lat, data.lng)
    }

    // Fallback: name match with accent normalization + alias table
    if (!wilaya && data.city) {
      wilaya = resolveWilayaByName(data.city)
    }

    if (!wilaya) return null

    if (typeof window !== 'undefined') {
      localStorage.setItem('userWilaya', JSON.stringify(wilaya))
    }
    return wilaya
  } catch {
    return null
  }
}

export function clearUserWilaya() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('userWilaya')
  }
}
