import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lock, MessageSquare, Clock, Shield, ArrowLeft } from "lucide-react"
import api from "@/lib/api"
import PrivateCategoryCTA from "@/components/private-category-cta"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type ThreadItem = {
  id: string
  title: string
  created_at: string
  reply_count: number
  is_locked?: boolean
  is_pinned?: boolean
  preview?: string
  content: string
}

export default function CategoryDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [is403, setIs403] = useState(false)
  const [categoryName, setCategoryName] = useState("")

  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ["category", id],
    queryFn: async () => {
      try {
        const { data } = await api.get(`/categories/${id}`)
        setCategoryName(data.name)
        return data
      } catch {
        return null
      }
    },
  })

  const { data: threadsData, isLoading: threadsLoading } = useQuery({
    queryKey: ["category-threads", id],
    queryFn: async () => {
      try {
        const { data } = await api.get(`/categories/${id}/threads`)
        setIs403(false)
        return data
      } catch (error) {
        const status = (error as { response?: { status?: number } })?.response
          ?.status
        if (status === 403) {
          setIs403(true)
        }
        return null
      }
    },
    enabled: !!id,
  })

  if (categoryLoading || threadsLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-4 bg-slate-200 rounded w-2/3"></div>
          <div className="h-10 bg-slate-200 rounded w-full"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!id || (!categoryLoading && !category && !is403)) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Category not found</h1>
        <p className="text-slate-600 mb-6">
          This category doesn't exist or has been removed.
        </p>
        <Button onClick={() => navigate("/")}>Return to home</Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header with back button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              {category?.name || categoryName || "Category"}
            </h1>
            {category?.description && (
              <p className="text-slate-600 mt-1">{category.description}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {category?.is_locked && (
              <Badge variant="warning" className="gap-1">
                <Lock className="w-3 h-3" /> Locked
              </Badge>
            )}
            {category?.is_private && (
              <Badge variant="warning" className="gap-1">
                <Shield className="w-3 h-3" /> Private
              </Badge>
            )}
            {category?.thread_count && (
              <Badge variant="secondary">{category.thread_count} threads</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Show CTA for private categories with 403 */}
      {is403 && id && (
        <div className="mb-6">
          <PrivateCategoryCTA
            categoryId={id}
            categoryName={category?.name || categoryName}
          />
        </div>
      )}

      {/* Threads List */}
      {!is403 && threadsData?.threads && threadsData.threads.length > 0 ? (
        <div className="space-y-4">
          {threadsData.threads.map((thread: ThreadItem) => (
            <Card key={thread.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-medium">
                      <button
                        onClick={() => navigate(`/threads/${thread.id}`)}
                        className="text-left hover:text-blue-600 transition-colors line-clamp-2"
                      >
                        {thread.title}
                      </button>
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {thread.reply_count} replies
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(thread.created_at).toLocaleDateString()}
                      </div>
                      {thread.is_locked && (
                        <Badge
                          variant="outline"
                          className="text-amber-700 border-amber-200 bg-amber-50"
                        >
                          Locked
                        </Badge>
                      )}
                      {thread.is_pinned && (
                        <Badge
                          variant="outline"
                          className="text-blue-700 border-blue-200 bg-blue-50"
                        >
                          Pinned
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <p className="text-sm text-slate-600 line-clamp-2">
                  {thread.preview || thread.content.slice(0, 150)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        !is403 && (
          <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
            <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold">No threads yet</h2>
            <p className="text-slate-600 mb-6">
              Be the first to start a conversation
            </p>
            <Button onClick={() => navigate("/threads/new")}>
              Create Thread
            </Button>
          </div>
        )
      )}
    </div>
  )
}
