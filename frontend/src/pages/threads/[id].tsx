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
import { Label } from "@/components/ui/label"
import api from "@/lib/api"
import PrivateCategoryCTA from "@/components/private-category-cta"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import SaveThreadButton from "@/components/save-thread-button"
import { createReply } from "@/services/threads"
import type { CreateReplyRequest } from "@/types/api"
import { toast } from "sonner"
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
  const [is403, setIs403] = useState(false)
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [categoryName, setCategoryName] = useState<string | null>(null)
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [replyError, setReplyError] = useState("")

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
        return data
      } catch (error) {
        const status = (error as { response?: { status?: number } })?.response
          ?.status
        const code = (error as { response?: { data?: { code?: string } } })
          ?.response?.data?.code

        if (status === 403 && code === "CATEGORY_PRIVATE") {
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        className="mb-6 text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {/* Show CTA for private categories with 403 */}
      {is403 && categoryId && (
        <div className="mb-6">
          <PrivateCategoryCTA
            categoryId={categoryId}
            categoryName={categoryName || "this category"}
          />
        </div>
      )}

      {/* Thread content */}
      {!is403 && thread && (
        <>
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="text-2xl font-bold">{thread.title}</h1>
              <SaveThreadButton
                threadId={thread.id}
                threadTitle={thread.title}
                variant="compact"
                isSaved={thread.is_saved}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 mb-6">
              {thread.category && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer hover:bg-slate-200"
                  onClick={() => navigate(`/categories/${thread.category.id}`)}
                >
                  {thread.category.name}
                </Badge>
              )}
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {thread.author_username}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(thread.created_at).toLocaleString()}
              </div>
              {thread.is_locked && (
                <Badge
                  variant="outline"
                  className="text-amber-700 border-amber-200 bg-amber-50"
                >
                  <Lock className="w-3 h-3 mr-1" />
                  Locked
                </Badge>
              )}
              {thread.is_edited && (
                <span className="text-xs text-slate-500">(edited)</span>
              )}
            </div>

            <div className="prose prose-slate max-w-none border-b pb-6">
              <div className="whitespace-pre-wrap">{thread.content}</div>
            </div>
          </div>

          {/* Replies */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Replies
              {!repliesLoading && replies?.total > 0 && (
                <span className="text-sm text-slate-600">
                  ({replies.total})
                </span>
              )}
            </h2>

            {repliesLoading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-24 bg-slate-200 rounded w-full"
                  ></div>
                ))}
              </div>
            ) : replies?.replies && replies.replies.length > 0 ? (
              <>
                <div className="space-y-4 mb-6">
                  {replies.replies.map((reply: ReplyItem) => (
                    <Card key={reply.id} className="bg-white/80">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">
                              {reply.author_username}
                            </span>
                            <span className="text-slate-500">
                              {new Date(reply.created_at).toLocaleString()}
                            </span>
                            {reply.is_edited && (
                              <span className="text-xs text-slate-500">
                                (edited)
                              </span>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <div className="whitespace-pre-wrap">
                          {reply.content}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Reply button when there are existing replies */}
                {!thread.is_locked && !showReplyForm && (
                  <div className="text-center">
                    <Button onClick={() => setShowReplyForm(true)}>
                      Add Reply
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-lg border border-slate-200">
                <MessageCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600">No replies yet</p>
                {!thread.is_locked && !showReplyForm && (
                  <Button
                    className="mt-4"
                    onClick={() => setShowReplyForm(true)}
                  >
                    Be the first to reply
                  </Button>
                )}
              </div>
            )}

            {/* Reply Form */}
            {showReplyForm && !thread.is_locked && (
              <Card className="mt-6">
                <CardHeader>
                  <h3 className="text-lg font-semibold">Add Reply</h3>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleReplySubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reply-content">Your Reply</Label>
                      <Textarea
                        id="reply-content"
                        value={replyContent}
                        onChange={(
                          e: React.ChangeEvent<HTMLTextAreaElement>
                        ) => {
                          setReplyContent(e.target.value)
                          if (replyError) setReplyError("")
                        }}
                        placeholder="Share your thoughts..."
                        rows={4}
                        maxLength={5000}
                        className={replyError ? "border-red-500" : ""}
                      />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>
                          {replyError && (
                            <span className="text-red-600">{replyError}</span>
                          )}
                        </span>
                        <span>{replyContent.length}/5,000</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="submit"
                        disabled={
                          createReplyMutation.isPending || !replyContent.trim()
                        }
                        className="flex-1"
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
                </CardContent>
              </Card>
            )}

            {/* Show locked message if thread is locked */}
            {thread.is_locked && (
              <div className="text-center py-4 text-slate-600 bg-slate-50 rounded-lg border border-slate-200 mt-6">
                <Lock className="w-5 h-5 mx-auto mb-2" />
                <p>This thread is locked and not accepting new replies.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
