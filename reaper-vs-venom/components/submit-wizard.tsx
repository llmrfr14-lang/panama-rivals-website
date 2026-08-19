'use client'

import { useRef, useState, type DragEvent } from 'react'
import Link from 'next/link'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  FileVideo,
  Gamepad2,
  Monitor,
  Trophy,
  Upload,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type UploadedImage = { id: string; name: string; url: string; size: number }
type UploadedReplay = { id: string; name: string; size: number }
type ProofMethod = 'image' | 'replay' | null

const steps = [
  { id: 1, label: 'Match', hint: 'Teams & score' },
  { id: 2, label: 'Proof', hint: 'Image or replay' },
  { id: 3, label: 'Review', hint: 'Confirm & send' },
]

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function SubmitWizard() {
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)

  const [homeTeam, setHomeTeam] = useState('')
  const [awayTeam, setAwayTeam] = useState('')
  const [bestOf, setBestOf] = useState('5')
  const [matchDate, setMatchDate] = useState('')
  const [homeScore, setHomeScore] = useState('')
  const [awayScore, setAwayScore] = useState('')

  const [proofMethod, setProofMethod] = useState<ProofMethod>(null)
  const [images, setImages] = useState<UploadedImage[]>([])
  const [replays, setReplays] = useState<UploadedReplay[]>([])
  const [dragActive, setDragActive] = useState(false)

  const imageInputRef = useRef<HTMLInputElement>(null)
  const replayInputRef = useRef<HTMLInputElement>(null)

  function addImages(files: FileList | null) {
    if (!files) return
    const next = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .map((f) => ({
        id: `${f.name}-${f.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
        name: f.name,
        url: URL.createObjectURL(f),
        size: f.size,
      }))
    setImages((prev) => [...prev, ...next])
  }

  function addReplays(files: FileList | null) {
    if (!files) return
    const next = Array.from(files)
      .filter((f) => f.name.toLowerCase().endsWith('.replay'))
      .map((f) => ({
        id: `${f.name}-${f.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
        name: f.name,
        size: f.size,
      }))
    setReplays((prev) => [...prev, ...next])
  }

  function removeImage(id: string) {
    setImages((prev) => {
      const target = prev.find((i) => i.id === id)
      if (target) URL.revokeObjectURL(target.url)
      return prev.filter((i) => i.id !== id)
    })
  }

  function handleImageDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragActive(false)
    addImages(e.dataTransfer.files)
  }

  function chooseMethod(method: Exclude<ProofMethod, null>) {
    setProofMethod(method)
    // Clear the other method's files so only one proof type is submitted.
    if (method === 'image') {
      setReplays([])
    } else {
      images.forEach((i) => URL.revokeObjectURL(i.url))
      setImages([])
    }
  }

  function resetForm() {
    setSubmitted(false)
    setStep(1)
    setHomeTeam('')
    setAwayTeam('')
    setHomeScore('')
    setAwayScore('')
    setProofMethod(null)
    images.forEach((i) => URL.revokeObjectURL(i.url))
    setImages([])
    setReplays([])
  }

  const teamName = (name: string) => name || '—'
  const teamsMatch =
    homeTeam.trim() && awayTeam.trim() &&
    homeTeam.trim().toLowerCase() === awayTeam.trim().toLowerCase()

  const proofReady =
    (proofMethod === 'image' && images.length > 0) ||
    (proofMethod === 'replay' && replays.length > 0)

  const canContinue: Record<number, boolean> = {
    1: Boolean(
      homeTeam.trim() &&
      awayTeam.trim() &&
      !teamsMatch &&
      homeScore !== '' &&
      awayScore !== '',
    ),
    2: proofReady,
    3: true,
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-8 text-center">
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-primary/15 text-primary">
          <CircleCheck className="size-9" />
        </div>
        <h2 className="font-display text-2xl font-bold">Result submitted</h2>
        <p className="mx-auto mt-2 max-w-sm text-pretty text-muted-foreground">
          Your report for {teamName(homeTeam)} vs {teamName(awayTeam)} is now pending admin
          verification. You&apos;ll be notified once it&apos;s confirmed.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button size="lg" nativeButton={false} render={<Link href="/standings" />}>
            View Standings
          </Button>
          <Button size="lg" variant="outline" onClick={resetForm}>
            Submit Another
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Stepper */}
      <ol className="mb-8 flex items-center gap-2">
        {steps.map((s, i) => {
          const active = step === s.id
          const done = step > s.id
          return (
            <li key={s.id} className="flex flex-1 items-center gap-2">
              <div className="flex min-w-0 flex-col items-start gap-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors',
                      done && 'border-primary bg-primary text-primary-foreground',
                      active && 'border-primary bg-primary/15 text-primary',
                      !active && !done && 'border-border bg-card text-muted-foreground',
                    )}
                  >
                    {done ? <Check className="size-3.5" /> : s.id}
                  </span>
                  <span
                    className={cn(
                      'hidden text-sm font-medium sm:block',
                      active ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {s.label}
                  </span>
                </div>
              </div>
              {i < steps.length - 1 && (
                <span
                  className={cn(
                    'h-px flex-1 transition-colors',
                    step > s.id ? 'bg-primary' : 'bg-border',
                  )}
                  aria-hidden
                />
              )}
            </li>
          )
        })}
      </ol>

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        {/* Step 1: Match — teams + score together */}
        {step === 1 && (
          <div className="flex flex-col gap-6">
            <StepHeading
              title="Which match are you reporting?"
              desc="Enter both team names, the series format, and the final score."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Home team">
                <TeamInput value={homeTeam} onChange={setHomeTeam} placeholder="Home team name" />
              </Field>
              <Field label="Away team">
                <TeamInput value={awayTeam} onChange={setAwayTeam} placeholder="Away team name" />
              </Field>
            </div>
            {teamsMatch && (
              <p className="text-sm text-destructive">Home and away teams must be different.</p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Series format">
                <select
                  value={bestOf}
                  onChange={(e) => setBestOf(e.target.value)}
                  className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
                >
                  <option value="3">Best of 3</option>
                  <option value="5">Best of 5</option>
                  <option value="7">Best of 7</option>
                </select>
              </Field>
              <Field label="Match date">
                <input
                  type="date"
                  value={matchDate}
                  onChange={(e) => setMatchDate(e.target.value)}
                  className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
                />
              </Field>
            </div>

            <div className="rounded-xl border border-border bg-background p-5">
              <p className="mb-4 text-sm font-medium text-muted-foreground">Final score</p>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                <ScoreInput label={teamName(homeTeam)} value={homeScore} onChange={setHomeScore} />
                <span className="pt-6 font-display text-2xl font-bold text-muted-foreground">–</span>
                <ScoreInput label={teamName(awayTeam)} value={awayScore} onChange={setAwayScore} />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Proof — choose image OR replay */}
        {step === 2 && (
          <div className="flex flex-col gap-6">
            <StepHeading
              title="How do you want to prove the result?"
              desc="Choose one method. Console players can upload a screenshot; PC players can upload a replay. Either one is enough."
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <MethodCard
                active={proofMethod === 'image'}
                icon={Gamepad2}
                title="Endgame screenshot"
                desc="Best for console players — a clear photo of the scoreboard."
                onClick={() => chooseMethod('image')}
              />
              <MethodCard
                active={proofMethod === 'replay'}
                icon={Monitor}
                title="Replay file"
                desc="For PC players — upload the .replay file from your game."
                onClick={() => chooseMethod('replay')}
              />
            </div>

            {proofMethod === 'image' && (
              <div className="flex flex-col gap-4">
                <div
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragActive(true)
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleImageDrop}
                  onClick={() => imageInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') imageInputRef.current?.click()
                  }}
                  className={cn(
                    'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-colors',
                    dragActive
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-background hover:border-primary/60 hover:bg-muted/40',
                  )}
                >
                  <span className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Upload className="size-6" />
                  </span>
                  <div>
                    <p className="font-medium">Drag &amp; drop screenshots here</p>
                    <p className="text-sm text-muted-foreground">or click to browse — PNG or JPG</p>
                  </div>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => addImages(e.target.files)}
                  />
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {images.map((img) => (
                      <div
                        key={img.id}
                        className="group relative overflow-hidden rounded-lg border border-border bg-background"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.url || '/placeholder.svg'}
                          alt={img.name}
                          className="aspect-video w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeImage(img.id)
                          }}
                          className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
                          aria-label={`Remove ${img.name}`}
                        >
                          <X className="size-3.5" />
                        </button>
                        <p className="truncate px-2 py-1.5 text-xs text-muted-foreground">
                          {img.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {proofMethod === 'replay' && (
              <div className="flex flex-col gap-4">
                <div
                  onClick={() => replayInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') replayInputRef.current?.click()
                  }}
                  className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-background p-10 text-center transition-colors hover:border-accent/60 hover:bg-muted/40"
                >
                  <span className="flex size-12 items-center justify-center rounded-full bg-accent/15 text-accent">
                    <FileVideo className="size-6" />
                  </span>
                  <div>
                    <p className="font-medium">Add .replay files</p>
                    <p className="text-sm text-muted-foreground">click to browse your files</p>
                  </div>
                  <input
                    ref={replayInputRef}
                    type="file"
                    accept=".replay"
                    multiple
                    className="hidden"
                    onChange={(e) => addReplays(e.target.files)}
                  />
                </div>

                {replays.length > 0 && (
                  <ul className="flex flex-col gap-2">
                    {replays.map((r) => (
                      <li
                        key={r.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2.5"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <FileVideo className="size-4 shrink-0 text-accent" />
                          <span className="truncate text-sm">{r.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">{formatSize(r.size)}</span>
                          <button
                            type="button"
                            onClick={() => setReplays((prev) => prev.filter((x) => x.id !== r.id))}
                            className="text-muted-foreground transition-colors hover:text-foreground"
                            aria-label={`Remove ${r.name}`}
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="flex flex-col gap-6">
            <StepHeading
              title="Review your submission"
              desc="Double-check everything looks right before sending it to the admins."
            />
            <div className="grid gap-3 rounded-xl border border-border bg-background p-5">
              <div className="flex items-center justify-center gap-4 pb-3">
                <span className="font-display text-lg font-bold">{teamName(homeTeam)}</span>
                <span className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1 font-display text-xl font-bold tabular-nums">
                  {homeScore || 0} <span className="text-sm text-muted-foreground">–</span>{' '}
                  {awayScore || 0}
                </span>
                <span className="font-display text-lg font-bold">{teamName(awayTeam)}</span>
              </div>
              <ReviewRow label="Series" value={`Best of ${bestOf}`} />
              <ReviewRow label="Date" value={matchDate || 'Not set'} />
              <ReviewRow
                label="Proof"
                value={
                  proofMethod === 'image'
                    ? `${images.length} screenshot${images.length === 1 ? '' : 's'}`
                    : `${replays.length} replay file${replays.length === 1 ? '' : 's'}`
                }
              />
            </div>
            {proofMethod === 'image' && images.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img) => (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    key={img.id}
                    src={img.url || '/placeholder.svg'}
                    alt={img.name}
                    className="h-20 w-32 shrink-0 rounded-md border border-border object-cover"
                  />
                ))}
              </div>
            )}
            {proofMethod === 'replay' && replays.length > 0 && (
              <ul className="flex flex-col gap-2">
                {replays.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center gap-2.5 rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                  >
                    <FileVideo className="size-4 shrink-0 text-accent" />
                    <span className="truncate">{r.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Nav */}
        <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
          <Button
            variant="ghost"
            size="lg"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
          >
            <ChevronLeft className="size-4" /> Back
          </Button>

          {step < 3 ? (
            <Button size="lg" onClick={() => setStep((s) => s + 1)} disabled={!canContinue[step]}>
              Continue <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button size="lg" onClick={() => setSubmitted(true)}>
              <Trophy className="size-4" /> Submit Result
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function MethodCard({
  active,
  icon: Icon,
  title,
  desc,
  onClick,
}: {
  active: boolean
  icon: React.ComponentType<{ className?: string }>
  title: string
  desc: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex flex-col items-start gap-3 rounded-xl border-2 p-5 text-left transition-colors',
        active
          ? 'border-primary bg-primary/10'
          : 'border-border bg-background hover:border-primary/50 hover:bg-muted/40',
      )}
    >
      <span
        className={cn(
          'flex size-10 items-center justify-center rounded-lg transition-colors',
          active ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground',
        )}
      >
        <Icon className="size-5" />
      </span>
      <div>
        <p className="font-display font-semibold">{title}</p>
        <p className="mt-1 text-sm text-pretty text-muted-foreground">{desc}</p>
      </div>
      {active && (
        <span className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-primary">
          <Check className="size-3.5" /> Selected
        </span>
      )}
    </button>
  )
}

function StepHeading({ title, desc }: { title: string; desc: string }) {
  return (
    <div>
      <h2 className="font-display text-xl font-bold text-balance">{title}</h2>
      <p className="mt-1 text-pretty text-muted-foreground">{desc}</p>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}

function TeamInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
    />
  )
}

function ScoreInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <label className="flex flex-col items-center gap-2">
      <span className="max-w-full truncate text-sm font-medium text-muted-foreground">{label}</span>
      <input
        type="number"
        min={0}
        max={7}
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className="h-20 w-full rounded-xl border border-input bg-background text-center font-display text-4xl font-bold tabular-nums outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
      />
    </label>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-t border-border/60 pt-2 text-sm first:border-0 first:pt-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
