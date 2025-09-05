import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import {
  MessageSquare,
  Plus,
  TrendingUp,
  Heart,
  BookOpen,
  Users,
  Calendar,
  ArrowRight,
  User,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"

// Mock services - replace with actual API calls
const getUserStats = async () => ({
  threads_created: 3,
  replies_posted: 12,
  threads_liked: 8,
  active_days: 15,
  streak_days: 3,
  categories_joined: 4,
})

const getRecentActivity = async () => ({
  threads: [
    {
      id: "1",
      title: "My journey with anxiety management",
      category: "Anxiety",
      replies: 5,
      created_at: "2 days ago",
    },
    {
      id: "2",
      title: "Finding balance after burnout",
      category: "Work & Burnout",
      replies: 8,
      created_at: "1 week ago",
    },
  ],
  recent_replies: [
    {
      thread_id: "3",
      thread_title: "Coping with social anxiety",
      category: "Anxiety",
      replied_at: "1 hour ago",
    },
  ],
})

export default function UserDashboard() {
  const navigate = useNavigate()

  const { data: stats } = useQuery({
    queryKey: ["user-stats"],
    queryFn: getUserStats,
  })

  const { data: activity } = useQuery({
    queryKey: ["user-activity"],
    queryFn: getRecentActivity,
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
      label: "Find support",
      description: "Join ongoing conversations",
      icon: Users,
      action: () => navigate("/threads"),
      color: "from-purple-500 to-violet-600",
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
      icon: Heart,
      color: "from-pink-400 to-rose-600",
    },
    {
      label: "Days active",
      value: stats?.active_days ?? 0,
      icon: Calendar,
      color: "from-emerald-400 to-green-600",
    },
    {
      label: "Current streak",
      value: `${stats?.streak_days ?? 0} days`,
      icon: TrendingUp,
      color: "from-orange-400 to-amber-600",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-6 sm:p-8 text-white">
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-blue-100 text-base sm:text-lg">
            Your safe space for sharing, learning, and growing together.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
              <span>Online now</span>
            </div>
            <div>Joined {stats?.categories_joined ?? 0} categories</div>
            <div>{stats?.streak_days ?? 0} day streak</div>
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Quick Actions */}
        <div className="xl:col-span-1">
          <div className="rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200/60 p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
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
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="font-medium text-slate-700 block">
                          {action.label}
                        </span>
                        <span className="text-xs text-slate-500">
                          {action.description}
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="xl:col-span-2">
          <div className="rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200/60 p-4 sm:p-6 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
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
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-3">
                    Your threads
                  </h3>
                  {activity.threads.map((thread) => (
                    <div
                      key={thread.id}
                      className="flex items-start gap-4 p-4 rounded-lg border border-slate-200 hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => navigate(`/threads/${thread.id}`)}
                    >
                      <div className="w-3 h-3 rounded-full bg-blue-500 mt-2" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">
                          {thread.title}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                            {thread.category}
                          </span>
                          <span>{thread.replies} replies</span>
                          <span>{thread.created_at}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {activity.recent_replies &&
                  activity.recent_replies.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-slate-700 mb-3">
                        Recent replies
                      </h3>
                      {activity.recent_replies.map((reply, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-4 p-4 rounded-lg border border-slate-200 hover:bg-slate-50/80 transition-colors cursor-pointer"
                          onClick={() =>
                            navigate(`/threads/${reply.thread_id}`)
                          }
                        >
                          <div className="w-3 h-3 rounded-full bg-green-500 mt-2" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 truncate">
                              Replied to: {reply.thread_title}
                            </p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                {reply.category}
                              </span>
                              <span>{reply.replied_at}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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

      {/* Profile & Settings */}
      <div className="rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200/60 p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-slate-500 to-slate-700 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">
            Account & Privacy
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
  )
}
