import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-dvh">
      <Hero />
      <Features />
      <CTA />
    </div>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_700px_at_50%_-20%,oklch(0.98_0.02_160),transparent)]" />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 items-center gap-8 sm:gap-10 lg:grid-cols-2">
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              A safe, caring space for mental wellness
            </h1>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground">
              Sejiwa is an anonymous, moderated community to share, listen, and
              find support—without judgment.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="px-6">
                <Link to="/register">Join now</Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="px-6">
                <Link to="/login">Sign in</Link>
              </Button>
            </div>
            <p className="mt-3 text-xs sm:text-sm text-muted-foreground">
              Anonymous by default · Community guidelines · Active moderation
            </p>
          </div>

          <div className="relative z-0">
            <div className="relative rounded-2xl border bg-card/70 backdrop-blur shadow-xl p-6 sm:p-8">
              <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
              <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
              <div className="space-y-3">
                <div className="h-3 w-24 rounded-full bg-muted" />
                <div className="h-4 w-full rounded-md bg-muted" />
                <div className="h-4 w-5/6 rounded-md bg-muted" />
                <div className="h-4 w-4/6 rounded-md bg-muted" />
                <div className="pt-2 grid grid-cols-3 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-14 rounded-lg border bg-white/60" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Features() {
  const items = [
    {
      title: "Anonymous & safe",
      desc: "Use a unique username. Share only what you're comfortable with.",
    },
    {
      title: "Active moderation",
      desc: "Report harmful content. Our moderators keep the space healthy.",
    },
    {
      title: "Supportive topics",
      desc: "Discuss anxiety, depression, relationships, and more.",
    },
  ] as const

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
      <h2 className="text-xl sm:text-2xl font-semibold">Why Sejiwa?</h2>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.title}
            className="rounded-xl border bg-white/70 backdrop-blur-sm p-5 shadow"
          >
            <div className="text-base sm:text-lg font-semibold">
              {item.title}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function CTA() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-14 sm:pb-20">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 p-6 sm:p-8 text-white">
        <div className="relative z-10">
          <h3 className="text-lg sm:text-2xl font-semibold">
            Ready to talk—or just listen?
          </h3>
          <p className="text-blue-100 text-sm sm:text-base mt-1">
            Join our community and take the first step at your own pace.
          </p>
          <div className="mt-4">
            <Button asChild size="lg" className="bg-white text-slate-900 hover:bg-white/90">
              <Link to="/register">Create your anonymous account</Link>
            </Button>
          </div>
        </div>
        <div className="absolute -top-8 -right-6 h-48 w-48 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -bottom-10 -left-6 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
      </div>
    </section>
  )
}
