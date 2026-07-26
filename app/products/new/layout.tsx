import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isSeller } from '@/lib/auth/role'

export default async function NewProductLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/products/new')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!isSeller(profile?.role)) redirect('/devenir-vendeur')

  return <>{children}</>
}
