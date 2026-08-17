import { WILAYAS, type Wilaya } from './wilayas'
import { haversineKm } from '@/utils/distance'
import type { UserLocation } from './geolocation'

type WithSellerLocation = {
  seller?: {
    wilaya?: string | null
    location_country?: string | null
  } | null
}

function normalize(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

function resolveSellerWilaya(wilayaName: string | null | undefined): Wilaya | undefined {
  if (!wilayaName) return undefined
  return WILAYAS.find(w => normalize(w.name) === normalize(wilayaName))
}

function sellerIsAlgerian(seller: WithSellerLocation['seller']): boolean {
  if (seller?.wilaya) return true
  return !!(seller?.location_country?.toLowerCase().includes('alg'))
}

// 3-tier proximity sort:
//   0 — same wilaya (Algeria), ordered by GPS km
//   1 — same country
//   2 — rest of world
export function sortByProximity<T extends WithSellerLocation>(items: T[], user: UserLocation): T[] {
  const userIsAlgerian = user.countryCode === 'DZ' || user.wilaya !== null

  function score(item: T): [tier: number, dist: number] {
    const s = item.seller
    const sw = resolveSellerWilaya(s?.wilaya)

    if (user.wilaya && sw) {
      const d = haversineKm(user.wilaya.lat, user.wilaya.lng, sw.lat, sw.lng)
      return [0, d]
    }

    if (userIsAlgerian && sellerIsAlgerian(s)) return [1, 0]

    if (user.country && s?.location_country) {
      if (s.location_country.toLowerCase() === user.country.toLowerCase()) return [1, 0]
    }

    return [2, 0]
  }

  return [...items].sort((a, b) => {
    const [ta, da] = score(a)
    const [tb, db] = score(b)
    return ta !== tb ? ta - tb : da - db
  })
}
