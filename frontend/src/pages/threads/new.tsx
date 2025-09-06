import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft, Lock, MessageSquare, Sparkles } from "lucide-react"
import { createThread } from "@/services/threads"
import { listCategories } from "@/services/categories"
import type { CreateThreadRequest, Category } from "@/types/api"
import { toast } from "sonner"

export default function CreateThreadPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedCategoryId = searchParams.get("category_id")

  const [formData, setFormData] = useState<CreateThreadRequest>({
    title: "",
    content: "",
    category_id: preselectedCategoryId || "",
    is_private: false,
    password: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch categories for dropdown
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<
    Category[]
  >({
    queryKey: ["categories"],
    queryFn: listCategories,
  })

  // Set preselected category if available
  useEffect(() => {
    if (preselectedCategoryId && categories) {
      const categoryExists = categories.find(
        (cat) => cat.id === preselectedCategoryId
      )
      if (categoryExists) {
        setFormData((prev) => ({ ...prev, category_id: preselectedCategoryId }))
      }
    }
  }, [preselectedCategoryId, categories])

  // Create thread mutation
  const createThreadMutation = useMutation({
    mutationFn: createThread,
    onSuccess: (thread) => {
      toast.success("Thread created successfully!")
      navigate(`/threads/${thread.id}`)
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
      console.error("Create thread error:", error)

      // Handle validation errors
      if (error.response?.status === 400 && error.response?.data?.details) {
        const validationErrors: Record<string, string> = {}
        error.response.data.details.forEach(
          (detail: { field: string; message: string }) => {
            validationErrors[detail.field] = detail.message
          }
        )
        setErrors(validationErrors)
      } else if (error.response?.status === 403) {
        toast.error("You don't have permission to post in this category")
      } else if (error.response?.status === 423) {
        toast.error("This category is locked and not accepting new threads")
      } else {
        toast.error(error.response?.data?.message || "Failed to create thread")
      }
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Basic client-side validation
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    } else if (formData.title.length < 5) {
      newErrors.title = "Title must be at least 5 characters"
    } else if (formData.title.length > 255) {
      newErrors.title = "Title must be less than 255 characters"
    }

    if (!formData.content.trim()) {
      newErrors.content = "Content is required"
    } else if (formData.content.length < 10) {
      newErrors.content = "Content must be at least 10 characters"
    } else if (formData.content.length > 10000) {
      newErrors.content = "Content must be less than 10,000 characters"
    }

    if (!formData.category_id) {
      newErrors.category_id = "Please select a category"
    }

    if (
      formData.is_private &&
      formData.password &&
      formData.password.length > 0 &&
      formData.password.length < 4
    ) {
      newErrors.password = "Password must be at least 4 characters"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const payload: CreateThreadRequest = {
      title: formData.title,
      content: formData.content,
      category_id: formData.category_id,
    }
    if (formData.is_private) {
      payload.is_private = true
      // Only include password if it's provided and meets minimum length
      if (formData.password && formData.password.length >= 4) {
        payload.password = formData.password
      }
      // Don't include password field at all if it's empty or too short
    }
    createThreadMutation.mutate(payload)
  }

  const handleInputChange = (
    field: keyof CreateThreadRequest,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  // Categories load errors are surfaced by empty dropdown; optional improvement: show inline error.

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header with consistent styling */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-slate-200/60 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="h-4 w-px bg-slate-300"></div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                Create New Thread
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 rounded-full blur-2xl" />

          <CardHeader className="text-center relative">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold text-slate-900">
                Share Your Thoughts
              </CardTitle>
            </div>
            <p className="text-slate-600 text-lg">
              Start a meaningful discussion with the community
            </p>
          </CardHeader>

          <CardContent className="relative">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Category Selection */}
              <div className="space-y-3">
                <Label
                  htmlFor="category"
                  className="text-base font-semibold text-slate-900 flex items-center gap-2"
                >
                  <div className="w-5 h-5 rounded bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
                    <span className="text-white text-xs">1</span>
                  </div>
                  Choose a Category
                </Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value: string) =>
                    handleInputChange("category_id", value)
                  }
                  disabled={categoriesLoading}
                >
                  <SelectTrigger className="h-12 text-base border-slate-300 focus:border-blue-500 focus:ring-blue-500 bg-white/80 backdrop-blur-sm">
                    <SelectValue placeholder="Select the most relevant category for your thread" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading categories...
                      </SelectItem>
                    ) : (
                      categories?.map((category: Category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <span>{category.name}</span>
                            {category.is_private && (
                              <span className="text-blue-600">🔒</span>
                            )}
                            {category.is_locked && (
                              <span className="text-amber-600">🚫</span>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.category_id && (
                  <p className="text-red-600 text-sm flex items-center gap-2">
                    <div className="w-1 h-1 bg-red-600 rounded-full"></div>
                    {errors.category_id}
                  </p>
                )}
              </div>

              {/* Title Input */}
              <div className="space-y-3">
                <Label
                  htmlFor="title"
                  className="text-base font-semibold text-slate-900 flex items-center gap-2"
                >
                  <div className="w-5 h-5 rounded bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                    <span className="text-white text-xs">2</span>
                  </div>
                  Thread Title
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Write a clear, descriptive title for your thread..."
                  maxLength={255}
                  className={`h-12 text-base transition-all duration-200 bg-white/80 backdrop-blur-sm ${
                    errors.title
                      ? "border-red-500 focus:border-red-500"
                      : "border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                />
                <div className="flex justify-between text-sm">
                  <span>
                    {errors.title && (
                      <span className="text-red-600 flex items-center gap-2">
                        <div className="w-1 h-1 bg-red-600 rounded-full"></div>
                        {errors.title}
                      </span>
                    )}
                  </span>
                  <span
                    className={`${
                      formData.title.length > 200
                        ? "text-orange-600"
                        : "text-slate-500"
                    }`}
                  >
                    {formData.title.length}/255
                  </span>
                </div>
              </div>

              {/* Content Textarea */}
              <div className="space-y-3">
                <Label
                  htmlFor="content"
                  className="text-base font-semibold text-slate-900 flex items-center gap-2"
                >
                  <div className="w-5 h-5 rounded bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                    <span className="text-white text-xs">3</span>
                  </div>
                  Thread Content
                </Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    handleInputChange("content", e.target.value)
                  }
                  placeholder="Share your thoughts, experiences, questions, or start a discussion...

You can include:
• Personal experiences or stories
• Questions you'd like answered
• Resources or tips you'd like to share
• Topics you'd like to discuss with the community"
                  rows={12}
                  maxLength={10000}
                  className={`text-base transition-all duration-200 bg-white/80 backdrop-blur-sm ${
                    errors.content
                      ? "border-red-500 focus:border-red-500"
                      : "border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                />
                <div className="flex justify-between text-sm">
                  <span>
                    {errors.content && (
                      <span className="text-red-600 flex items-center gap-2">
                        <div className="w-1 h-1 bg-red-600 rounded-full"></div>
                        {errors.content}
                      </span>
                    )}
                  </span>
                  <span
                    className={`${
                      formData.content.length > 9000
                        ? "text-orange-600"
                        : "text-slate-500"
                    }`}
                  >
                    {formData.content.length}/10,000
                  </span>
                </div>
              </div>

              {/* Privacy options */}
              <div className="space-y-4">
                <Label className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center">
                    <span className="text-white text-xs">4</span>
                  </div>
                  Privacy Settings
                </Label>
                <div className="bg-slate-50/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200/60">
                  <div className="flex items-start gap-3">
                    <input
                      id="is_private"
                      type="checkbox"
                      checked={!!formData.is_private}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          is_private: e.target.checked,
                          password: e.target.checked ? p.password : "",
                        }))
                      }
                      className="h-4 w-4 mt-1 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor="is_private"
                        className="text-slate-700 font-medium cursor-pointer"
                      >
                        Make this thread private
                      </Label>
                      <p className="text-sm text-slate-600 mt-1">
                        Private threads require a password to view and are only
                        accessible to users who know the password.
                      </p>
                    </div>
                  </div>

                  {formData.is_private && (
                    <div className="mt-4 pt-4 border-t border-slate-200/60">
                      <Label
                        htmlFor="thread_password"
                        className="text-sm font-medium text-slate-700 flex items-center gap-2"
                      >
                        <Lock className="w-4 h-4" />
                        Thread Password
                      </Label>
                      <Input
                        id="thread_password"
                        type="password"
                        value={formData.password || ""}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                        placeholder="Enter a secure password (minimum 4 characters)"
                        className="mt-2 h-10 text-sm bg-white/80 backdrop-blur-sm"
                      />
                      {errors.password && (
                        <p className="text-red-600 text-sm flex items-center gap-2 mt-2">
                          <div className="w-1 h-1 bg-red-600 rounded-full"></div>
                          {errors.password}
                        </p>
                      )}
                      <p className="text-xs text-slate-500 mt-2">
                        Choose a strong password that you can share with trusted
                        users who should have access to this thread.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6 border-t border-slate-200/60">
                <Button
                  type="submit"
                  disabled={createThreadMutation.isPending || categoriesLoading}
                  className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-400 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {createThreadMutation.isPending && (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  )}
                  {createThreadMutation.isPending
                    ? "Creating Thread..."
                    : "Create Thread"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={createThreadMutation.isPending}
                  className="h-12 text-base border-slate-300 hover:bg-slate-50/80 backdrop-blur-sm transition-all duration-300"
                >
                  Cancel
                </Button>
              </div>

              {/* Helper text */}
              <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border border-blue-200/60 rounded-xl p-6 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-blue-900">
                      Tips for a great thread:
                    </h4>
                    <ul className="space-y-2 text-blue-800">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Be clear and specific in your title</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Provide context and background information</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Be respectful and considerate of others</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>
                          Use appropriate categories to help others find your
                          content
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
