import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Search,
  User,
  Shield,
  Ban,
  UserCheck,
  Calendar,
  Clock,
  MoreHorizontal,
  Eye,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getUsersForModeration, banUser, unbanUser } from "@/services/users"
import type { UserProfile } from "@/types/api"
import { toast } from "sonner"

type UserFilter = "all" | "active" | "suspended" | "banned"

export default function ModerationUsersPage() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<UserFilter>("all")

  const { data: users, isLoading } = useQuery<UserProfile[]>({
    queryKey: ["moderation-users", filter],
    queryFn: () =>
      getUsersForModeration({ status: filter === "all" ? undefined : filter }),
  })

  const banMutation = useMutation({
    mutationFn: ({
      userId,
      duration,
      reason,
    }: {
      userId: string
      duration?: number
      reason: string
    }) => banUser(userId, { duration, reason }),
    onSuccess: () => {
      toast.success("User banned successfully")
      queryClient.invalidateQueries({ queryKey: ["moderation-users"] })
    },
    onError: () => {
      toast.error("Failed to ban user")
    },
  })

  const unbanMutation = useMutation({
    mutationFn: (userId: string) => unbanUser(userId),
    onSuccess: () => {
      toast.success("User unbanned successfully")
      queryClient.invalidateQueries({ queryKey: ["moderation-users"] })
    },
    onError: () => {
      toast.error("Failed to unban user")
    },
  })

  const filteredUsers =
    users?.filter((user) => {
      if (!searchQuery) return true
      return (
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }) || []

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      suspended: "bg-yellow-100 text-yellow-800",
      banned: "bg-red-100 text-red-800",
    }
    return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800"
  }

  const getRoleBadge = (role: string) => {
    const styles = {
      user: "bg-blue-100 text-blue-800",
      moderator: "bg-purple-100 text-purple-800",
      admin: "bg-red-100 text-red-800",
    }
    return styles[role as keyof typeof styles] || "bg-gray-100 text-gray-800"
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-12 bg-slate-200 rounded"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 rounded"></div>
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
          User Management
        </h1>
        <p className="text-slate-600">
          Manage user accounts and moderation actions
        </p>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search by username or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              {[
                { key: "all", label: "All Users" },
                { key: "active", label: "Active" },
                { key: "suspended", label: "Suspended" },
                { key: "banned", label: "Banned" },
              ].map(({ key, label }) => (
                <Button
                  key={key}
                  variant={filter === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(key as UserFilter)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-900">
                          {user.username}
                        </h3>
                        <Badge className={getRoleBadge(user.role)}>
                          {user.role}
                        </Badge>
                        <Badge className={getStatusBadge(user.status)}>
                          {user.status}
                        </Badge>
                      </div>

                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-slate-600">
                        {user.email && (
                          <div>
                            <span className="font-medium">Email:</span>{" "}
                            {user.email}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Threads:</span>{" "}
                          {user.thread_count || 0}
                        </div>
                        <div>
                          <span className="font-medium">Replies:</span>{" "}
                          {user.reply_count || 0}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            Joined{" "}
                            {new Date(user.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {user.last_active_at && (
                        <div className="mt-2 text-sm text-slate-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            Last active{" "}
                            {new Date(user.last_active_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View Profile
                    </Button>

                    {user.status === "banned" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => unbanMutation.mutate(user.id)}
                        disabled={unbanMutation.isPending}
                        className="text-green-600 hover:text-green-700"
                      >
                        <UserCheck className="w-4 h-4 mr-1" />
                        Unban
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const reason = prompt("Enter ban reason:")
                          if (reason) {
                            banMutation.mutate({
                              userId: user.id,
                              reason,
                              duration: undefined, // Permanent ban
                            })
                          }
                        }}
                        disabled={banMutation.isPending}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Ban className="w-4 h-4 mr-1" />
                        Ban
                      </Button>
                    )}

                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* User activity summary */}
                {(user.thread_count > 0 || user.reply_count > 0) && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-1 text-blue-600">
                        <Shield className="w-4 h-4" />
                        <span>{user.thread_count || 0} threads created</span>
                      </div>
                      <div className="flex items-center gap-1 text-green-600">
                        <UserCheck className="w-4 h-4" />
                        <span>{user.reply_count || 0} replies posted</span>
                      </div>
                      {(user.violations_count || 0) > 0 && (
                        <div className="flex items-center gap-1 text-red-600">
                          <AlertTriangle className="w-4 h-4" />
                          <span>{user.violations_count} violations</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <User className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No Users Found
              </h3>
              <p className="text-slate-600">
                {searchQuery || filter !== "all"
                  ? "No users match your current filters"
                  : "No users found in the system"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
