import Link from 'next/link'
import Image from 'next/image'
import { ListChecks, ShieldCheck, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/site-header'
import { StandingsTable } from '@/components/standings-table'
import { RecentResults } from '@/components/recent-results'
import { getSiteData } from '@/lib/site-data'

const steps = [
  {
    icon: ListChecks,
    title: 'Elige el partido',
    desc: 'Elige ambos equipos, el formato de la serie y el marcador final.',
  },
  {
    icon: Upload,
    title: 'Agrega tu prueba',
    desc: '¿Consola? Sube una captura de pantalla final. ¿PC? Adjunta un archivo de repetición. Cualquiera sirve.',
  },
  {
    icon: ShieldCheck,
    title: 'Envía para revisión',
    desc: 'Confirma los datos y envíalos. Los administradores los verifican antes de incluirlos en la tabla.',
  },
]

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const { teams, standings, recentResults } = await getSiteData()

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <Image src="/arena-hero.png" alt="" fill priority className="object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/40" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-24 sm:px-6 sm:py-28 lg:grid-cols-[1fr_auto]">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <span className="size-1.5 rounded-full bg-primary" /> Temporada 2 · En vivo
            </span>
            <h1 className="mt-5 font-display text-5xl font-bold tracking-tight text-balance sm:text-6xl">
              Reporta tus resultados de PanamaRivals en{' '}
              <span className="text-primary">tres sencillos pasos</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-pretty text-muted-foreground">
              El centro oficial de la liga PanamaRivals de Rocket League. Desde consola o PC,
              envía una captura o una repetición y deja que la clasificación se actualice sola.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" nativeButton={false} render={<Link href="/submit" />}>
                <Upload className="size-4" /> Enviar resultado
              </Button>
              <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/standings" />}>
                Ver clasificación
              </Button>
            </div>
          </div>
          <div className="hidden justify-self-center lg:block">
            <Image
              src="/panamarivals-logo.png"
              alt="Logotipo de la liga PanamaRivals"
              width={340}
              height={340}
              priority
              className="size-72 rounded-2xl object-cover shadow-2xl shadow-primary/20 ring-1 ring-border xl:size-80"
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-10 flex flex-col gap-2">
          <h2 className="font-display text-3xl font-bold tracking-tight">Cómo enviar un resultado</h2>
          <p className="text-muted-foreground">
            Un flujo guiado que hace que probar un resultado sea rápido y claro.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="relative flex flex-col gap-3 rounded-xl border border-border bg-card p-5"
            >
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <s.icon className="size-5" />
              </span>
              <span className="absolute right-4 top-4 font-display text-sm font-bold text-muted-foreground/50">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="font-display text-lg font-semibold">{s.title}</h3>
              <p className="text-sm text-pretty text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Standings + Results */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col gap-4">
            <div className="flex items-end justify-between">
              <h2 className="font-display text-2xl font-bold tracking-tight">Clasificación de la liga</h2>
              <Button variant="link" size="lg" nativeButton={false} render={<Link href="/standings" />}>
                Tabla completa
              </Button>
            </div>
            <StandingsTable teams={teams} standings={standings} />
          </div>
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-2xl font-bold tracking-tight">Resultados recientes</h2>
            <RecentResults teams={teams} results={recentResults} />
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <p>Liga PanamaRivals de Rocket League</p>
          <p>Creado para la comunidad · Temporada 2</p>
        </div>
      </footer>
    </div>
  )
}
