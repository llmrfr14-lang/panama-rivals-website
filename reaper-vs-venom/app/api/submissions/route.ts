import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'
import { PROOF_BUCKET, requireSupabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

const MAX_PROOF_FILES = 5
const MAX_IMAGE_SIZE = 10 * 1024 * 1024
const MAX_REPLAY_SIZE = 50 * 1024 * 1024

type ProofInput = {
  clientId?: string
  name?: string
  size?: number
  type?: string
}

function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

function cleanName(name: string, maxLength: number) {
  return name.trim().replace(/\s+/g, ' ').slice(0, maxLength)
}

function safeFileName(name: string) {
  const cleaned = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return cleaned || 'prueba'
}

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return fail('El reporte no tiene un formato válido.')
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return fail('El almacenamiento de reportes todavía no está configurado.', 503)
  }

  const homeTeam = cleanName(String(body.homeTeam ?? ''), 80)
  const awayTeam = cleanName(String(body.awayTeam ?? ''), 80)
  const submittedBy = cleanName(String(body.submittedBy ?? ''), 80) || 'Jugador de PanamaRivals'
  const homeScore = Number(body.homeScore)
  const awayScore = Number(body.awayScore)
  const bestOf = Number(body.bestOf)
  const matchDate = String(body.matchDate ?? '')
  const proofType = body.proofType
  const files = Array.isArray(body.files) ? (body.files as ProofInput[]) : []

  if (!homeTeam || !awayTeam) return fail('Ingresa los nombres de ambos equipos.')
  if (homeTeam.toLowerCase() === awayTeam.toLowerCase()) {
    return fail('El equipo local y el visitante deben ser diferentes.')
  }
  if (!Number.isInteger(homeScore) || !Number.isInteger(awayScore) || homeScore < 0 || awayScore < 0) {
    return fail('El marcador debe contener números válidos.')
  }
  if (![3, 5, 7].includes(bestOf)) return fail('El formato de serie no es válido.')
  if (homeScore === awayScore || Math.max(homeScore, awayScore) !== Math.ceil(bestOf / 2)) {
    return fail(`El equipo ganador debe tener ${Math.ceil(bestOf / 2)} victorias.`)
  }
  if (matchDate && (!/^\d{4}-\d{2}-\d{2}$/.test(matchDate) || Number.isNaN(Date.parse(matchDate)))) {
    return fail('La fecha del partido no es válida.')
  }
  if (proofType !== 'image' && proofType !== 'replay') return fail('El tipo de prueba no es válido.')
  if (!files.length || files.length > MAX_PROOF_FILES) {
    return fail(`Sube entre 1 y ${MAX_PROOF_FILES} archivos de prueba.`)
  }

  for (const file of files) {
    const name = String(file.name ?? '')
    const size = Number(file.size)
    const type = String(file.type ?? '')
    if (!name || !Number.isFinite(size) || size <= 0) return fail('Uno de los archivos no es válido.')
    if (proofType === 'image') {
      if (!type.startsWith('image/')) return fail('Las capturas deben ser imágenes.')
      if (size > MAX_IMAGE_SIZE) return fail('Cada captura debe pesar menos de 10 MB.')
    } else {
      if (!name.toLowerCase().endsWith('.replay')) return fail('Las repeticiones deben ser archivos .replay.')
      if (size > MAX_REPLAY_SIZE) return fail('Cada repetición debe pesar menos de 50 MB.')
    }
  }

  const supabase = requireSupabaseAdmin()
  const submissionId = randomUUID()
  const proofRows: { id: string; submission_id: string; storage_path: string; file_name: string; file_size: number; mime_type: string }[] = []
  const uploads: { clientId: string; proofId: string; signedUrl: string }[] = []

  const { error: submissionError } = await supabase.from('submissions').insert({
    id: submissionId,
    home_team: homeTeam,
    away_team: awayTeam,
    home_score: homeScore,
    away_score: awayScore,
    best_of: bestOf,
    match_date: matchDate || null,
    proof_type: proofType,
    submitted_by: submittedBy,
    status: 'uploading',
  })

  if (submissionError) return fail('No se pudo guardar el reporte.', 500)

  try {
    for (const file of files) {
      const proofId = randomUUID()
      const storagePath = `${submissionId}/${proofId}-${safeFileName(String(file.name))}`
      const { data: signedUpload, error: uploadUrlError } = await supabase.storage
        .from(PROOF_BUCKET)
        .createSignedUploadUrl(storagePath)

      if (uploadUrlError || !signedUpload?.signedUrl) {
        throw new Error(uploadUrlError?.message || 'No se pudo preparar la subida del archivo.')
      }

      proofRows.push({
        id: proofId,
        submission_id: submissionId,
        storage_path: storagePath,
        file_name: String(file.name),
        file_size: Number(file.size),
        mime_type: String(file.type || 'application/octet-stream'),
      })
      uploads.push({
        clientId: String(file.clientId),
        proofId,
        signedUrl: signedUpload.signedUrl,
      })
    }

    const { error: proofError } = await supabase.from('proof_files').insert(proofRows)
    if (proofError) throw new Error(proofError.message)

    return NextResponse.json({ submissionId, uploads })
  } catch (error) {
    await supabase.from('submissions').delete().eq('id', submissionId)
    console.error('No se pudo preparar el reporte:', error)
    return fail('No se pudo preparar la subida de archivos.', 500)
  }
}
