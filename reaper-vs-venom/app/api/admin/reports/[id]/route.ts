import { NextResponse, type NextRequest } from 'next/server'
import { isAdminRequest } from '@/lib/admin-auth'
import { updateReportStatus } from '@/lib/reports'
import type { ReportStatus } from '@/lib/types'

export const runtime = 'nodejs'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Inicia sesión como administrador.' }, { status: 401 })
  }

  const { id } = await params
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'La solicitud no tiene un formato válido.' }, { status: 400 })
  }

  const status = body.status as ReportStatus
  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Estado no válido.' }, { status: 400 })
  }

  try {
    await updateReportStatus(id, status)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('No se pudo actualizar el reporte:', error)
    return NextResponse.json({ error: 'No se pudo actualizar el reporte.' }, { status: 500 })
  }
}
