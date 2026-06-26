import { type Wilaya } from '../lib/wilayas'

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function distanceFromUser(itemWilayaName: string, userWilaya: Wilaya, allWilayas: Wilaya[]): number {
  const w = allWilayas.find(
    (wl) => wl.name.toLowerCase() === itemWilayaName.toLowerCase()
  )
  if (!w) return Infinity
  return haversineKm(userWilaya.lat, userWilaya.lng, w.lat, w.lng)
}

export function sortByDistance<T extends { wilaya?: string | null }>(
  items: T[],
  userWilaya: Wilaya,
  allWilayas: Wilaya[]
): T[] {
  return [...items].sort((a, b) => {
    const da = a.wilaya ? distanceFromUser(a.wilaya, userWilaya, allWilayas) : Infinity
    const db = b.wilaya ? distanceFromUser(b.wilaya, userWilaya, allWilayas) : Infinity
    return da - db
  })
}
