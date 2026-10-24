import PasswordRecovery from '@/components/PasswordRecovery'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return <PasswordRecovery mode="reset" ready={!!user && !params.error} />
}
