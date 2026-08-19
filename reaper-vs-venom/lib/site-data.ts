import {
  recentResults as fallbackResults,
  standings as fallbackStandings,
  teams as fallbackTeams,
  type MatchResult,
  type StandingRow,
  type Team,
} from '@/lib/data'
import { listApprovedSubmissions } from '@/lib/reports'
import { isSupabaseConfigured } from '@/lib/supabase-admin'

function normalizeName(name: string) {
  return name.trim().toLowerCase()
}

function slugify(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return slug || 'equipo'
}

function tagFromName(name: string) {
  const tag = name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join('')
    .slice(0, 3)
    .toUpperCase()
  return tag || 'EQP'
}

function copyFallbackData() {
  return {
    teams: fallbackTeams.map((team) => ({ ...team })),
    standings: fallbackStandings.map((row) => ({ ...row })),
    recentResults: fallbackResults.map((result) => ({ ...result })),
  }
}

function findOrCreateTeam(teams: Team[], name: string) {
  const normalized = normalizeName(name)
  const existing = teams.find((team) => normalizeName(team.name) === normalized)
  if (existing) return existing

  let id = slugify(name)
  let suffix = 2
  while (teams.some((team) => team.id === id)) {
    id = `${slugify(name)}-${suffix}`
    suffix += 1
  }

  const team: Team = {
    id,
    name: name.trim(),
    tag: tagFromName(name),
    color: teams.length % 2 === 0 ? 'orange' : 'blue',
  }
  teams.push(team)
  return team
}

function sortStandings(rows: StandingRow[]) {
  return rows.sort((a, b) => {
    const points = b.points - a.points
    if (points) return points
    const goalDifference = (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst)
    if (goalDifference) return goalDifference
    return b.goalsFor - a.goalsFor
  })
}

export async function getSiteData() {
  const data = copyFallbackData()
  if (!isSupabaseConfigured()) return data

  try {
    const approved = await listApprovedSubmissions()
    const rows = new Map(data.standings.map((row) => [row.teamId, row]))
    const approvedResults: MatchResult[] = []

    for (const submission of approved) {
      const homeTeam = findOrCreateTeam(data.teams, submission.homeTeam)
      const awayTeam = findOrCreateTeam(data.teams, submission.awayTeam)
      const homeRow = rows.get(homeTeam.id) ?? {
        teamId: homeTeam.id,
        played: 0,
        wins: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0,
      }
      const awayRow = rows.get(awayTeam.id) ?? {
        teamId: awayTeam.id,
        played: 0,
        wins: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0,
      }

      homeRow.played += 1
      awayRow.played += 1
      homeRow.goalsFor += submission.homeScore
      homeRow.goalsAgainst += submission.awayScore
      awayRow.goalsFor += submission.awayScore
      awayRow.goalsAgainst += submission.homeScore

      if (submission.homeScore > submission.awayScore) {
        homeRow.wins += 1
        homeRow.points += 3
        awayRow.losses += 1
      } else {
        awayRow.wins += 1
        awayRow.points += 3
        homeRow.losses += 1
      }

      rows.set(homeTeam.id, homeRow)
      rows.set(awayTeam.id, awayRow)
      approvedResults.push({
        id: submission.id,
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        homeScore: submission.homeScore,
        awayScore: submission.awayScore,
        playedAt: submission.matchDate ?? submission.createdAt.slice(0, 10),
        bestOf: submission.bestOf,
        status: 'verified',
      })
    }

    return {
      teams: data.teams,
      standings: sortStandings(Array.from(rows.values())),
      recentResults: [...approvedResults, ...data.recentResults].slice(0, 8),
    }
  } catch (error) {
    console.error('No se pudieron cargar los resultados aprobados:', error)
    return data
  }
}
