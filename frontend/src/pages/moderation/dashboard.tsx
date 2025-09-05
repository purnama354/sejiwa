import { useQuery } from "@tanstack/react-query"
import { getModerationStats, getReports } from "@/services/moderation"
import { useNavigate } from "react-router-dom"
import {
  AlertTriangle,
  CheckCircle2,
  EyeOff,
  Activity,
  Shield,
  FileText,
  Clock,
  Users,
  TrendingUp,
  MessageSquare,
  ArrowRight,
  AlertCircle,
} from "lucide-react"

export default function ModeratorDashboard() {
  const navigate = useNavigate()
  
  const { data: stats } = useQuery({
    queryKey: ["moderation-stats"],
    queryFn: () => getModerationStats(),
  })

  const { data: recentReports } = useQuery({
    queryKey: ["recent-reports-dashboard"],
    queryFn: () => getReports({ page: 1, pageSize: 5, status: "pending" }),
  })

  const cards = [
    {
      label: "Pending Reports",
      value: stats?.pending_reports ?? 0,
      icon: AlertTriangle,
      color: "from-amber-400 to-orange-500",
      urgent: (stats?.pending_reports ?? 0) > 5,
      description: "Requiring attention",
      action: () => navigate("/moderation/reports"),
    },
    {
      label: "Resolved Today",
      value: Math.floor((stats?.actions_this_week ?? 0) / 7),
      icon: CheckCircle2,
      color: "from-emerald-400 to-teal-500",
      urgent: false,
      description: "Actions completed",
      action: () => navigate("/moderation/reports?status=resolved"),
    },
    {
      label: "Content Hidden",
      value: stats?.content_hidden ?? 0,
      icon: EyeOff,
      color: "from-indigo-400 to-blue-500",
      urgent: false,
      description: "This month",
      action: () => navigate("/moderation/actions"),
    },
    {
      label: "Users Warned",
      value: stats?.users_warned ?? 0,
      icon: MessageSquare,
      color: "from-purple-400 to-violet-500",
      urgent: false,
      description: "Total warnings",
      action: () => navigate("/moderation/actions"),
    },
  ]

  const priorities = [
    {
      label: "High Priority",
      count: recentReports?.reports?.filter(r => r.priority === "high").length ?? 0,
      color: "bg-red-100 text-red-700 border-red-200",
    },
    {
      label: "Medium Priority",
      count: recentReports?.reports?.filter(r => r.priority === "medium").length ?? 0,
      color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    },
    {
      label: "Low Priority",
      count: recentReports?.reports?.filter(r => r.priority === "low").length ?? 0,
      color: "bg-green-100 text-green-700 border-green-200",
    },
  ]

  const quickActions = [
    {
      label: "Review Reports",
      description: "Check pending content reports",
      icon: FileText,
      action: () => navigate("/moderation/reports"),
      count: stats?.pending_reports ?? 0,
      urgent: (stats?.pending_reports ?? 0) > 0,
    },
    {
      label: "View Recent Actions",
      description: "See your moderation history",
      icon: Activity,
      action: () => navigate("/moderation/actions"),
      count: stats?.actions_this_week ?? 0,
      urgent: false,
    },
    {
      label: "User Management",
      description: "Ban/unban users",
      icon: Users,
      action: () => navigate("/moderation/users"),
      count: stats?.users_banned_temp ?? 0,
      urgent: false,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-6 sm:p-8 text-white">
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Moderation Center</h1>
          <p className="text-emerald-100 text-base sm:text-lg">
            Keep the community safe, supportive, and thriving.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse" />
              <span>Active Session</span>
            </div>
            <div>Response Time: {stats?.average_response_time_hours ?? 0}h avg</div>
            <div>Total Actions: {stats?.actions_this_month ?? 0} this month</div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-24 -translate-x-24" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="group relative overflow-hidden rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200/60 p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={card.action}
            >
              {card.urgent && (
                <div className="absolute top-2 right-2">
                  <AlertCircle className="w-4 h-4 text-red-500 animate-pulse" />
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-600 mb-1">
                    {card.label}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                    {card.value}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {card.description}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-r ${card.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}
                >
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          )
        })}
      </div>

      {/* Priority Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {priorities.map((priority) => (
          <div
            key={priority.label}
            className={`rounded-xl border p-4 ${priority.color}`}
          >
            <div className="text-xl sm:text-2xl font-bold mb-1">{priority.count}</div>
            <div className="text-sm font-medium">{priority.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Reports Preview */}
        <div className="xl:col-span-2">
          <div className="rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200/60 p-4 sm:p-6 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
                  Recent Reports
                </h2>
              </div>
              <button 
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 self-start sm:self-center"
                onClick={() => navigate("/moderation/reports")}
              >
                View all <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            {recentReports?.reports && recentReports.reports.length > 0 ? (
              <div className="space-y-3">
                {recentReports.reports.slice(0, 4).map((report) => (
                  <div
                    key={report.id}
                    className="flex items-start gap-4 p-4 rounded-lg border border-slate-200 hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => navigate(`/moderation/reports/${report.id}`)}
                  >
                    <div className={`w-3 h-3 rounded-full mt-2 ${
                      report.priority === "high" ? "bg-red-500" :
                      report.priority === "medium" ? "bg-yellow-500" : "bg-green-500"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        {report.reason.replace(/_/g, " ").toUpperCase()}
                      </p>
                      <p className="text-sm text-slate-600 truncate mt-1">
                        {report.content_preview}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span>By: {report.reported_user.username}</span>
                        <span>Reporter: {report.reporter.username}</span>
                        <span>{new Date(report.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No pending reports</p>
                <p className="text-sm">Great job keeping the community clean!</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Performance */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200/60 p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">
                Quick Actions
              </h2>
            </div>
            <div className="space-y-3">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <button
                    key={action.label}
                    className="w-full text-left p-4 rounded-lg hover:bg-slate-50/80 transition-colors border border-slate-200/60 group"
                    onClick={action.action}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 transition-colors ${
                          action.urgent ? "text-red-500" : "text-slate-400 group-hover:text-blue-500"
                        }`} />
                        <div>
                          <span className="font-medium text-slate-700 block">
                            {action.label}
                          </span>
                          <span className="text-xs text-slate-500">
                            {action.description}
                          </span>
                        </div>
                      </div>
                      {action.count > 0 && (
                        <div className={`px-2 py-1 text-xs rounded-full ${
                          action.urgent ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"
                        }`}>
                          {action.count}
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Performance Stats */}
          <div className="rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200/60 p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">
                This Week
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Stat label="Actions" value={stats?.actions_this_week ?? 0} icon={Activity} />
              <Stat 
                label="Response Time" 
                value={`${stats?.average_response_time_hours ?? 0}h`} 
                icon={Clock}
                isTime
              />
              <Stat label="Warnings" value={stats?.users_warned ?? 0} icon={MessageSquare} />
              <Stat label="Temp Bans" value={stats?.users_banned_temp ?? 0} icon={Users} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ 
  label, 
  value, 
  icon: Icon, 
  isTime = false 
}: { 
  label: string
  value: number | string
  icon: React.ComponentType<{ className?: string }>
  isTime?: boolean 
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-3 bg-white/50 hover:bg-white/70 transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-slate-500" />
        <div className="text-xs text-slate-500 font-medium">{label}</div>
      </div>
      <div className={`text-xl font-bold ${isTime ? "text-blue-600" : "text-slate-900"}`}>
        {value}
      </div>
    </div>
  )
}
