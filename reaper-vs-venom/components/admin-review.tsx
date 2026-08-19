'use client'

import { useState } from 'react'
import { Check, FileImage, FileVideo, ShieldCheck, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type ReportStatus = 'pending' | 'approved' | 'rejected'
type Filter = 'all' | ReportStatus

type AdminReport = {
  id: string
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  bestOf: string
  matchDate: string
  proofType: 'image' | 'replay'
  proofCount: number
  submittedBy: string
  status: ReportStatus
}

const initialReports: AdminReport[] = [
  {
    id: 'report-001',
    homeTeam: 'Reapers',
    awayTeam: 'Venom',
    homeScore: 2,
    awayScore: 3,
    bestOf: '5',
    matchDate: '2026-08-18',
    proofType: 'image',
    proofCount: 2,
    submittedBy: 'jugador de PanamaRivals',
    status: 'pending',
  },
  {
    id: 'report-002',
    homeTeam: 'Nova Surge',
    awayTeam: 'Apex Drift',
    homeScore: 3,
    awayScore: 1,
    bestOf: '5',
    matchDate: '2026-08-17',
    proofType: 'replay',
    proofCount: 1,
    submittedBy: 'jugador de PanamaRivals',
    status: 'pending',
  },
]

const filters: { id: Filter; label: string }[] = [
  { id: 'pending', label: 'Pendientes' },
  { id: 'approved', label: 'Aprobados' },
  { id: 'rejected', label: 'Rechazados' },
  { id: 'all', label: 'Todos' },
]

export function AdminReviewPanel() {
  const [reports, setReports] = useState(initialReports)
  const [filter, setFilter] = useState<Filter>('pending')

  function updateStatus(id: string, status: ReportStatus) {
    setReports((current) =>
      current.map((report) => (report.id === id ? { ...report, status } : report)),
    )
  }

  const filteredReports = reports.filter((report) => filter === 'all' || report.status === filter)
  const pendingCount = reports.filter((report) => report.status === 'pending').length
  const approvedCount = reports.filter((report) => report.status === 'approved').length
  const rejectedCount = reports.filter((report) => report.status === 'rejected').length

  return (
    <div className="flex flex-col gap-6">
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

      <div className="flex flex-col gap-4">
        {filteredReports.length ? (
          filteredReports.map((report) => (
            <ReportCard key={report.id} report={report} onUpdate={updateStatus} />
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
  onUpdate,
}: {
  report: AdminReport
  onUpdate: (id: string, status: ReportStatus) => void
}) {
  const pending = report.status === 'pending'
  const proofLabel =
    report.proofType === 'image'
      ? `${report.proofCount} ${report.proofCount === 1 ? 'captura de pantalla' : 'capturas de pantalla'}`
      : `${report.proofCount} ${report.proofCount === 1 ? 'archivo de repetición' : 'archivos de repetición'}`

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
            <Button size="sm" onClick={() => onUpdate(report.id, 'approved')}>
              <Check className="size-4" /> Aprobar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onUpdate(report.id, 'rejected')}
            >
              <X className="size-4" /> Rechazar
            </Button>
          </div>
        )}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto]">
        <div className="grid gap-3 sm:grid-cols-2">
          <Info label="Marcador" value={`${report.homeTeam} ${report.homeScore} – ${report.awayScore} ${report.awayTeam}`} />
          <Info label="Serie" value={`Mejor de ${report.bestOf}`} />
          <Info label="Fecha del partido" value={report.matchDate} />
          <Info label="Prueba" value={proofLabel} />
        </div>
        <div className="flex min-w-36 items-center justify-center rounded-xl border border-dashed border-border bg-background p-4">
          {report.proofType === 'image' ? (
            <FileImage className="mr-2.5 size-5 text-primary" />
          ) : (
            <FileVideo className="mr-2.5 size-5 text-accent" />
          )}
          <span className="text-sm text-muted-foreground">Revisar prueba</span>
        </div>
      </div>
    </article>
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
