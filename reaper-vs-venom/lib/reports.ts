import { PROOF_BUCKET, requireSupabaseAdmin } from '@/lib/supabase-admin'
import type { AdminReport, ApprovedSubmission, ReportStatus } from '@/lib/types'

type SubmissionRow = {
  id: string
  home_team: string
  away_team: string
  home_score: number
  away_score: number
  best_of: number
  match_date: string | null
  proof_type: 'image' | 'replay'
  submitted_by: string
  status: ReportStatus
  created_at: string
}

type ProofRow = {
  id: string
  submission_id: string
  storage_path: string
  file_name: string
  file_size: number
  mime_type: string | null
}

function reportFromRow(row: SubmissionRow, proofs: ProofRow[], urls: Map<string, string | null>): AdminReport {
  return {
    id: row.id,
    homeTeam: row.home_team,
    awayTeam: row.away_team,
    homeScore: row.home_score,
    awayScore: row.away_score,
    bestOf: row.best_of,
    matchDate: row.match_date,
    proofType: row.proof_type,
    submittedBy: row.submitted_by,
    status: row.status,
    createdAt: row.created_at,
    proofFiles: proofs
      .filter((proof) => proof.submission_id === row.id)
      .map((proof) => ({
        id: proof.id,
        name: proof.file_name,
        size: proof.file_size,
        mimeType: proof.mime_type,
        url: urls.get(proof.storage_path) ?? null,
      })),
  }
}

export async function listAdminReports() {
  const supabase = requireSupabaseAdmin()
  const { data: submissions, error } = await supabase
    .from('submissions')
    .select('id, home_team, away_team, home_score, away_score, best_of, match_date, proof_type, submitted_by, status, created_at')
    .neq('status', 'uploading')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  const rows = (submissions ?? []) as SubmissionRow[]
  if (!rows.length) return []

  const ids = rows.map((row) => row.id)
  const { data: proofData, error: proofError } = await supabase
    .from('proof_files')
    .select('id, submission_id, storage_path, file_name, file_size, mime_type')
    .in('submission_id', ids)
    .eq('uploaded', true)

  if (proofError) throw new Error(proofError.message)
  const proofs = (proofData ?? []) as ProofRow[]

  const urls = new Map<string, string | null>()
  await Promise.all(
    proofs.map(async (proof) => {
      const { data } = await supabase.storage
        .from(PROOF_BUCKET)
        .createSignedUrl(proof.storage_path, 60 * 60)
      urls.set(proof.storage_path, data?.signedUrl ?? null)
    }),
  )

  return rows.map((row) => reportFromRow(row, proofs, urls))
}

export async function updateReportStatus(id: string, status: ReportStatus) {
  if (!['pending', 'approved', 'rejected'].includes(status)) {
    throw new Error('Estado no válido')
  }

  const supabase = requireSupabaseAdmin()
  const { error } = await supabase
    .from('submissions')
    .update({ status })
    .eq('id', id)
    .neq('status', 'uploading')

  if (error) throw new Error(error.message)
}

export async function listApprovedSubmissions() {
  const supabase = requireSupabaseAdmin()
  const { data, error } = await supabase
    .from('submissions')
    .select('id, home_team, away_team, home_score, away_score, best_of, match_date, created_at')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  return ((data ?? []) as SubmissionRow[]).map<ApprovedSubmission>((row) => ({
    id: row.id,
    homeTeam: row.home_team,
    awayTeam: row.away_team,
    homeScore: row.home_score,
    awayScore: row.away_score,
    bestOf: row.best_of,
    matchDate: row.match_date,
    createdAt: row.created_at,
  }))
}
