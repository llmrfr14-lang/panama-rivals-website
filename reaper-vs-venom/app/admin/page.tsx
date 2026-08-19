import { AdminReviewPanel } from '@/components/admin-review'
import { SiteHeader } from '@/components/site-header'

export default function AdminPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-10">
          <h1 className="font-display text-4xl font-bold tracking-tight text-balance">
            Cola de revisión de administradores
          </h1>
          <p className="mt-2 max-w-2xl text-pretty text-muted-foreground">
            Revisa los reportes pendientes, inspecciona sus pruebas y aprueba o rechaza los resultados.
            Esta interfaz está lista para conectarse a una ruta de administración protegida y almacenamiento persistente.
          </p>
        </div>
        <AdminReviewPanel />
      </main>
    </div>
  )
}
