import { cn } from '@/lib/utils'
import { getTeam, standings } from '@/lib/data'

export function StandingsTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Team</th>
              <th className="px-3 py-3 text-center font-medium">P</th>
              <th className="px-3 py-3 text-center font-medium">W</th>
              <th className="px-3 py-3 text-center font-medium">L</th>
              <th className="hidden px-3 py-3 text-center font-medium sm:table-cell">GD</th>
              <th className="px-4 py-3 text-right font-medium">Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row, i) => {
              const team = getTeam(row.teamId)
              const gd = row.goalsFor - row.goalsAgainst
              return (
                <tr
                  key={row.teamId}
                  className="border-b border-border/50 last:border-0 transition-colors hover:bg-muted/40"
                >
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          'size-2.5 rounded-full',
                          team?.color === 'blue' ? 'bg-team-blue' : 'bg-team-orange',
                        )}
                        aria-hidden
                      />
                      <span className="font-medium">{team?.name}</span>
                      <span className="text-xs text-muted-foreground">{team?.tag}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center tabular-nums text-muted-foreground">
                    {row.played}
                  </td>
                  <td className="px-3 py-3 text-center tabular-nums">{row.wins}</td>
                  <td className="px-3 py-3 text-center tabular-nums text-muted-foreground">
                    {row.losses}
                  </td>
                  <td className="hidden px-3 py-3 text-center tabular-nums sm:table-cell">
                    <span className={cn(gd > 0 && 'text-primary', gd < 0 && 'text-muted-foreground')}>
                      {gd > 0 ? `+${gd}` : gd}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-display font-bold tabular-nums">
                    {row.points}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
