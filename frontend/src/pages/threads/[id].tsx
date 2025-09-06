import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Lock,
  MessageCircle,
  Clock,
  User,
  ArrowLeft,
  Loader2,
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import api from "@/lib/api"
import PrivateCategoryCTA from "@/components/private-category-cta"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import SaveThreadButton from "@/components/save-thread-button"
import { createReply, updateThread } from "@/services/threads"
import type { CreateReplyRequest, UpdateThreadRequest } from "@/types/api"
import { toast } from "sonner"
import { useAuthStore } from "@/store/auth"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getUsers } from "@/services/users"
type ReplyItem = {
  id: string
  author_username: string
  created_at: string
  is_edited?: boolean
  content: string
}

export default function ThreadDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const currentUser = useAuthStore((s) => s.user)
  const [is403, setIs403] = useState(false)
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [categoryName, setCategoryName] = useState<string | null>(null)
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [replyError, setReplyError] = useState("")
  const [threadPassword, setThreadPassword] = useState("")
  const [selectedModeratorId, setSelectedModeratorId] = useState<string>("")
  const [isPrivateDraft, setIsPrivateDraft] = useState<boolean | null>(null)
  const [newPassword, setNewPassword] = useState("")

  const { data: thread, isLoading: threadLoading } = useQuery({
    queryKey: ["thread", id],
    queryFn: async () => {
      try {
        const { data } = await api.get(`/threads/${id}`)
        setIs403(false)
        // Store category info for potential 403 handling
        if (data.category) {
          setCategoryId(data.category.id)
          setCategoryName(data.category.name)
        }
        // initialize drafts dependent on thread
        setSelectedModeratorId(data.assigned_moderator_id || "none")
        setIsPrivateDraft(
          typeof data.is_private === "boolean" ? data.is_private : null
        )
        return data
      } catch (error) {
        const status = (error as { response?: { status?: number } })?.response
          ?.status
        const code = (error as { response?: { data?: { code?: string } } })
          ?.response?.data?.code

        if (
          status === 403 &&
          (code === "CATEGORY_PRIVATE" || code === "THREAD_PRIVATE")
        ) {
          // Try to get category info from the error response if possible
          const categoryIdMatch = (
            error as { response?: { data?: { message?: string } } }
          )?.response?.data?.message?.match(/category_id=([^&]+)/i)
          if (categoryIdMatch && categoryIdMatch[1]) {
            setCategoryId(categoryIdMatch[1])
          }
          setIs403(true)
        }
        return null
      }
    },
    enabled: !!id,
  })

  // Fetch moderators for assignment (admins/mods only)
  const canAssignModerator = currentUser?.role === "admin"
  const { data: moderators } = useQuery({
    queryKey: ["moderators"],
    queryFn: async () => {
      const res = await getUsers({ role: "moderator", pageSize: 100 })
      return res.items
    },
    enabled: !!canAssignModerator,
  })

  const { data: replies, isLoading: repliesLoading } = useQuery({
    queryKey: ["thread-replies", id],
    queryFn: async () => {
      const { data } = await api.get(`/threads/${id}/replies`)
      return data
    },
    enabled: !!thread && !is403, // Only fetch replies if thread loaded and no 403
  })

  // Create reply mutation
  const createReplyMutation = useMutation({
    mutationFn: (data: CreateReplyRequest) => createReply(id!, data),
    onSuccess: () => {
      toast.success("Reply posted successfully!")
      setReplyContent("")
      setReplyError("")
      setShowReplyForm(false)
      // Refetch replies to show the new one
      queryClient.invalidateQueries({ queryKey: ["thread-replies", id] })
    },
    onError: (error: {
      response?: {
        status: number
        data?: {
          details?: Array<{ field: string; message: string }>
          message?: string
        }
      }
    }) => {
      console.error("Create reply error:", error)

      if (error.response?.status === 400 && error.response?.data?.details) {
        const contentError = error.response.data.details.find(
          (d) => d.field === "content"
        )
        setReplyError(contentError?.message || "Invalid content")
      } else if (error.response?.status === 403) {
        toast.error("You don't have permission to reply to this thread")
      } else if (error.response?.status === 423) {
        toast.error("This thread is locked and not accepting replies")
      } else {
        toast.error(error.response?.data?.message || "Failed to post reply")
      }
    },
  })

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setReplyError("")

    if (!replyContent.trim()) {
      setReplyError("Reply content is required")
      return
    }
    if (replyContent.length < 5) {
      setReplyError("Reply must be at least 5 characters")
      return
    }
    if (replyContent.length > 5000) {
      setReplyError("Reply must be less than 5,000 characters")
      return
    }

    createReplyMutation.mutate({ content: replyContent.trim() })
  }

  // Mutations for thread management
  const updateThreadMutation = useMutation({
    mutationFn: (payload: UpdateThreadRequest) => updateThread(id!, payload),
    onSuccess: () => {
      toast.success("Thread updated")
      queryClient.invalidateQueries({ queryKey: ["thread", id] })
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to update thread"
      toast.error(msg)
    },
  })

  if (threadLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-2/3"></div>
          <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-slate-200 rounded w-full mb-8"></div>
          <div className="h-6 bg-slate-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!id || (!threadLoading && !thread && !is403)) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Thread not found</h1>
        <p className="text-slate-600 mb-6">
          This thread doesn't exist or has been removed.
        </p>
        <Button onClick={() => navigate("/")}>Return to home</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header with navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to discussions
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Show CTA for private categories with 403 */}
        {is403 && categoryId && (
          <div className="mb-8">
            <PrivateCategoryCTA
              categoryId={categoryId}
              categoryName={categoryName || "this category"}
            />
          </div>
        )}
        {is403 && !categoryId && (
          <div className="max-w-xl mx-auto mb-8">
            <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5" />
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-400/10 to-orange-500/10 rounded-full blur-xl" />

              <CardContent className="p-6 relative">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      This thread is private
                    </h3>
                    <p className="text-slate-600">
                      Enter the thread password to view its content and
                      participate in the discussion.
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault()
                    if (!id || !threadPassword.trim()) return

                    try {
                      // Update the query to include the password
                      const response = await api.get(
                        `/threads/${id}?password=${encodeURIComponent(
                          threadPassword
                        )}`
                      )

                      // Update the query cache with the new data
                      queryClient.setQueryData(["thread", id], response.data)

                      // Clear the 403 state
                      setIs403(false)
                      setThreadPassword("")

                      toast.success("Thread unlocked successfully!")
                    } catch (error) {
                      const status = (
                        error as { response?: { status?: number } }
                      )?.response?.status
                      if (status === 403) {
                        toast.error("Invalid password")
                      } else {
                        toast.error("Failed to unlock thread")
                      }
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <Label
                      htmlFor="thread-password"
                      className="text-sm font-medium text-slate-700"
                    >
                      Thread Password
                    </Label>
                    <Input
                      id="thread-password"
                      type="password"
                      value={threadPassword}
                      onChange={(e) => setThreadPassword(e.target.value)}
                      placeholder="Enter the thread password"
                      className="mt-1 bg-white/80 backdrop-blur-sm"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={!threadPassword.trim()}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Unlock Thread
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Thread content */}
        {!is403 && thread && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Thread Card */}
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-slate-900 leading-tight mb-4">
                        {thread.title}
                      </h1>

                      {/* Thread metadata */}
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        {thread.category && (
                          <Badge
                            variant="secondary"
                            className="cursor-pointer hover:bg-blue-100 transition-colors bg-blue-50 text-blue-700 border-blue-200"
                            onClick={() =>
                              navigate(`/categories/${thread.category.id}`)
                            }
                          >
                            {thread.category.name}
                          </Badge>
                        )}

                        <div className="flex items-center gap-1 text-slate-600">
                          <User className="w-4 h-4" />
                          <span className="font-medium">
                            {thread.author_username}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-slate-500">
                          <Clock className="w-4 h-4" />
                          {new Date(thread.created_at).toLocaleString()}
                        </div>

                        {thread.is_locked && (
                          <Badge
                            variant="outline"
                            className="text-amber-700 border-amber-300 bg-amber-50"
                          >
                            <Lock className="w-3 h-3 mr-1" />
                            Locked
                          </Badge>
                        )}

                        {thread.is_edited && (
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            edited
                          </span>
                        )}
                      </div>
                    </div>

                    <SaveThreadButton
                      threadId={thread.id}
                      threadTitle={thread.title}
                      variant="compact"
                      isSaved={thread.is_saved}
                    />
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="prose prose-slate max-w-none">
                    <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                      {thread.content}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Replies Section */}
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                      <MessageCircle className="w-6 h-6 text-blue-600" />
                      Replies
                      {!repliesLoading && replies?.total > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {replies.total}
                        </Badge>
                      )}
                    </h2>

                    {!thread.is_locked &&
                      !showReplyForm &&
                      replies?.replies &&
                      replies.replies.length > 0 && (
                        <Button
                          onClick={() => setShowReplyForm(true)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Add Reply
                        </Button>
                      )}
                  </div>
                </CardHeader>

                <CardContent>
                  {repliesLoading ? (
                    <div className="animate-pulse space-y-6">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex space-x-4">
                          <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                            <div className="h-16 bg-slate-200 rounded"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : replies?.replies && replies.replies.length > 0 ? (
                    <div className="space-y-6">
                      {replies.replies.map((reply: ReplyItem) => (
                        <div key={reply.id} className="flex space-x-4 group">
                          {/* Avatar placeholder */}
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {reply.author_username.charAt(0).toUpperCase()}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="bg-slate-50 rounded-lg p-4 group-hover:bg-slate-100 transition-colors">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold text-slate-900">
                                  {reply.author_username}
                                </span>
                                <span className="text-slate-500 text-sm">
                                  {new Date(reply.created_at).toLocaleString()}
                                </span>
                                {reply.is_edited && (
                                  <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded">
                                    edited
                                  </span>
                                )}
                              </div>
                              <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                                {reply.content}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        No replies yet
                      </h3>
                      <p className="text-slate-600 mb-6">
                        Be the first to share your thoughts on this thread
                      </p>
                      {!thread.is_locked && !showReplyForm && (
                        <Button
                          onClick={() => setShowReplyForm(true)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Start the conversation
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Reply Form */}
                  {showReplyForm && !thread.is_locked && (
                    <div className="mt-8 pt-6 border-t border-slate-200">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-blue-600" />
                        Add Your Reply
                      </h3>
                      <form onSubmit={handleReplySubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Textarea
                            id="reply-content"
                            value={replyContent}
                            onChange={(
                              e: React.ChangeEvent<HTMLTextAreaElement>
                            ) => {
                              setReplyContent(e.target.value)
                              if (replyError) setReplyError("")
                            }}
                            placeholder="Share your thoughts, ask questions, or provide feedback..."
                            rows={4}
                            maxLength={5000}
                            className={`transition-all duration-200 ${
                              replyError
                                ? "border-red-500 focus:border-red-500"
                                : "border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                            }`}
                          />
                          <div className="flex justify-between text-sm">
                            <span>
                              {replyError && (
                                <span className="text-red-600 flex items-center gap-1">
                                  <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                                  {replyError}
                                </span>
                              )}
                            </span>
                            <span
                              className={`${
                                replyContent.length > 4500
                                  ? "text-orange-600"
                                  : "text-slate-500"
                              }`}
                            >
                              {replyContent.length}/5,000
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button
                            type="submit"
                            disabled={
                              createReplyMutation.isPending ||
                              !replyContent.trim()
                            }
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300"
                          >
                            {createReplyMutation.isPending && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Post Reply
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowReplyForm(false)
                              setReplyContent("")
                              setReplyError("")
                            }}
                            disabled={createReplyMutation.isPending}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Locked thread message */}
                  {thread.is_locked && (
                    <div className="mt-8 pt-6 border-t border-slate-200">
                      <div className="text-center py-6 bg-amber-50 rounded-lg border border-amber-200">
                        <Lock className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                        <p className="text-amber-800 font-medium">
                          This thread is locked
                        </p>
                        <p className="text-amber-700 text-sm">
                          No new replies can be added at this time.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Thread Stats */}
              <Card className="shadow-md border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <h3 className="font-semibold text-slate-900">Thread Stats</h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Replies</span>
                    <Badge variant="secondary">{thread.reply_count || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Views</span>
                    <Badge variant="secondary">{thread.view_count || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Created</span>
                    <span className="text-sm text-slate-700">
                      {new Date(thread.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {thread.last_reply_at && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Last Reply</span>
                      <span className="text-sm text-slate-700">
                        {new Date(thread.last_reply_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Assigned Moderator</span>
                    <span className="text-sm text-slate-700">
                      {thread.assigned_moderator_username || "None"}
                    </span>
                  </div>
                  {thread.is_private && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Privacy</span>
                      <Badge
                        variant="outline"
                        className="text-blue-700 border-blue-300 bg-blue-50"
                      >
                        Private
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="shadow-md border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <h3 className="font-semibold text-slate-900">
                    Quick Actions
                  </h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      navigate(`/categories/${thread.category?.id}`)
                    }
                    className="w-full justify-start"
                  >
                    View Category
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/threads/new")}
                    className="w-full justify-start"
                  >
                    Create New Thread
                  </Button>
                </CardContent>
              </Card>

              {/* Moderation & Privacy Controls */}
              {(canAssignModerator ||
                currentUser?.username === thread.author_username) && (
                <Card className="shadow-md border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <h3 className="font-semibold text-slate-900">
                      Manage Thread
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {canAssignModerator && (
                      <div className="space-y-2">
                        <Label htmlFor="assign-mod">Assigned Moderator</Label>
                        <Select
                          value={selectedModeratorId}
                          onValueChange={(val) => setSelectedModeratorId(val)}
                        >
                          <SelectTrigger id="assign-mod">
                            <SelectValue placeholder="Select moderator" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {moderators?.map((m) => (
                              <SelectItem key={m.id} value={m.id}>
                                {m.username}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              updateThreadMutation.mutate({
                                assigned_moderator_id:
                                  selectedModeratorId === "none"
                                    ? ""
                                    : selectedModeratorId,
                              })
                            }
                            disabled={updateThreadMutation.isPending}
                          >
                            {updateThreadMutation.isPending && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Save Assignment
                          </Button>
                          {thread.assigned_moderator_id && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateThreadMutation.mutate({
                                  assigned_moderator_id: "",
                                })
                              }
                              disabled={updateThreadMutation.isPending}
                            >
                              Clear
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Privacy Controls */}
                    <div className="space-y-2">
                      <Label>Privacy</Label>
                      <div className="flex items-center gap-2">
                        <input
                          id="is-private"
                          type="checkbox"
                          checked={
                            (isPrivateDraft ?? thread.is_private) || false
                          }
                          onChange={(e) => setIsPrivateDraft(e.target.checked)}
                        />
                        <label
                          htmlFor="is-private"
                          className="text-sm text-slate-700"
                        >
                          Make this thread private
                        </label>
                      </div>
                      <div className="text-xs text-slate-500">
                        Private threads require a password unless viewed by the
                        author or staff.
                      </div>
                      <div className="space-y-2 pt-2">
                        <Label htmlFor="new-password">
                          Set/Change Password
                        </Label>
                        <Input
                          id="new-password"
                          type="password"
                          placeholder="Enter new password (leave blank to keep)"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              updateThreadMutation.mutate({
                                is_private: isPrivateDraft ?? thread.is_private,
                                ...(newPassword
                                  ? { set_password: newPassword }
                                  : {}),
                              })
                            }
                            disabled={updateThreadMutation.isPending}
                          >
                            {updateThreadMutation.isPending && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Save Privacy
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateThreadMutation.mutate({ set_password: "" })
                            }
                            disabled={updateThreadMutation.isPending}
                          >
                            Clear Password
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
