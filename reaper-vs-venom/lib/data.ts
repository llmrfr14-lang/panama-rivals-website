export type Team = {
  id: string
  name: string
  tag: string
  color: 'blue' | 'orange'
}

export type StandingRow = {
  teamId: string
  played: number
  wins: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  points: number
}

export type MatchResult = {
  id: string
  homeTeamId: string
  awayTeamId: string
  homeScore: number
  awayScore: number
  playedAt: string
  bestOf: number
  status: 'verified' | 'pending'
}

export const teams: Team[] = []

export const standings: StandingRow[] = []

export const recentResults: MatchResult[] = []

export function getTeam(id: string): Team | undefined {
  return teams.find((t) => t.id === id)
}
