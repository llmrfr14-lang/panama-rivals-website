import { SiteHeader } from '@/components/site-header'
import { SubmitWizard } from '@/components/submit-wizard'
import { isSupabaseConfigured } from '@/lib/supabase-admin'

export default function SubmitPage() {
  const backendReady = isSupabaseConfigured()

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-10 text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight text-balance">
            Reportar resultado de partido
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-pretty text-muted-foreground">
            Ingresa el partido y luego pruébalo con una captura final o un archivo de
            repetición, según funcione mejor para tu plataforma. Los administradores verifican
            los reportes antes de que aparezcan en la clasificación.
          </p>
        </div>
        <SubmitWizard backendReady={backendReady} />
      </main>
    </div>
  )
}
