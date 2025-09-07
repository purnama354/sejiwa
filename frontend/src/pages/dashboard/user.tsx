import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import {
  MessageSquare,
  Plus,
  TrendingUp,
  BookOpen,
  ArrowRight,
  Settings,
  Bell,
  Bookmark,
  MessageCircle,
  Eye,
  ListFilter,
  BarChart2,
  Sparkles,
  Shield,
  CheckCircle2,
  Leaf,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  getUserStats,
  getUserActivity,
  getUserCategories,
} from "@/services/user"

export default function UserDashboard() {
  const navigate = useNavigate()

  const { data: stats } = useQuery({
    queryKey: ["user-stats"],
    queryFn: getUserStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const { data: activity } = useQuery({
    queryKey: ["user-activity"],
    queryFn: getUserActivity,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  const { data: categories } = useQuery({
    queryKey: ["user-categories"],
    queryFn: getUserCategories,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })

  const quickActions = [
    {
      label: "Start a thread",
      description: "Share your experience or ask for support",
      icon: Plus,
      action: () => navigate("/threads/new"),
      color: "from-blue-500 to-indigo-600",
    },
    {
      label: "Browse categories",
      description: "Explore topics that matter to you",
      icon: BookOpen,
      action: () => navigate("/categories"),
      color: "from-emerald-500 to-teal-600",
    },
    {
      label: "Saved threads",
      description: "Access your saved content",
      icon: Bookmark,
      action: () => navigate("/profile/saved"),
      color: "from-purple-500 to-violet-600",
      badge: stats?.threads_saved ?? 0,
    },
    {
      label: "Account settings",
      description: "Update your preferences",
      icon: Settings,
      action: () => navigate("/profile/settings"),
      color: "from-slate-500 to-slate-700",
    },
  ]

  const statCards = [
    {
      label: "Threads created",
      value: stats?.threads_created ?? 0,
      icon: MessageSquare,
      color: "from-blue-400 to-blue-600",
    },
    {
      label: "Replies posted",
      value: stats?.replies_posted ?? 0,
      icon: MessageCircle,
      color: "from-pink-400 to-rose-600",
    },
    {
      label: "Karma points",
      value: stats?.karma_points ?? 0,
      icon: Sparkles,
      color: "from-amber-400 to-yellow-600",
    },
    {
      label: "Current streak",
      value: `${stats?.streak_days ?? 0} days`,
      icon: TrendingUp,
      color: "from-emerald-400 to-green-600",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-6 sm:p-8 text-white">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                Welcome back!
              </h1>
              <p className="text-blue-100 text-base sm:text-lg">
                Your safe space for sharing and support.
              </p>
            </div>
            {stats?.karma_points && stats.karma_points > 0 && (
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                <Sparkles className="w-5 h-5 text-amber-200" />
                <div>
                  <div className="text-xl font-bold">
                    {stats?.karma_points ?? 0}
                  </div>
                  <div className="text-xs text-blue-100">Karma points</div>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
              <span>Online now</span>
            </div>
            <div>Joined {stats?.categories_joined ?? 0} categories</div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>{stats?.streak_days ?? 0} day streak</span>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-24 -translate-x-24" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="group relative overflow-hidden rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200/60 p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-600 mb-1">
                    {card.label}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                    {card.value}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories */}
        <div className="lg:col-span-1">
          <div className="rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200/60 p-6 shadow-lg h-full">
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-600 flex items-center justify-center">
                  <ListFilter className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Your Categories
                </h2>
              </div>
              <button
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                onClick={() => navigate("/categories")}
              >
                Browse all <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {categories && categories.length > 0 ? (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    className="group w-full text-left p-4 rounded-xl bg-gradient-to-r from-white/80 to-slate-50/80 border border-slate-200/60 hover:border-blue-300/60 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                    onClick={() => navigate(`/categories/${cat.slug}`)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-300 flex-shrink-0">
                          <Folder className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                            {cat.name}
                          </p>
                          <p className="text-xs text-slate-600 mt-1 truncate leading-relaxed">
                            {cat.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-3 px-2.5 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 border border-slate-200/50 shadow-sm">
                        {cat.thread_count}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No categories joined</p>
                <Button
                  onClick={() => navigate("/categories")}
                  variant="outline"
                  className="mt-4"
                >
                  Explore categories
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200/60 p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">
                Quick Actions
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <button
                    key={action.label}
                    className="group w-full text-left p-4 rounded-xl bg-gradient-to-r from-white/80 to-slate-50/80 border border-slate-200/60 hover:border-blue-300/60 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                    onClick={action.action}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md group-hover:shadow-lg`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors block">
                          {action.label}
                        </span>
                        <span className="text-xs text-slate-600 leading-relaxed">
                          {action.description}
                        </span>
                      </div>
                      {action.badge && action.badge > 0 && (
                        <div className="px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-xs font-medium border border-blue-200/50 shadow-sm">
                          {action.badge}
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200/60 p-6 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Your recent activity
                </h2>
              </div>
              <button
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 self-start sm:self-center"
                onClick={() => navigate("/profile/activity")}
              >
                View all <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {activity?.threads && activity.threads.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
                  <BarChart2 className="w-4 h-4" />
                  <h3>Your recent threads</h3>
                </div>
                <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1">
                  {activity.threads.map((thread) => (
                    <div
                      key={thread.id}
                      className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-white/80 to-slate-50/80 border border-slate-200/60 hover:border-blue-300/60 hover:shadow-lg transition-all duration-300 cursor-pointer"
                      onClick={() => navigate(`/threads/${thread.id}`)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative p-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${
                              thread.has_new_replies
                                ? "bg-gradient-to-r from-blue-500 to-indigo-600 ring-2 ring-blue-200 shadow-sm"
                                : "bg-gradient-to-r from-slate-300 to-slate-400"
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2 leading-snug">
                              {thread.title}
                            </h4>
                            <p className="text-sm text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                              {thread.preview}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 mt-3">
                              <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-full border border-blue-200/50">
                                {thread.category}
                              </span>
                              <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                                <MessageSquare className="w-3 h-3" />
                                {thread.replies} replies
                              </span>
                              <span className="text-xs text-slate-500">
                                {thread.created_at}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {activity.recent_replies &&
                  activity.recent_replies.length > 0 && (
                    <>
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3 mt-4">
                        <CheckCircle2 className="w-4 h-4" />
                        <h3>Your recent replies</h3>
                      </div>
                      <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                        {activity.recent_replies.map((reply, index) => (
                          <div
                            key={index}
                            className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-white/80 to-emerald-50/50 border border-slate-200/60 hover:border-emerald-300/60 hover:shadow-lg transition-all duration-300 cursor-pointer"
                            onClick={() =>
                              navigate(`/threads/${reply.thread_id}`)
                            }
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="relative p-4">
                              <div className="flex items-start gap-3">
                                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 mt-1.5 flex-shrink-0 shadow-sm" />
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                                    Reply to: {reply.thread_title}
                                  </h4>
                                  <p className="text-sm text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                                    {reply.preview}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-3 mt-3">
                                    <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 rounded-full border border-emerald-200/50">
                                      {reply.category}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                      {reply.replied_at}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No activity yet</p>
                <p className="text-sm">
                  Start your first thread or join a conversation!
                </p>
                <Button
                  onClick={() => navigate("/threads/new")}
                  className="mt-4"
                >
                  Create your first thread
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Wellness & Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Wellness Tracker */}
        <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">
              Wellness Tracker
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="rounded-lg bg-white/80 p-4 border border-emerald-100">
              <div className="text-xs text-slate-500 mb-1">Daily streak</div>
              <div className="text-2xl font-bold text-emerald-700">
                {stats?.streak_days ?? 0} days
              </div>
            </div>
            <div className="rounded-lg bg-white/80 p-4 border border-emerald-100">
              <div className="text-xs text-slate-500 mb-1">
                Categories joined
              </div>
              <div className="text-2xl font-bold text-emerald-700">
                {stats?.categories_joined ?? 0}
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={() => navigate("/wellness")}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              View wellness dashboard
            </Button>
          </div>
        </div>

        {/* Account & Privacy */}
        <div className="rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200/60 p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-slate-500 to-slate-700 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">
              Account & Privacy
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => navigate("/profile/settings")}
              className="p-4 rounded-lg border border-slate-200 hover:bg-slate-50/80 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
                <div>
                  <div className="font-medium text-slate-700">
                    Account settings
                  </div>
                  <div className="text-xs text-slate-500">
                    Manage your preferences
                  </div>
                </div>
              </div>
            </button>
            <button
              onClick={() => navigate("/profile/notifications")}
              className="p-4 rounded-lg border border-slate-200 hover:bg-slate-50/80 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
                <div>
                  <div className="font-medium text-slate-700">
                    Notifications
                  </div>
                  <div className="text-xs text-slate-500">
                    Customize your alerts
                  </div>
                </div>
              </div>
            </button>
            <button
              onClick={() => navigate("/profile/privacy")}
              className="p-4 rounded-lg border border-slate-200 hover:bg-slate-50/80 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
                <div>
                  <div className="font-medium text-slate-700">Privacy</div>
                  <div className="text-xs text-slate-500">
                    Control your visibility
                  </div>
                </div>
              </div>
            </button>
            <button
              onClick={() => navigate("/help")}
              className="p-4 rounded-lg border border-slate-200 hover:bg-slate-50/80 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
                <div>
                  <div className="font-medium text-slate-700">
                    Community guidelines
                  </div>
                  <div className="text-xs text-slate-500">
                    Learn about our rules
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
