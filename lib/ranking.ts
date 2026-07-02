export type Rankable = {
  avg_rating?: number | null
  rating?: number | null
  reviews_count?: number | null
  total_orders?: number | null
  orders_count?: number | null
  sales_count?: number | null
  downloads?: number | null
  created_at: string
}

export function rankItems<T extends Rankable>(items: T[]): T[] {
  const hasAnyReviews = items.some(i => (i.reviews_count ?? 0) > 0)

  const score = (i: T): number => {
    const rating = Number(i.avg_rating ?? i.rating ?? 0)
    const reviews = i.reviews_count ?? 0
    const orders = i.total_orders ?? i.orders_count ?? i.sales_count ?? i.downloads ?? 0
    const daysSince = (Date.now() - new Date(i.created_at).getTime()) / 86400000
    const recency = Math.max(0, 30 - daysSince)
    return rating * 20 + reviews * 2 + orders * 3 + recency
  }

  if (!hasAnyReviews) {
    return [...items].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }

  const withReviews = items.filter(i => (i.reviews_count ?? 0) > 0)
  const noReviews   = items.filter(i => (i.reviews_count ?? 0) === 0)

  return [
    ...withReviews.sort((a, b) => score(b) - score(a)),
    ...noReviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
  ]
}
