import Link from 'next/link'
import Image from 'next/image'
import { ListChecks, ShieldCheck, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/site-header'
import { StandingsTable } from '@/components/standings-table'
import { RecentResults } from '@/components/recent-results'

const steps = [
  {
    icon: ListChecks,
    title: 'Pick the match',
    desc: 'Select both teams, the series format, and the final score.',
  },
  {
    icon: Upload,
    title: 'Add your proof',
    desc: 'Console? Upload an endgame screenshot. PC? Drop a replay file. Either one works.',
  },
  {
    icon: ShieldCheck,
    title: 'Submit for review',
    desc: 'Confirm the details and send it in — admins verify before it hits the table.',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <Image src="/arena-hero.png" alt="" fill priority className="object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/40" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-24 sm:px-6 sm:py-28 lg:grid-cols-[1fr_auto]">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <span className="size-1.5 rounded-full bg-primary" /> Season 4 · Now Live
            </span>
            <h1 className="mt-5 font-display text-5xl font-bold tracking-tight text-balance sm:text-6xl">
              Report your PanamaRivals results in{' '}
              <span className="text-primary">three simple steps</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-pretty text-muted-foreground">
              The official hub for the PanamaRivals Rocket League league. Console or PC — submit a
              screenshot or a replay, and let the standings take care of themselves.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" nativeButton={false} render={<Link href="/submit" />}>
                <Upload className="size-4" /> Submit a Result
              </Button>
              <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/standings" />}>
                View Standings
              </Button>
            </div>
          </div>
          <div className="hidden justify-self-center lg:block">
            <Image
              src="/panamarivals-logo.png"
              alt="PanamaRivals league logo"
              width={340}
              height={340}
              priority
              className="size-72 rounded-2xl object-cover shadow-2xl shadow-primary/20 ring-1 ring-border xl:size-80"
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-10 flex flex-col gap-2">
          <h2 className="font-display text-3xl font-bold tracking-tight">How submitting works</h2>
          <p className="text-muted-foreground">
            A guided flow that makes proof-of-result quick and unmistakable.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="relative flex flex-col gap-3 rounded-xl border border-border bg-card p-5"
            >
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <s.icon className="size-5" />
              </span>
              <span className="absolute right-4 top-4 font-display text-sm font-bold text-muted-foreground/50">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="font-display text-lg font-semibold">{s.title}</h3>
              <p className="text-sm text-pretty text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Standings + Results */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col gap-4">
            <div className="flex items-end justify-between">
              <h2 className="font-display text-2xl font-bold tracking-tight">League Standings</h2>
              <Button variant="link" size="lg" nativeButton={false} render={<Link href="/standings" />}>
                Full table
              </Button>
            </div>
            <StandingsTable />
          </div>
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-2xl font-bold tracking-tight">Recent Results</h2>
            <RecentResults />
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <p>PanamaRivals Rocket League League</p>
          <p>Built for the community · Season 4</p>
        </div>
      </footer>
    </div>
  )
}
