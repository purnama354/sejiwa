import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Search,
  Users,
  MessageSquare,
  Lock,
  ArrowLeft,
  Grid3X3,
  List,
  Clock,
} from "lucide-react"
import { listCategories } from "@/services/categories"
import SubscriptionButton from "@/components/subscription-button"
import type { Category } from "@/types/api"

type SortOption = "name" | "threads" | "recent" | "popular"
type ViewMode = "grid" | "list"

export default function CategoriesPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("popular")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")

  const {
    data: categories,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
  })

  // Filter and sort categories
  const filteredAndSortedCategories = categories
    ?.filter(
      (category: Category) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    ?.sort((a: Category, b: Category) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "threads":
          return (b.thread_count || 0) - (a.thread_count || 0)
        case "recent":
          return (
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          )
        case "popular":
        default:
          return (b.thread_count || 0) - (a.thread_count || 0)
      }
    })

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">
              Unable to load categories
            </h1>
            <p className="text-slate-600 mb-6">
              There was an error loading the categories. Please try again.
            </p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="h-4 w-px bg-slate-300"></div>
            <h1 className="text-3xl font-bold text-slate-900">
              Browse Categories
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <p className="text-slate-600">
              Explore topics and join discussions that matter to you
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">
                {categories?.length || 0} categories
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Sort and View Controls */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 border border-slate-300 rounded-md bg-white focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="popular">Most Popular</option>
              <option value="name">Alphabetical</option>
              <option value="threads">Most Threads</option>
              <option value="recent">Recently Updated</option>
            </select>

            <div className="flex border border-slate-300 rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${
                  viewMode === "grid"
                    ? "bg-blue-500 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${
                  viewMode === "list"
                    ? "bg-blue-500 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Categories Display */}
        {isLoading ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-slate-200 rounded w-2/3 mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="h-8 bg-slate-200 rounded w-20"></div>
                    <div className="h-6 bg-slate-200 rounded w-16"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredAndSortedCategories?.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No categories found
            </h3>
            <p className="text-slate-600 mb-6">
              {searchQuery
                ? `No categories match "${searchQuery}". Try adjusting your search.`
                : "No categories are available at the moment."}
            </p>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Grid View */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedCategories?.map((category: Category) => (
                  <Card
                    key={category.id}
                    className="shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all group"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {category.name}
                          </h3>
                          {category.is_private && (
                            <Badge
                              variant="secondary"
                              className="text-blue-700 bg-blue-100"
                            >
                              <Lock className="w-3 h-3 mr-1" />
                              Private
                            </Badge>
                          )}
                          {category.is_locked && (
                            <Badge
                              variant="outline"
                              className="text-amber-700 border-amber-300 bg-amber-50"
                            >
                              Locked
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        {category.description}
                      </p>
                    </CardHeader>

                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            <span>{category.thread_count || 0} threads</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              {new Date(
                                category.updated_at
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {category.is_private ? (
                          <SubscriptionButton
                            categoryId={category.id}
                            categoryName={category.name}
                            isPrivate
                            variant="default"
                            className="flex-1"
                          />
                        ) : (
                          <Button
                            onClick={() =>
                              navigate(`/categories/${category.id}`)
                            }
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                          >
                            <Users className="w-4 h-4 mr-2" />
                            Browse Threads
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === "list" && (
              <div className="space-y-4">
                {filteredAndSortedCategories?.map((category: Category) => (
                  <Card
                    key={category.id}
                    className="shadow-md border-0 bg-white/90 backdrop-blur-sm hover:shadow-lg transition-all group"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {category.name}
                            </h3>
                            {category.is_private && (
                              <Badge
                                variant="secondary"
                                className="text-blue-700 bg-blue-100"
                              >
                                <Lock className="w-3 h-3 mr-1" />
                                Private
                              </Badge>
                            )}
                            {category.is_locked && (
                              <Badge
                                variant="outline"
                                className="text-amber-700 border-amber-300 bg-amber-50"
                              >
                                Locked
                              </Badge>
                            )}
                          </div>
                          <p className="text-slate-600 mb-3 max-w-2xl">
                            {category.description}
                          </p>
                          <div className="flex items-center gap-6 text-sm text-slate-500">
                            <div className="flex items-center gap-1">
                              <MessageSquare className="w-4 h-4" />
                              <span>{category.thread_count || 0} threads</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>
                                Updated{" "}
                                {new Date(
                                  category.updated_at
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-6">
                          {category.is_private ? (
                            <SubscriptionButton
                              categoryId={category.id}
                              categoryName={category.name}
                              isPrivate
                              variant="default"
                            />
                          ) : (
                            <Button
                              onClick={() =>
                                navigate(`/categories/${category.id}`)
                              }
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Users className="w-4 h-4 mr-2" />
                              Browse Threads
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Quick Stats */}
        {!isLoading &&
          filteredAndSortedCategories &&
          filteredAndSortedCategories.length > 0 && (
            <div className="mt-12 bg-white/80 backdrop-blur-sm rounded-xl border p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Community Overview
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {filteredAndSortedCategories.length}
                  </div>
                  <div className="text-sm text-slate-600">Total Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {filteredAndSortedCategories.reduce(
                      (acc: number, cat: Category) =>
                        acc + (cat.thread_count || 0),
                      0
                    )}
                  </div>
                  <div className="text-sm text-slate-600">Total Threads</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {
                      filteredAndSortedCategories.filter(
                        (cat: Category) => cat.is_private
                      ).length
                    }
                  </div>
                  <div className="text-sm text-slate-600">
                    Private Categories
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  )
}
