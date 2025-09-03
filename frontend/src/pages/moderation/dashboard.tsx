import { useQuery } from "@tanstack/react-query"
import { getModerationStats } from "@/services/moderation"
import { AlertTriangle, CheckCircle2, EyeOff, Trash2, Timer } from "lucide-react"

export default function ModeratorDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["moderation-stats"],
    queryFn: () => getModerationStats(),
  })

  const cards = [
    { label: "Pending", value: stats?.pending_reports ?? 0, icon: AlertTriangle, color: "from-amber-400 to-orange-500" },
    { label: "Resolved", value: stats?.resolved_reports ?? 0, icon: CheckCircle2, color: "from-emerald-400 to-teal-500" },
    { label: "Hidden", value: stats?.content_hidden ?? 0, icon: EyeOff, color: "from-indigo-400 to-blue-500" },
    { label: "Deleted", value: stats?.content_deleted ?? 0, icon: Trash2, color: "from-rose-400 to-pink-500" },
  ]

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-8 text-white">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-1">Welcome, Moderator</h1>
          <p className="text-emerald-100">Keep the community safe and supportive.</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <div key={c.label} className="relative overflow-hidden rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200/60 p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">{c.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{c.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${c.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200/60 p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Timer className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-900">This week</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <Stat label="Actions" value={stats?.actions_this_week ?? 0} />
          <Stat label="Avg response (h)" value={stats?.average_response_time_hours ?? 0} />
          <Stat label="Warned" value={stats?.users_warned ?? 0} />
          <Stat label="Temp bans" value={stats?.users_banned_temp ?? 0} />
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 p-4 bg-white">
      <div className="text-2xl font-semibold text-slate-900">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  )
}
