import { type Wilaya, WILAYAS, getWilayaByName, findNearestWilaya } from './wilayas'

export type UserLocation = {
  wilaya: Wilaya | null
  countryCode: string | null   // ISO-2: 'DZ', 'FR', …
  country: string | null       // French name matching DB: 'Algérie', 'France', …
}

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
  const normalCity = normalize(city)
  return WILAYAS.find(w => normalize(w.name) === normalCity)
}

export async function detectUserLocation(): Promise<UserLocation | null> {
  if (typeof window === 'undefined') return null

  const cached = localStorage.getItem('userLocation')
  if (cached) {
    try { return JSON.parse(cached) as UserLocation } catch { localStorage.removeItem('userLocation') }
  }

  try {
    const res = await fetch('/api/geo', { signal: AbortSignal.timeout(6000) })
    if (!res.ok) return null
    const data = await res.json()

    const countryCode: string | null = data.countryCode ?? null
    const country: string | null = data.country ?? null

    let wilaya: Wilaya | undefined
    if (countryCode === 'DZ') {
      if (typeof data.lat === 'number' && typeof data.lng === 'number') {
        wilaya = findNearestWilaya(data.lat, data.lng)
      } else if (data.city) {
        wilaya = resolveWilayaByName(data.city)
      }
    }

    const location: UserLocation = { wilaya: wilaya ?? null, countryCode, country }
    localStorage.setItem('userLocation', JSON.stringify(location))
    return location
  } catch {
    return null
  }
}

// Thin shim kept for any remaining callers
export async function detectUserWilaya(): Promise<Wilaya | null> {
  const loc = await detectUserLocation()
  return loc?.wilaya ?? null
}

export function clearUserLocation() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('userLocation')
    localStorage.removeItem('userWilaya') // legacy key
  }
}
