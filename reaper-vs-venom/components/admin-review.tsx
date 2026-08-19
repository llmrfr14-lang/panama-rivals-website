'use client'

import { useState } from 'react'
import { AlertTriangle, Check, ExternalLink, FileImage, FileVideo, ShieldCheck, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { AdminReport, ProofFile, ReportStatus } from '@/lib/types'

type Filter = 'all' | ReportStatus

const filters: { id: Filter; label: string }[] = [
  { id: 'pending', label: 'Pendientes' },
  { id: 'approved', label: 'Aprobados' },
  { id: 'rejected', label: 'Rechazados' },
  { id: 'all', label: 'Todos' },
]

export function AdminReviewPanel({
  initialReports,
  backendReady,
}: {
  initialReports: AdminReport[]
  backendReady: boolean
}) {
  const [reports, setReports] = useState(initialReports)
  const [filter, setFilter] = useState<Filter>('pending')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function updateStatus(id: string, status: ReportStatus) {
    setError('')
    setBusyId(id)
    try {
      const response = await fetch(`/api/admin/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'No se pudo actualizar el reporte.')
      setReports((current) =>
        current.map((report) => (report.id === id ? { ...report, status } : report)),
      )
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'No se pudo actualizar el reporte.')
    } finally {
      setBusyId(null)
    }
  }

  const filteredReports = reports.filter((report) => filter === 'all' || report.status === filter)
  const pendingCount = reports.filter((report) => report.status === 'pending').length
  const approvedCount = reports.filter((report) => report.status === 'approved').length
  const rejectedCount = reports.filter((report) => report.status === 'rejected').length

  return (
    <div className="flex flex-col gap-6">
      {!backendReady && (
        <div className="flex gap-3 rounded-xl border border-accent/40 bg-accent/10 p-4 text-sm text-accent">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>
            La base de datos todavía no está configurada. Los reportes reales aparecerán aquí
            después de conectar Supabase.
          </p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard label="Pendientes" value={pendingCount} accent="text-accent" />
        <SummaryCard label="Aprobados" value={approvedCount} accent="text-primary" />
        <SummaryCard label="Rechazados" value={rejectedCount} accent="text-destructive" />
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <Button
            key={item.id}
            variant={filter === item.id ? 'default' : 'outline'}
            size="lg"
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-col gap-4">
        {filteredReports.length ? (
          filteredReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              busy={busyId === report.id}
              onUpdate={updateStatus}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <ShieldCheck className="mx-auto mb-3 size-8 text-muted-foreground" />
            <p className="font-medium">Ningún reporte coincide con este filtro.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Los reportes aprobados o rechazados siguen disponibles en sus filtros correspondientes.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string
  value: number
  accent: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={cn('mt-1 font-display text-3xl font-bold', accent)}>{value}</p>
    </div>
  )
}

function ReportCard({
  report,
  busy,
  onUpdate,
}: {
  report: AdminReport
  busy: boolean
  onUpdate: (id: string, status: ReportStatus) => Promise<void>
}) {
  const pending = report.status === 'pending'
  const proofLabel =
    report.proofType === 'image'
      ? `${report.proofFiles.length} ${report.proofFiles.length === 1 ? 'captura de pantalla' : 'capturas de pantalla'}`
      : `${report.proofFiles.length} ${report.proofFiles.length === 1 ? 'archivo de repetición' : 'archivos de repetición'}`

  return (
    <article className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display text-xl font-bold">
              {report.homeTeam} vs {report.awayTeam}
            </h2>
            <StatusBadge status={report.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            ID del reporte: <span className="font-mono">{report.id}</span> · Enviado por{' '}
            {report.submittedBy}
          </p>
        </div>
        {pending && (
          <div className="flex gap-2">
            <Button size="sm" disabled={busy} onClick={() => onUpdate(report.id, 'approved')}>
              <Check className="size-4" /> {busy ? 'Guardando…' : 'Aprobar'}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={busy}
              onClick={() => onUpdate(report.id, 'rejected')}
            >
              <X className="size-4" /> Rechazar
            </Button>
          </div>
        )}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Info
          label="Marcador"
          value={`${report.homeTeam} ${report.homeScore} – ${report.awayScore} ${report.awayTeam}`}
        />
        <Info label="Serie" value={`Mejor de ${report.bestOf}`} />
        <Info label="Fecha del partido" value={report.matchDate || 'Sin fecha'} />
        <Info label="Prueba" value={proofLabel} />
      </div>

      <ProofList files={report.proofFiles} proofType={report.proofType} />
    </article>
  )
}

function ProofList({
  files,
  proofType,
}: {
  files: ProofFile[]
  proofType: 'image' | 'replay'
}) {
  if (!files.length) {
    return (
      <div className="mt-5 flex items-center gap-3 rounded-xl border border-dashed border-border bg-background p-4 text-sm text-muted-foreground">
        {proofType === 'image' ? <FileImage className="size-5" /> : <FileVideo className="size-5" />}
        No hay archivos disponibles para este reporte.
      </div>
    )
  }

  if (proofType === 'image') {
    return (
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {files.map((file) => (
          <a
            key={file.id}
            href={file.url ?? undefined}
            target="_blank"
            rel="noreferrer"
            className="group overflow-hidden rounded-xl border border-border bg-background"
          >
            {file.url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={file.url}
                alt={file.name}
                className="aspect-video w-full object-cover transition-transform group-hover:scale-[1.02]"
              />
            ) : (
              <div className="flex aspect-video items-center justify-center text-sm text-muted-foreground">
                Prueba no disponible
              </div>
            )}
            <span className="flex items-center gap-2 truncate px-3 py-2 text-xs text-muted-foreground">
              <ExternalLink className="size-3.5 shrink-0" /> {file.name}
            </span>
          </a>
        ))}
      </div>
    )
  }

  return (
    <ul className="mt-5 flex flex-col gap-2">
      {files.map((file) => (
        <li
          key={file.id}
          className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2.5"
        >
          <span className="flex min-w-0 items-center gap-2.5 text-sm">
            <FileVideo className="size-4 shrink-0 text-accent" />
            <span className="truncate">{file.name}</span>
          </span>
          {file.url && (
            <a
              href={file.url}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 text-sm font-medium text-primary hover:underline"
            >
              Abrir
            </a>
          )}
        </li>
      ))}
    </ul>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: ReportStatus }) {
  const styles: Record<ReportStatus, string> = {
    pending: 'border-accent/30 bg-accent/10 text-accent',
    approved: 'border-primary/30 bg-primary/10 text-primary',
    rejected: 'border-destructive/30 bg-destructive/10 text-destructive',
  }
  const labels: Record<ReportStatus, string> = {
    pending: 'Pendiente',
    approved: 'Aprobado',
    rejected: 'Rechazado',
  }

  return (
    <span className={cn('rounded-full border px-2.5 py-1 text-xs font-medium', styles[status])}>
      {labels[status]}
    </span>
  )
}
