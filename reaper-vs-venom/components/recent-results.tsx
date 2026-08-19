import { CircleCheck, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MatchResult, Team } from '@/lib/data'

export function RecentResults({
  teams,
  results,
}: {
  teams: Team[]
  results: MatchResult[]
}) {
  const getTeam = (id: string) => teams.find((team) => team.id === id)

  return (
    <div className="flex flex-col gap-3">
      {results.map((match) => {
        const home = getTeam(match.homeTeamId)
        const away = getTeam(match.awayTeamId)
        const homeWon = match.homeScore > match.awayScore
        return (
          <div
            key={match.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3.5"
          >
            <div className="flex flex-1 items-center justify-end gap-2.5 text-right">
              <span className={cn('font-medium', homeWon ? 'text-foreground' : 'text-muted-foreground')}>
                {home?.name}
              </span>
              <span
                className={cn(
                  'size-2.5 rounded-full',
                  home?.color === 'blue' ? 'bg-team-blue' : 'bg-team-orange',
                )}
                aria-hidden
              />
            </div>

            <div className="flex shrink-0 items-center gap-2 rounded-lg bg-muted px-3 py-1.5 font-display font-bold tabular-nums">
              <span className={cn(homeWon ? 'text-foreground' : 'text-muted-foreground')}>
                {match.homeScore}
              </span>
              <span className="text-xs text-muted-foreground">–</span>
              <span className={cn(!homeWon ? 'text-foreground' : 'text-muted-foreground')}>
                {match.awayScore}
              </span>
            </div>

            <div className="flex flex-1 items-center gap-2.5">
              <span
                className={cn(
                  'size-2.5 rounded-full',
                  away?.color === 'blue' ? 'bg-team-blue' : 'bg-team-orange',
                )}
                aria-hidden
              />
              <span className={cn('font-medium', !homeWon ? 'text-foreground' : 'text-muted-foreground')}>
                {away?.name}
              </span>
            </div>

            <div className="hidden w-24 shrink-0 items-center justify-end gap-1.5 text-xs md:flex">
              {match.status === 'verified' ? (
                <span className="flex items-center gap-1 text-primary">
                  <CircleCheck className="size-3.5" /> Verificado
                </span>
              ) : (
                <span className="flex items-center gap-1 text-accent">
                  <Clock className="size-3.5" /> Pendiente
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
