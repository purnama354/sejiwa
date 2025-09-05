import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import { listCategories } from "@/services/categories"

export default function HomePage() {
  return (
    <div className="min-h-dvh">
      <Hero />
      <Features />
      <HowItWorks />
      <Guidelines />
      <ExploreCategories />
      <ReadWithoutAccount />
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
  const {
    data: categories,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
  })

  // Fallback static data for demo/offline scenarios
  const fallbackCategories = [
    {
      id: "1",
      name: "Anxiety",
      description: "Coping tools, daily management, support.",
      thread_count: 24,
      slug: "anxiety",
    },
    {
      id: "2",
      name: "Depression",
      description: "You're not alone—share and learn.",
      thread_count: 18,
      slug: "depression",
    },
    {
      id: "3",
      name: "Relationships",
      description: "Communication, boundaries, healing.",
      thread_count: 31,
      slug: "relationships",
    },
    {
      id: "4",
      name: "Work & Burnout",
      description: "Stress, balance, and recovery.",
      thread_count: 12,
      slug: "work-burnout",
    },
    {
      id: "5",
      name: "Self-esteem",
      description: "Growth, self-talk, self-care.",
      thread_count: 15,
      slug: "self-esteem",
    },
    {
      id: "6",
      name: "Grief",
      description: "Space to process and remember.",
      thread_count: 8,
      slug: "grief",
    },
  ]

  const displayCategories = categories || fallbackCategories

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

      {isLoading ? (
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border bg-white/70 backdrop-blur-sm p-5 shadow animate-pulse"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="h-5 bg-slate-200 rounded w-20"></div>
                <div className="h-4 bg-slate-200 rounded-full w-12"></div>
              </div>
              <div className="h-4 bg-slate-200 rounded w-full mb-4"></div>
              <div className="h-8 bg-slate-200 rounded w-24"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="mt-5 text-center py-8">
          <p className="text-muted-foreground">
            Unable to load categories. Using demo data.
          </p>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayCategories.slice(0, 6).map((c) => (
            <div
              key={c.id || c.name}
              className="group rounded-xl border bg-white/70 backdrop-blur-sm p-5 shadow hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold text-slate-900">{c.name}</div>
                <span className="text-xs rounded-full px-2 py-1 bg-secondary text-secondary-foreground">
                  {c.thread_count || 0} threads
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {c.description}
              </p>
              <div className="mt-4 flex gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link to="/login">View threads</Link>
                </Button>
                <Button asChild size="sm" variant="ghost">
                  <Link to={`/preview/${c.slug || c.name.toLowerCase()}`}>
                    Preview
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function ReadWithoutAccount() {
  const sampleThreads = [
    {
      id: "1",
      title: "Starting my anxiety recovery journey",
      excerpt:
        "After years of struggling, I'm finally ready to take the first step...",
      category: "Anxiety",
      replies: 12,
      timeAgo: "2h ago",
    },
    {
      id: "2",
      title: "Finding hope after a difficult breakup",
      excerpt: "It's been 3 months and I'm slowly learning to trust again...",
      category: "Relationships",
      replies: 8,
      timeAgo: "4h ago",
    },
    {
      id: "3",
      title: "Burnout recovery: my 6-month progress",
      excerpt: "Sharing what's helped me rebuild my energy and motivation...",
      category: "Work & Burnout",
      replies: 15,
      timeAgo: "1d ago",
    },
  ]

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
      <div className="rounded-2xl border bg-gradient-to-br from-slate-50 to-blue-50/30 p-6 sm:p-8">
        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold">
            Get a feel for our community
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Read some recent threads to see how people support each other here.
          </p>
        </div>

        <div className="space-y-4">
          {sampleThreads.map((thread) => (
            <div
              key={thread.id}
              className="rounded-xl border bg-white/80 backdrop-blur-sm p-4 sm:p-5 shadow hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs rounded-full px-2 py-1 bg-blue-100 text-blue-700 font-medium">
                      {thread.category}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {thread.timeAgo}
                    </span>
                  </div>
                  <h3 className="font-medium text-slate-900 group-hover:text-blue-700 transition-colors">
                    {thread.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {thread.excerpt}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span>{thread.replies} supportive replies</span>
                    <span>•</span>
                    <span>Anonymous community</span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground mb-4">
            Want to join the conversation? Create your anonymous account to
            participate.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link to="/register">Join the community</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/login">Already have an account?</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
