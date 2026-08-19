import { Lock } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { Button } from '@/components/ui/button'

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const message = error === 'config'
    ? 'La configuración de administrador todavía no está lista.'
    : error
      ? 'Contraseña incorrecta.'
      : null

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto flex max-w-md flex-col px-4 py-20 sm:px-6">
        <div className="rounded-2xl border border-border bg-card p-8">
          <div className="mb-5 flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Lock className="size-6" />
          </div>
          <h1 className="font-display text-3xl font-bold">Acceso de administrador</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ingresa la contraseña para revisar los reportes enviados.
          </p>
          <form action="/api/admin/login" method="post" className="mt-6 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-muted-foreground">Contraseña</span>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
              />
            </label>
            {message && <p className="text-sm text-destructive">{message}</p>}
            <Button size="lg" type="submit">
              Iniciar sesión
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
