import { SiteHeader } from '@/components/site-header'
import { StandingsTable } from '@/components/standings-table'
import { RecentResults } from '@/components/recent-results'
import { getSiteData } from '@/lib/site-data'

export const dynamic = 'force-dynamic'

export default async function StandingsPage() {
  const { teams, standings, recentResults } = await getSiteData()

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold tracking-tight">Clasificación de la temporada 2</h1>
          <p className="mt-2 text-muted-foreground">
            Victoria = 3 puntos · Derrota = −1 punto. Se actualiza a medida que los administradores verifican los resultados enviados.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <section className="flex flex-col gap-4">
            <h2 className="font-display text-xl font-bold tracking-tight">Tabla de la liga</h2>
            <StandingsTable teams={teams} standings={standings} />
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span>PJ — Partidos jugados</span>
              <span>V — Victorias</span>
              <span>D — Derrotas</span>
              <span>DG — Diferencia de goles</span>
              <span>Pts — Puntos</span>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="font-display text-xl font-bold tracking-tight">Resultados recientes</h2>
            <RecentResults teams={teams} results={recentResults} />
          </section>
        </div>
      </main>
    </div>
  )
}
