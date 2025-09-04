export default function DashboardPage() {
  return (
    <div className="p-4 sm:p-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 p-6 sm:p-8 text-white">
        <div className="relative z-10">
          <h1 className="text-xl sm:text-2xl font-bold">Welcome to Sejiwa</h1>
          <p className="text-blue-100 text-sm sm:text-base">
            A safe, supportive space for open conversation.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        <Card
          title="Start a thread"
          desc="Share your experience or ask a question."
        />
        <Card
          title="Explore topics"
          desc="Browse categories that matter to you."
        />
        <Card
          title="Report safely"
          desc="See something harmful? Let us know."
        />
      </div>
    </div>
  )
}

function Card({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200/60 p-5 shadow">
      <div className="font-semibold text-slate-900">{title}</div>
      <div className="text-sm text-slate-600">{desc}</div>
    </div>
  )
}
