import { NextResponse } from 'next/server'
import { PROOF_BUCKET, requireSupabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return fail('La confirmación no tiene un formato válido.')
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return fail('El almacenamiento de reportes todavía no está configurado.', 503)
  }

  const submissionId = String(body.submissionId ?? '')
  if (!submissionId) return fail('Falta el ID del reporte.')

  const supabase = requireSupabaseAdmin()
  const { data: submission, error: submissionError } = await supabase
    .from('submissions')
    .select('id, status')
    .eq('id', submissionId)
    .single()

  if (submissionError || !submission) return fail('No se encontró el reporte.', 404)
  if (submission.status !== 'uploading') return NextResponse.json({ ok: true })

  const { data: proofs, error: proofError } = await supabase
    .from('proof_files')
    .select('id, storage_path')
    .eq('submission_id', submissionId)

  if (proofError || !proofs?.length) return fail('No se encontraron archivos para este reporte.', 404)

  for (const proof of proofs) {
    const { data: exists, error: existsError } = await supabase.storage
      .from(PROOF_BUCKET)
      .exists(proof.storage_path)
    if (existsError || !exists) return fail('Todavía falta subir al menos un archivo de prueba.')
  }

  const { error: updateProofsError } = await supabase
    .from('proof_files')
    .update({ uploaded: true })
    .eq('submission_id', submissionId)
  if (updateProofsError) return fail('No se pudieron confirmar los archivos.', 500)

  const { error: updateSubmissionError } = await supabase
    .from('submissions')
    .update({ status: 'pending' })
    .eq('id', submissionId)
  if (updateSubmissionError) return fail('No se pudo activar el reporte para revisión.', 500)

  return NextResponse.json({ ok: true })
}
