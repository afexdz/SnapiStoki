import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/lib/auth/role'

export async function getUserRole(): Promise<UserRole> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  return (data?.role as UserRole) ?? null
}
