export interface Wilaya {
  id: number
  name: string
  lat: number
  lng: number
  region: string
}

export const WILAYAS: Wilaya[] = [
  { id: 1,  name: "Adrar",              lat: 27.8742,  lng: -0.2924,  region: "Sud-Ouest" },
  { id: 2,  name: "Chlef",              lat: 36.1652,  lng:  1.3317,  region: "Nord-Ouest" },
  { id: 3,  name: "Laghouat",           lat: 33.8000,  lng:  2.8650,  region: "Centre" },
  { id: 4,  name: "Oum El Bouaghi",     lat: 35.8764,  lng:  7.1137,  region: "Nord-Est" },
  { id: 5,  name: "Batna",              lat: 35.5550,  lng:  6.1740,  region: "Nord-Est" },
  { id: 6,  name: "Béjaïa",             lat: 36.7515,  lng:  5.0566,  region: "Nord" },
  { id: 7,  name: "Biskra",             lat: 34.8500,  lng:  5.7333,  region: "Nord-Est" },
  { id: 8,  name: "Béchar",             lat: 31.6167,  lng: -2.2167,  region: "Sud-Ouest" },
  { id: 9,  name: "Blida",              lat: 36.4703,  lng:  2.8277,  region: "Nord" },
  { id: 10, name: "Bouira",             lat: 36.3737,  lng:  3.9008,  region: "Nord" },
  { id: 11, name: "Tamanrasset",        lat: 22.7850,  lng:  5.5228,  region: "Grand Sud" },
  { id: 12, name: "Tébessa",            lat: 35.4040,  lng:  8.1250,  region: "Nord-Est" },
  { id: 13, name: "Tlemcen",            lat: 34.8780,  lng: -1.3150,  region: "Nord-Ouest" },
  { id: 14, name: "Tiaret",             lat: 35.3706,  lng:  1.3224,  region: "Nord-Ouest" },
  { id: 15, name: "Tizi Ouzou",         lat: 36.7167,  lng:  4.0500,  region: "Nord" },
  { id: 16, name: "Alger",              lat: 36.7538,  lng:  3.0588,  region: "Nord" },
  { id: 17, name: "Djelfa",             lat: 34.6700,  lng:  3.2630,  region: "Centre" },
  { id: 18, name: "Jijel",              lat: 36.8200,  lng:  5.7660,  region: "Nord-Est" },
  { id: 19, name: "Sétif",              lat: 36.1898,  lng:  5.4111,  region: "Nord-Est" },
  { id: 20, name: "Saïda",              lat: 34.8406,  lng:  0.1517,  region: "Nord-Ouest" },
  { id: 21, name: "Skikda",             lat: 36.8760,  lng:  6.9060,  region: "Nord-Est" },
  { id: 22, name: "Sidi Bel Abbès",     lat: 35.1896,  lng: -0.6307,  region: "Nord-Ouest" },
  { id: 23, name: "Annaba",             lat: 36.9000,  lng:  7.7667,  region: "Nord-Est" },
  { id: 24, name: "Guelma",             lat: 36.4624,  lng:  7.4328,  region: "Nord-Est" },
  { id: 25, name: "Constantine",        lat: 36.3650,  lng:  6.6147,  region: "Nord-Est" },
  { id: 26, name: "Médéa",              lat: 36.2675,  lng:  2.7528,  region: "Nord" },
  { id: 27, name: "Mostaganem",         lat: 35.9314,  lng:  0.0889,  region: "Nord-Ouest" },
  { id: 28, name: "M'Sila",             lat: 35.7058,  lng:  4.5400,  region: "Centre" },
  { id: 29, name: "Mascara",            lat: 35.3963,  lng:  0.1408,  region: "Nord-Ouest" },
  { id: 30, name: "Ouargla",            lat: 31.9488,  lng:  5.3240,  region: "Sud" },
  { id: 31, name: "Oran",               lat: 35.6971,  lng: -0.6308,  region: "Nord-Ouest" },
  { id: 32, name: "El Bayadh",          lat: 33.6831,  lng:  1.0177,  region: "Centre-Ouest" },
  { id: 33, name: "Illizi",             lat: 26.4833,  lng:  8.4833,  region: "Grand Sud" },
  { id: 34, name: "Bordj Bou Arréridj", lat: 36.0731,  lng:  4.7631,  region: "Nord-Est" },
  { id: 35, name: "Boumerdès",          lat: 36.7647,  lng:  3.4779,  region: "Nord" },
  { id: 36, name: "El Tarf",            lat: 36.7673,  lng:  8.3138,  region: "Nord-Est" },
  { id: 37, name: "Tindouf",            lat: 27.6737,  lng: -8.1673,  region: "Grand Sud-Ouest" },
  { id: 38, name: "Tissemsilt",         lat: 35.6072,  lng:  1.8118,  region: "Nord-Ouest" },
  { id: 39, name: "El Oued",            lat: 33.3560,  lng:  6.8630,  region: "Nord-Est" },
  { id: 40, name: "Khenchela",          lat: 35.4286,  lng:  7.1436,  region: "Nord-Est" },
  { id: 41, name: "Souk Ahras",         lat: 36.2863,  lng:  7.9510,  region: "Nord-Est" },
  { id: 42, name: "Tipaza",             lat: 36.5899,  lng:  2.4465,  region: "Nord" },
  { id: 43, name: "Mila",               lat: 36.4508,  lng:  6.2632,  region: "Nord-Est" },
  { id: 44, name: "Aïn Defla",          lat: 36.2577,  lng:  1.9660,  region: "Nord" },
  { id: 45, name: "Naâma",              lat: 33.2673,  lng: -0.3130,  region: "Sud-Ouest" },
  { id: 46, name: "Aïn Témouchent",     lat: 35.2950,  lng: -1.1409,  region: "Nord-Ouest" },
  { id: 47, name: "Ghardaïa",           lat: 32.4898,  lng:  3.6739,  region: "Centre" },
  { id: 48, name: "Relizane",           lat: 35.7380,  lng:  0.5530,  region: "Nord-Ouest" },
  { id: 49, name: "Timimoun",           lat: 29.2628,  lng:  0.2391,  region: "Sud-Ouest" },
  { id: 50, name: "Bordj Badji Mokhtar",lat: 21.3256,  lng:  0.9534,  region: "Grand Sud" },
  { id: 51, name: "Ouled Djellal",      lat: 34.4176,  lng:  5.0689,  region: "Centre" },
  { id: 52, name: "Béni Abbès",         lat: 30.1315,  lng: -2.1657,  region: "Sud-Ouest" },
  { id: 53, name: "In Salah",           lat: 27.1964,  lng:  2.4643,  region: "Grand Sud" },
  { id: 54, name: "In Guezzam",         lat: 19.5721,  lng:  5.7696,  region: "Grand Sud" },
  { id: 55, name: "Touggourt",          lat: 33.1000,  lng:  6.0583,  region: "Nord-Est" },
  { id: 56, name: "Djanet",             lat: 24.5526,  lng:  9.4836,  region: "Grand Sud" },
  { id: 57, name: "El M'Ghair",         lat: 33.9500,  lng:  5.9333,  region: "Nord-Est" },
  { id: 58, name: "El Meniaa",          lat: 30.5878,  lng:  2.8797,  region: "Sud" },
]

export function getWilayaById(id: number): Wilaya | undefined {
  return WILAYAS.find(w => w.id === id)
}

export function getWilayaByName(name: string): Wilaya | undefined {
  return WILAYAS.find(w => w.name.toLowerCase() === name.toLowerCase())
}

export function findNearestWilaya(lat: number, lng: number): Wilaya {
  let nearest = WILAYAS[0]
  let minDist = Infinity
  for (const w of WILAYAS) {
    const dLat = ((w.lat - lat) * Math.PI) / 180
    const dLng = ((w.lng - lng) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat * Math.PI) / 180) * Math.cos((w.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
    const dist = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    if (dist < minDist) { minDist = dist; nearest = w }
  }
  return nearest
}
