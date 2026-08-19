export type ReportStatus = 'pending' | 'approved' | 'rejected'
export type ProofType = 'image' | 'replay'

export type ProofFile = {
  id: string
  name: string
  size: number
  mimeType: string | null
  url: string | null
}

export type AdminReport = {
  id: string
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  bestOf: number
  matchDate: string | null
  proofType: ProofType
  submittedBy: string
  status: ReportStatus
  createdAt: string
  proofFiles: ProofFile[]
}

export type ApprovedSubmission = {
  id: string
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  bestOf: number
  matchDate: string | null
  createdAt: string
}
