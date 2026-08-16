import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/pixo-auth'
import AdminShell from './AdminShell'

export const metadata = { title: 'Admin — PixRaise', robots: 'noindex' }

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const session = cookieStore.get('pixo_session')?.value
  if (!session || !verifyToken(session)) redirect('/pixo')

  return <AdminShell>{children}</AdminShell>
}
