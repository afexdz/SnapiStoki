import { WILAYAS, type Wilaya } from './wilayas'

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function nearestWilaya(lat: number, lng: number): Wilaya {
  return WILAYAS.reduce((closest, w) => {
    const d = haversineDistance(lat, lng, w.lat, w.lng)
    const dClosest = haversineDistance(lat, lng, closest.lat, closest.lng)
    return d < dClosest ? w : closest
  })
}

async function getLocationFromIP(): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(5000) })
    if (!res.ok) return null
    const data = await res.json()
    if (typeof data.latitude === 'number' && typeof data.longitude === 'number') {
      return { lat: data.latitude, lng: data.longitude }
    }
    return null
  } catch {
    return null
  }
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

  let coords: { lat: number; lng: number } | null = null

  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    coords = await new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { timeout: 6000, maximumAge: 600000 }
      )
    })
  }

  if (!coords) {
    coords = await getLocationFromIP()
  }

  if (!coords) return null

  const wilaya = nearestWilaya(coords.lat, coords.lng)
  if (typeof window !== 'undefined') {
    localStorage.setItem('userWilaya', JSON.stringify(wilaya))
  }
  return wilaya
}

export function clearUserWilaya() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('userWilaya')
  }
}
