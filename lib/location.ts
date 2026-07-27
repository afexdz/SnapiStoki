export function formatLocation(city: string | null | undefined, country: string | null | undefined): string | null {
  if (city && country) return `${city}, ${country}`
  if (city) return city
  if (country) return country
  return null
}
