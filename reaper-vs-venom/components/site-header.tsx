import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/panamarivals-logo.png"
            alt="PanamaRivals"
            width={40}
            height={40}
            className="size-9 rounded-lg object-cover"
            priority
          />
          <span className="font-display text-lg font-bold tracking-tight">
            PANAMA<span className="text-primary">RIVALS</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex" aria-label="Main">
          <Button variant="ghost" size="lg" nativeButton={false} render={<Link href="/" />}>
            Home
          </Button>
          <Button variant="ghost" size="lg" nativeButton={false} render={<Link href="/standings" />}>
            Standings
          </Button>
          <Button variant="ghost" size="lg" nativeButton={false} render={<Link href="/submit" />}>
            Submit
          </Button>
        </nav>

        <Button size="lg" nativeButton={false} render={<Link href="/submit" />}>
          Report a Result
        </Button>
      </div>
    </header>
  )
}
