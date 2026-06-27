import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const role = user.user_metadata?.role ?? user.user_metadata?.account_type ?? 'buyer'
  if (role === 'seller') redirect('/dashboard/freelance')
  redirect('/dashboard/client')
}
