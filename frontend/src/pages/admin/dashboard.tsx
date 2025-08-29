import { useQuery } from "@tanstack/react-query"
import { getModerationStats } from "@/services/moderation"
import { listCategories } from "@/services/categories"
import {
  Users,
  MessageSquare,
  Shield,
  AlertTriangle,
  TrendingUp,
  Folder,
  Activity,
} from "lucide-react"

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["moderation-stats"],
    queryFn: () => getModerationStats(),
  })

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
  })

  const quickStats = [
    {
      label: "Total Reports",
      value: stats?.total_reports ?? 0,
      icon: AlertTriangle,
      color: "from-orange-400 to-red-500",
      trend: "+12%",
    },
    {
      label: "Pending Reports",
      value: stats?.pending_reports ?? 0,
      icon: MessageSquare,
      color: "from-blue-400 to-indigo-500",
      trend: "-5%",
    },
    {
      label: "Active Categories",
      value: categories?.length ?? 0,
      icon: Folder,
      color: "from-emerald-400 to-teal-500",
      trend: "+2",
    },
    {
      label: "Actions This Week",
      value: stats?.actions_this_week ?? 0,
      icon: TrendingUp,
      color: "from-violet-400 to-purple-500",
      trend: "+18%",
    },
  ]

  const recentActivity = [
    {
      action: "Category 'General Discussion' created",
      time: "2 hours ago",
      type: "create",
    },
    { action: "User report resolved", time: "4 hours ago", type: "resolve" },
    { action: "Moderator 'jane_mod' added", time: "1 day ago", type: "user" },
    { action: "Content policy updated", time: "2 days ago", type: "update" },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-8 text-white">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome back, Admin</h1>
          <p className="text-blue-100 text-lg">
            Here's what's happening with your community today.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-24 -translate-x-24" />
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="relative overflow-hidden rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200/60 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {stat.value.toLocaleString()}
                  </p>
                  <p className="text-sm text-emerald-600 font-medium mt-1">
                    {stat.trend}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center shadow-lg`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-50/30 opacity-0 hover:opacity-100 transition-opacity duration-300" />
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200/60 p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">
                Recent Activity
              </h2>
            </div>
            <div className="space-y-4">
              {recentActivity.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50/80 transition-colors"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      item.type === "create"
                        ? "bg-emerald-500"
                        : item.type === "resolve"
                        ? "bg-blue-500"
                        : item.type === "user"
                        ? "bg-purple-500"
                        : "bg-orange-500"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-slate-900 font-medium">{item.action}</p>
                    <p className="text-slate-500 text-sm">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200/60 p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">
                Quick Actions
              </h2>
            </div>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg hover:bg-slate-50/80 transition-colors border border-slate-200/60">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-slate-400" />
                  <span className="font-medium text-slate-700">
                    Create Moderator
                  </span>
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-slate-50/80 transition-colors border border-slate-200/60">
                <div className="flex items-center gap-3">
                  <Folder className="w-5 h-5 text-slate-400" />
                  <span className="font-medium text-slate-700">
                    Add Category
                  </span>
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-slate-50/80 transition-colors border border-slate-200/60">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-slate-400" />
                  <span className="font-medium text-slate-700">
                    Review Reports
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
