import { createClient } from '@/lib/supabase/server'

export type UserRole = 'buyer' | 'seller' | 'both' | null

export async function getUserRole(): Promise<UserRole> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return (data?.role as UserRole) ?? null
}

export function isSeller(role: UserRole | string | null | undefined): boolean {
  return role === 'seller' || role === 'both'
}
