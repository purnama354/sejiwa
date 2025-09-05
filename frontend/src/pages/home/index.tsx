import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-dvh">
      <Hero />
      <Features />
      <HowItWorks />
      <Guidelines />
      <ExploreCategories />
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
                    <div
                      key={i}
                      className="h-14 rounded-lg border bg-white/60"
                    />
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
            <Button
              asChild
              size="lg"
              className="bg-white text-slate-900 hover:bg-white/90"
            >
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

function HowItWorks() {
  const steps = [
    {
      title: "Create an anonymous account",
      desc: "Pick a username—no email or personal info required.",
    },
    {
      title: "Join a topic",
      desc: "Browse categories and follow what matters to you.",
    },
    {
      title: "Share or listen",
      desc: "Start a thread, reply, or read quietly at your pace.",
    },
    {
      title: "Stay safe",
      desc: "Report harmful content and our moderators will step in.",
    },
  ] as const

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
      <h2 className="text-xl sm:text-2xl font-semibold">How it works</h2>
      <ol className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((s, i) => (
          <li
            key={s.title}
            className="rounded-xl border bg-white/70 backdrop-blur-sm p-5 shadow"
          >
            <div className="text-xs text-muted-foreground">Step {i + 1}</div>
            <div className="mt-1 font-semibold text-slate-900">{s.title}</div>
            <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

function Guidelines() {
  const rules = [
    {
      title: "Be respectful",
      desc: "No harassment, hate, or shaming—ever.",
    },
    {
      title: "Protect privacy",
      desc: "Do not share personal info; keep things anonymous.",
    },
    {
      title: "Support, not advice",
      desc: "Share experiences and resources, not diagnoses.",
    },
    {
      title: "Report concerns",
      desc: "Use the report feature to flag harmful content.",
    },
  ] as const

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
      <div className="rounded-2xl border bg-card/70 backdrop-blur shadow-xl p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-semibold">
          Community guidelines
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">
          Sejiwa is a supportive place. These basics help keep everyone safe.
        </p>
        <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {rules.map((r) => (
            <li key={r.title} className="rounded-xl border bg-white/60 p-5">
              <div className="font-medium text-slate-900">{r.title}</div>
              <p className="text-sm text-muted-foreground mt-1">{r.desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function ExploreCategories() {
  // Static first; can be replaced with API via listCategories() + react-query
  const categories = [
    { name: "Anxiety", desc: "Coping tools, daily management, support." },
    { name: "Depression", desc: "You're not alone—share and learn." },
    { name: "Relationships", desc: "Communication, boundaries, healing." },
    { name: "Work & Burnout", desc: "Stress, balance, and recovery." },
    { name: "Self-esteem", desc: "Growth, self-talk, self-care." },
    { name: "Grief", desc: "Space to process and remember." },
  ] as const

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold">
            Explore categories
          </h2>
          <p className="text-sm text-muted-foreground">
            Pick a topic to start reading or sharing.
          </p>
        </div>
        <Button asChild variant="link" className="hidden sm:inline-flex">
          <Link to="/register">Create an account</Link>
        </Button>
      </div>
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <div
            key={c.name}
            className="group rounded-xl border bg-white/70 backdrop-blur-sm p-5 shadow hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="font-semibold text-slate-900">{c.name}</div>
              <span className="text-xs rounded-full px-2 py-1 bg-secondary text-secondary-foreground">
                Public
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{c.desc}</p>
            <div className="mt-4">
              <Button asChild size="sm" variant="outline">
                <Link to="/login">View threads</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
