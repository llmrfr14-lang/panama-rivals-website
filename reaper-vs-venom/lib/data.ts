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

export const teams: Team[] = [
  { id: 'reapers', name: 'Reapers', tag: 'RPR', color: 'orange' },
  { id: 'venom', name: 'Venom', tag: 'VNM', color: 'blue' },
  { id: 'nova', name: 'Nova Surge', tag: 'NVA', color: 'blue' },
  { id: 'apex', name: 'Apex Drift', tag: 'APX', color: 'orange' },
  { id: 'titan', name: 'Titan GC', tag: 'TTN', color: 'blue' },
  { id: 'phantom', name: 'Phantom Five', tag: 'PHM', color: 'orange' },
]

export const standings: StandingRow[] = [
  { teamId: 'venom', played: 10, wins: 8, losses: 2, goalsFor: 34, goalsAgainst: 18, points: 24 },
  { teamId: 'reapers', played: 10, wins: 7, losses: 3, goalsFor: 31, goalsAgainst: 21, points: 21 },
  { teamId: 'nova', played: 10, wins: 6, losses: 4, goalsFor: 28, goalsAgainst: 23, points: 18 },
  { teamId: 'apex', played: 10, wins: 5, losses: 5, goalsFor: 25, goalsAgainst: 25, points: 15 },
  { teamId: 'titan', played: 10, wins: 3, losses: 7, goalsFor: 19, goalsAgainst: 29, points: 9 },
  { teamId: 'phantom', played: 10, wins: 1, losses: 9, goalsFor: 14, goalsAgainst: 36, points: 3 },
]

export const recentResults: MatchResult[] = [
  {
    id: 'm-101',
    homeTeamId: 'reapers',
    awayTeamId: 'venom',
    homeScore: 0,
    awayScore: 4,
    playedAt: '2026-08-18',
    bestOf: 7,
    status: 'verified',
  },
  {
    id: 'm-100',
    homeTeamId: 'nova',
    awayTeamId: 'apex',
    homeScore: 3,
    awayScore: 2,
    playedAt: '2026-08-17',
    bestOf: 5,
    status: 'verified',
  },
  {
    id: 'm-099',
    homeTeamId: 'titan',
    awayTeamId: 'phantom',
    homeScore: 3,
    awayScore: 1,
    playedAt: '2026-08-16',
    bestOf: 5,
    status: 'verified',
  },
  {
    id: 'm-098',
    homeTeamId: 'venom',
    awayTeamId: 'nova',
    homeScore: 3,
    awayScore: 0,
    playedAt: '2026-08-15',
    bestOf: 5,
    status: 'pending',
  },
]

export function getTeam(id: string): Team | undefined {
  return teams.find((t) => t.id === id)
}
