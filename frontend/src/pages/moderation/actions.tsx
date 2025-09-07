import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Shield, Clock, User, MessageSquare, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getModerationActions } from "@/services/moderation"
import type { ModerationActionResponse } from "@/types/api"

type ActionFilter = "all" | "warn" | "hide" | "delete" | "ban"

export default function ModerationActionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<ActionFilter>("all")

  const { data: actions, isLoading } = useQuery<ModerationActionResponse[]>({
    queryKey: ["moderation-actions", filter],
    queryFn: () =>
      getModerationActions({ action: filter === "all" ? undefined : filter }),
  })

  const filteredActions =
    actions?.filter((action: ModerationActionResponse) => {
      if (!searchQuery) return true
      return (
        action.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
        action.moderator.username
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        action.reported_user.username
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
    }) || []

  const getActionBadge = (action: string) => {
    const styles = {
      dismiss: "bg-gray-100 text-gray-800",
      warn_user: "bg-yellow-100 text-yellow-800",
      hide_content: "bg-orange-100 text-orange-800",
      delete_content: "bg-red-100 text-red-800",
      ban_user_temp: "bg-purple-100 text-purple-800",
      ban_user_permanent: "bg-red-200 text-red-900",
    }
    return styles[action as keyof typeof styles] || "bg-gray-100 text-gray-800"
  }

  const getActionLabel = (action: string) => {
    const labels = {
      dismiss: "Dismissed",
      warn_user: "User Warning",
      hide_content: "Content Hidden",
      delete_content: "Content Deleted",
      ban_user_temp: "Temporary Ban",
      ban_user_permanent: "Permanent Ban",
    }
    return labels[action as keyof typeof labels] || action
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-12 bg-slate-200 rounded"></div>
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Moderation Actions
        </h1>
        <p className="text-slate-600">
          Review all moderation actions taken by the team
        </p>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Input
                placeholder="Search by reason, moderator, or user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-4"
              />
            </div>

            <div className="flex gap-2">
              {[
                { key: "all", label: "All Actions" },
                { key: "warn", label: "Warnings" },
                { key: "hide", label: "Hidden" },
                { key: "delete", label: "Deleted" },
                { key: "ban", label: "Bans" },
              ].map(({ key, label }) => (
                <Button
                  key={key}
                  variant={filter === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(key as ActionFilter)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions List */}
      <div className="space-y-4">
        {filteredActions.length > 0 ? (
          filteredActions.map((action: ModerationActionResponse) => (
            <Card key={action.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-red-500 to-orange-600 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getActionBadge(action.action)}>
                          {getActionLabel(action.action)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {action.content_type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>by {action.moderator.username}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {new Date(action.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {action.ban_expires_at && (
                    <Badge variant="outline" className="text-xs">
                      Expires:{" "}
                      {new Date(action.ban_expires_at).toLocaleDateString()}
                    </Badge>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-1">
                      Affected User
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-slate-400" />
                      <span>{action.reported_user.username}</span>
                      <Badge variant="outline" className="text-xs">
                        {action.reported_user.role}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-1">
                      Content ID
                    </p>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MessageSquare className="w-4 h-4 text-slate-400" />
                      <span className="font-mono">{action.content_id}</span>
                    </div>
                  </div>
                </div>

                {action.reason && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-slate-700 mb-1">
                      Reason
                    </p>
                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                      {action.reason}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>Action ID: {action.id}</span>
                    <span>Report ID: {action.report_id}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Shield className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No Actions Found
              </h3>
              <p className="text-slate-600">
                {searchQuery || filter !== "all"
                  ? "No moderation actions match your current filters"
                  : "No moderation actions have been taken yet"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
