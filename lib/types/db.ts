// Canonical DB types — always derived from supabase/schema.sql, never guessed.
// Use these in all queries so phantom columns fail at compile time.

export type UserRole = "buyer" | "seller" | "both"

export interface Profile {
  id: string
  full_name: string | null
  bio: string | null
  wilaya: string | null
  role: UserRole | null
  avatar_url: string | null
  cover_url: string | null
  cover_position: string | null
  rating: number | null
  created_at: string
}

export interface Service {
  id: string
  seller_id: string
  title: string
  description: string | null
  category: string | null
  price: number
  /** Use is_active — there is NO "status" column */
  is_active: boolean
  images: string[] | null
  gallery: string[] | null
  packages: Record<string, { price: number; description?: string }> | null
  tags: string[] | null
  video_url: string | null
  avg_rating: number | null
  reviews_count: number | null
  orders_count: number | null
  created_at: string
}

export interface DigitalProduct {
  id: string
  seller_id: string
  title: string
  description: string | null
  category: string | null
  price: number
  is_active: boolean
  is_free: boolean
  format: string | null
  file_format: string | null
  preview_urls: string[] | null
  preview_images: string[] | null
  license: string | null
  tags: string[] | null
  sales_count: number | null
  downloads: number | null
  avg_rating: number | null
  reviews_count: number | null
  created_at: string
}

export interface Review {
  id: string
  /** who wrote the review */
  reviewer_id: string
  /** who was reviewed (seller) — there is NO "seller_id" column */
  reviewed_id: string
  rating: number
  comment: string | null
  created_at: string
}

export interface Order {
  id: string
  buyer_id: string
  seller_id: string
  service_id: string | null
  product_id: string | null
  order_type: "service" | "product"
  status: string
  total_price: number
  created_at: string
}
