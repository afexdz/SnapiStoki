// Client-safe: pure helpers only, no server imports.
export type UserRole = 'buyer' | 'seller' | 'both' | null

export function isSeller(role: UserRole | string | null | undefined): boolean {
  return role === 'seller' || role === 'both'
}
