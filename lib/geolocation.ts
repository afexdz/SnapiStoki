import { type Wilaya, getWilayaByName } from './wilayas'

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
    if (!data.city) return null

    const wilaya = getWilayaByName(data.city)
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
