import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import {
  ChevronLeft,
  MessageSquare,
  Reply,
  BarChart3,
  Calendar,
  Clock,
  TrendingUp,
  Activity,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getUserActivity } from "@/services/user"
import type { UserActivity } from "@/types/api"

type ActivityFilter = "all" | "threads" | "replies"

export default function ProfileActivity() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<ActivityFilter>("all")

  const { data: activity, isLoading } = useQuery<UserActivity>({
    queryKey: ["user-activity"],
    queryFn: getUserActivity,
  })

  const handleThreadClick = (threadId: string) => {
    navigate(`/threads/${threadId}`)
  }

  const filteredThreads =
    activity?.threads?.filter(() => {
      if (filter === "threads") return true
      if (filter === "all") return true
      return false
    }) || []

  const filteredReplies =
    activity?.replies?.filter(() => {
      if (filter === "replies") return true
      if (filter === "all") return true
      return false
    }) || []

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="grid md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard")}
          className="mb-4 text-slate-600 hover:text-slate-900"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Your Activity</h1>
        </div>
        <p className="text-slate-600">
          Track your contributions and engagement
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Threads Created</p>
                <p className="text-2xl font-bold text-slate-900">
                  {activity?.thread_count || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Reply className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Replies Posted</p>
                <p className="text-2xl font-bold text-slate-900">
                  {activity?.reply_count || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Engagement</p>
                <p className="text-2xl font-bold text-slate-900">
                  {(activity?.thread_count || 0) + (activity?.reply_count || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="flex gap-2">
          {[
            { key: "all", label: "All Activity", icon: BarChart3 },
            { key: "threads", label: "Threads", icon: MessageSquare },
            { key: "replies", label: "Replies", icon: Reply },
          ].map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={filter === key ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(key as ActivityFilter)}
              className="flex items-center gap-2"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Activity Feed */}
      <div className="space-y-6">
        {/* Threads Section */}
        {(filter === "all" || filter === "threads") && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Your Threads
              {filteredThreads.length > 0 && (
                <Badge variant="secondary">{filteredThreads.length}</Badge>
              )}
            </h2>

            {filteredThreads.length > 0 ? (
              <div className="space-y-3">
                {filteredThreads.map((thread) => (
                  <Card
                    key={thread.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleThreadClick(thread.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-medium text-slate-900 mb-1 line-clamp-1">
                            {thread.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(thread.created_at).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Reply className="w-3 h-3" />
                              {thread.reply_count || 0} replies
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="shrink-0">
                          {thread.category_name}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 mb-4">
                    You haven't created any threads yet
                  </p>
                  <Button onClick={() => navigate("/threads/new")}>
                    Create Your First Thread
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Replies Section */}
        {(filter === "all" || filter === "replies") && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Reply className="w-5 h-5" />
              Your Replies
              {filteredReplies.length > 0 && (
                <Badge variant="secondary">{filteredReplies.length}</Badge>
              )}
            </h2>

            {filteredReplies.length > 0 ? (
              <div className="space-y-3">
                {filteredReplies.map((reply) => (
                  <Card
                    key={reply.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleThreadClick(reply.thread_id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                          <Reply className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-slate-600 mb-1">
                            Replied to:{" "}
                            <span className="font-medium text-slate-900">
                              {reply.thread_title}
                            </span>
                          </p>
                          <p className="text-slate-800 line-clamp-2 mb-2">
                            {reply.content}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(reply.created_at).toLocaleDateString()}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {reply.category_name}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Reply className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 mb-4">
                    You haven't posted any replies yet
                  </p>
                  <Button onClick={() => navigate("/")}>
                    Browse Threads to Reply
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
