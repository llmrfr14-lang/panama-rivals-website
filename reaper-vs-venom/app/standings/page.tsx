import { SiteHeader } from '@/components/site-header'
import { StandingsTable } from '@/components/standings-table'
import { RecentResults } from '@/components/recent-results'

export default function StandingsPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold tracking-tight">Season 4 Standings</h1>
          <p className="mt-2 text-muted-foreground">
            Win = 3 points. Updated as admins verify submitted results.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <section className="flex flex-col gap-4">
            <h2 className="font-display text-xl font-bold tracking-tight">League Table</h2>
            <StandingsTable />
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span>P — Played</span>
              <span>W — Wins</span>
              <span>L — Losses</span>
              <span>GD — Goal Difference</span>
              <span>Pts — Points</span>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="font-display text-xl font-bold tracking-tight">Recent Results</h2>
            <RecentResults />
          </section>
        </div>
      </main>
    </div>
  )
}
