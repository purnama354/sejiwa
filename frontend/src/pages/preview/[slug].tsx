import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import {
  ArrowLeft,
  Eye,
  MessageSquare,
  Lock,
  Calendar,
  Clock,
  TrendingUp,
  LogIn,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { listCategories } from "@/services/categories"
import { listThreads } from "@/services/threads"
import type { Category, Thread } from "@/types/api"

export default function CategoryPreview() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  // First try to get all categories to find by slug
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
  })

  // Find category by slug/name
  const category = categories?.find(
    (c: Category) =>
      c.slug === slug ||
      c.name.toLowerCase().replace(/\s+/g, "-") === slug ||
      c.name.toLowerCase() === slug
  )

  // Get sample threads for preview (first page only)
  const { data: threadsData, isLoading: threadsLoading } = useQuery({
    queryKey: ["category-threads-preview", category?.id],
    queryFn: () =>
      category
        ? listThreads({ category_id: category.id, page: 1, page_size: 5 })
        : null,
    enabled: !!category,
  })

  if (!categories) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-32 bg-slate-200 rounded"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
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
        </div>

        <div className="max-w-md mx-auto">
          <Eye className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Category Not Found
          </h1>
          <p className="text-slate-600 mb-6">
            The category you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/categories")}>
            Browse All Categories
          </Button>
        </div>
      </div>
    )
  }

  const sampleThreads = threadsData?.threads?.slice(0, 3) || []

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
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

        <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
          <Eye className="w-4 h-4" />
          <span>Category Preview</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900">{category.name}</h1>
      </div>

      {/* Category Overview Card */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-semibold text-slate-900">
                  {category.name}
                </h2>
                <div className="flex items-center gap-2">
                  {category.is_private && (
                    <Badge variant="secondary" className="text-xs">
                      <Lock className="w-3 h-3 mr-1" />
                      Private
                    </Badge>
                  )}
                  {category.is_locked && (
                    <Badge
                      variant="outline"
                      className="text-xs text-amber-700 border-amber-200"
                    >
                      Locked
                    </Badge>
                  )}
                </div>
              </div>

              {category.description && (
                <p className="text-slate-600 mb-4">{category.description}</p>
              )}

              <div className="flex items-center gap-6 text-sm text-slate-600">
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{category.thread_count} threads</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Created {new Date(category.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>
                    Updated {new Date(category.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            {category.is_private ? (
              <>
                <Button
                  size="sm"
                  onClick={() => navigate("/login")}
                  className="flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In to Access
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/register")}
                >
                  Create Account
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  onClick={() => navigate(`/categories/${category.id}`)}
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Full Category
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    navigate(`/threads/new?category_id=${category.id}`)
                  }
                >
                  Create Thread
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sample Threads Preview */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Recent Discussions
          </h3>
          {!category.is_private && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/categories/${category.id}`)}
            >
              View All
            </Button>
          )}
        </div>

        {threadsLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-20 bg-slate-200 rounded animate-pulse"
              ></div>
            ))}
          </div>
        ) : sampleThreads.length > 0 ? (
          <div className="space-y-4">
            {sampleThreads.map((thread: Thread) => (
              <Card
                key={thread.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900 mb-1 line-clamp-1">
                        {thread.title}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span>by {thread.author_username}</span>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          <span>{thread.reply_count} replies</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{thread.view_count} views</span>
                        </div>
                        <span>
                          {new Date(thread.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {!category.is_private && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/threads/${thread.id}`)}
                      >
                        Read
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600">
                No discussions yet in this category
              </p>
              {!category.is_private && !category.is_locked && (
                <Button
                  className="mt-4"
                  onClick={() =>
                    navigate(`/threads/new?category_id=${category.id}`)
                  }
                >
                  Start the First Discussion
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Call to Action */}
      {!category.is_private && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <h4 className="text-lg font-semibold text-slate-900 mb-2">
              Join the Discussion
            </h4>
            <p className="text-slate-600 mb-4">
              Become part of the {category.name} community and share your
              thoughts
            </p>
            <div className="flex justify-center gap-3">
              <Button onClick={() => navigate(`/categories/${category.id}`)}>
                Explore Category
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  navigate(`/threads/new?category_id=${category.id}`)
                }
              >
                Create Thread
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
