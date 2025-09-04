import { useQuery } from "@tanstack/react-query"
import { getModerationStats } from "@/services/moderation"
import { listCategories } from "@/services/categories"
import { getUsers } from "@/services/users"
import {
  Users,
  Shield,
  AlertTriangle,
  TrendingUp,
  Folder,
  Activity,
  UserPlus,
  Settings,
  BarChart3,
  Clock,
  CheckCircle,
  UserX,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function AdminDashboard() {
  const navigate = useNavigate()
  
  // Fetch various stats
  const { data: stats } = useQuery({
    queryKey: ["moderation-stats"],
    queryFn: () => getModerationStats(),
  })

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
  })

  const { data: allUsers } = useQuery({
    queryKey: ["dashboard-users-overview"],
    queryFn: () => getUsers({ page: 1, pageSize: 1 }), // Just get count
  })

  const { data: moderators } = useQuery({
    queryKey: ["dashboard-moderators-count"],
    queryFn: () => getUsers({ role: "moderator", page: 1, pageSize: 1 }),
  })

  const { data: suspendedUsers } = useQuery({
    queryKey: ["dashboard-suspended-count"],
    queryFn: () => getUsers({ status: "suspended", page: 1, pageSize: 1 }),
  })

  const quickStats = [
    {
      label: "Total Users",
      value: allUsers?.total ?? 0,
      icon: Users,
      color: "from-blue-400 to-blue-600",
      trend: "+8%",
      description: "All registered users",
    },
    {
      label: "Active Moderators",
      value: moderators?.total ?? 0,
      icon: Shield,
      color: "from-purple-400 to-purple-600",
      trend: "+2",
      description: "Managing community",
    },
    {
      label: "Suspended Users",
      value: suspendedUsers?.total ?? 0,
      icon: UserX,
      color: "from-red-400 to-red-600",
      trend: "-3%",
      description: "Currently banned",
    },
    {
      label: "Total Categories",
      value: categories?.length ?? 0,
      icon: Folder,
      color: "from-emerald-400 to-emerald-600",
      trend: "+1",
      description: "Discussion topics",
    },
  ]

  const moderationStats = [
    {
      label: "Pending Reports",
      value: stats?.pending_reports ?? 0,
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      label: "Resolved This Week",
      value: stats?.actions_this_week ?? 0,
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      label: "Avg Response Time",
      value: `${stats?.average_response_time_hours ?? 0}h`,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ]

  const recentActivity = [
    {
      action: "New moderator account created",
      detail: "john_moderator",
      time: "2 hours ago",
      type: "user",
      icon: UserPlus,
    },
    {
      action: "Category 'Tech Support' updated",
      detail: "Description and rules modified",
      time: "4 hours ago",
      type: "update",
      icon: Folder,
    },
    {
      action: "5 reports processed",
      detail: "3 dismissed, 2 actions taken",
      time: "6 hours ago",
      type: "moderation",
      icon: Shield,
    },
    {
      action: "User promoted to moderator",
      detail: "sarah_user → sarah_mod",
      time: "1 day ago",
      type: "promotion",
      icon: TrendingUp,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-6 sm:p-8 text-white">
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Admin Control Panel</h1>
          <p className="text-blue-100 text-base sm:text-lg">
            Monitor, manage, and maintain your community platform.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span>System Online</span>
            </div>
            <div>Last updated: {new Date().toLocaleTimeString()}</div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-24 -translate-x-24" />
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {quickStats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="group relative overflow-hidden rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200/60 p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => {
                if (stat.label === "Total Users") navigate("/admin/users")
                if (stat.label === "Active Moderators") navigate("/admin/users?tab=moderators")
                if (stat.label === "Total Categories") navigate("/admin/categories")
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-600 mb-1">
                    {stat.label}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                    {stat.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {stat.description}
                  </p>
                  <p className="text-sm text-emerald-600 font-medium mt-2">
                    {stat.trend}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}
                >
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          )
        })}
      </div>

      {/* Moderation Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {moderationStats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200/60 p-4 sm:p-6 shadow-lg"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${stat.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xl sm:text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Activity */}
        <div className="xl:col-span-2">
          <div className="rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200/60 p-4 sm:p-6 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
                  Recent Activity
                </h2>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium self-start sm:self-center">
                View all →
              </button>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {recentActivity.map((item, index) => {
                const Icon = item.icon
                return (
                  <div
                    key={index}
                    className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg hover:bg-slate-50/80 transition-colors border border-slate-100"
                  >
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        item.type === "user"
                          ? "bg-purple-100 text-purple-600"
                          : item.type === "update"
                          ? "bg-blue-100 text-blue-600"
                          : item.type === "moderation"
                          ? "bg-orange-100 text-orange-600"
                          : "bg-emerald-100 text-emerald-600"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-900 font-medium text-sm sm:text-base">{item.action}</p>
                      <p className="text-slate-600 text-xs sm:text-sm mt-1">{item.detail}</p>
                      <p className="text-slate-400 text-xs mt-1 sm:mt-2">{item.time}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Enhanced Quick Actions */}
        <div>
          <div className="rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200/60 p-4 sm:p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
                Quick Actions
              </h2>
            </div>
            <div className="space-y-3">
              <button
                className="w-full text-left p-3 sm:p-4 rounded-lg hover:bg-slate-50/80 transition-colors border border-slate-200/60 group"
                onClick={() => navigate("/admin/users")}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-slate-700 block text-sm sm:text-base">
                      Manage Users
                    </span>
                    <span className="text-xs text-slate-500">
                      View, ban, promote users
                    </span>
                  </div>
                </div>
              </button>
              
              <button
                className="w-full text-left p-4 rounded-lg hover:bg-slate-50/80 transition-colors border border-slate-200/60 group"
                onClick={() => navigate("/admin/users?tab=create-moderator")}
              >
                <div className="flex items-center gap-3">
                  <UserPlus className="w-5 h-5 text-slate-400 group-hover:text-purple-500 transition-colors" />
                  <div>
                    <span className="font-medium text-slate-700 block">
                      Add Moderator
                    </span>
                    <span className="text-xs text-slate-500">
                      Create new moderator account
                    </span>
                  </div>
                </div>
              </button>

              <button
                className="w-full text-left p-4 rounded-lg hover:bg-slate-50/80 transition-colors border border-slate-200/60 group"
                onClick={() => navigate("/admin/categories")}
              >
                <div className="flex items-center gap-3">
                  <Folder className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                  <div>
                    <span className="font-medium text-slate-700 block">
                      Manage Categories
                    </span>
                    <span className="text-xs text-slate-500">
                      Add or edit discussion topics
                    </span>
                  </div>
                </div>
              </button>

              <button
                className="w-full text-left p-4 rounded-lg hover:bg-slate-50/80 transition-colors border border-slate-200/60 group"
                onClick={() => navigate("/admin/analytics")}
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                  <div>
                    <span className="font-medium text-slate-700 block">
                      View Analytics
                    </span>
                    <span className="text-xs text-slate-500">
                      Platform usage statistics
                    </span>
                  </div>
                </div>
              </button>

              <button
                className="w-full text-left p-4 rounded-lg hover:bg-slate-50/80 transition-colors border border-slate-200/60 group"
                onClick={() => navigate("/admin/settings")}
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                  <div>
                    <span className="font-medium text-slate-700 block">
                      System Settings
                    </span>
                    <span className="text-xs text-slate-500">
                      Configure platform settings
                    </span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
