import { SiteHeader } from '@/components/site-header'
import { SubmitWizard } from '@/components/submit-wizard'

export default function SubmitPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-10 text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight text-balance">
            Report a Match Result
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-pretty text-muted-foreground">
            Enter the match, then prove it with an endgame screenshot or a replay file — whichever
            works for your platform. Reports are verified by admins before appearing in the
            standings.
          </p>
        </div>
        <SubmitWizard />
      </main>
    </div>
  )
}
