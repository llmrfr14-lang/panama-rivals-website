import { AdminReviewPanel } from '@/components/admin-review'
import { SiteHeader } from '@/components/site-header'

export default function AdminPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-10">
          <h1 className="font-display text-4xl font-bold tracking-tight text-balance">
            Moderator Review Queue
          </h1>
          <p className="mt-2 max-w-2xl text-pretty text-muted-foreground">
            Review pending match reports, inspect their proof, and approve or reject results.
            This interface is ready to connect to a protected admin route and persistent storage.
          </p>
        </div>
        <AdminReviewPanel />
      </main>
    </div>
  )
}
