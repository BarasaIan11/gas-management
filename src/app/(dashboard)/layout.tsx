import { AppShell } from '@/components/layout/AppShell'
import { createClient } from '@/utils/supabase/server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: shops } = await supabase.from('shops').select('id, name, location').order('created_at')

  return <AppShell shops={shops || []}>{children}</AppShell>
}
