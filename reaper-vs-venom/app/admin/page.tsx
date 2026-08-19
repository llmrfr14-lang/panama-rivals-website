import { redirect } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { AdminReviewPanel } from '@/components/admin-review'
import { SiteHeader } from '@/components/site-header'
import { Button } from '@/components/ui/button'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { listAdminReports } from '@/lib/reports'
import { isSupabaseConfigured } from '@/lib/supabase-admin'
import type { AdminReport } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) redirect('/admin/login')

  const backendReady = isSupabaseConfigured()
  let reports: AdminReport[] = []
  let backendError = false

  if (backendReady) {
    try {
      reports = await listAdminReports()
    } catch (error) {
      console.error('No se pudieron cargar los reportes:', error)
      backendError = true
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-balance">
              Panel de administración
            </h1>
            <p className="mt-2 max-w-2xl text-pretty text-muted-foreground">
              Revisa las capturas o repeticiones enviadas y aprueba o rechaza cada resultado.
              Los resultados aprobados se agregan a la clasificación.
            </p>
          </div>
          <form action="/api/admin/logout" method="post">
            <Button type="submit" variant="outline" size="lg">
              <LogOut className="size-4" /> Cerrar sesión
            </Button>
          </form>
        </div>
        <AdminReviewPanel
          initialReports={reports}
          backendReady={backendReady && !backendError}
        />
      </main>
    </div>
  )
}
