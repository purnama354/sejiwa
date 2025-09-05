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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
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
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch categories for dropdown
  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery({
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

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    createThreadMutation.mutate(formData)
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

  if (categoriesError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load categories. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Create New Thread</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value: string) =>
                  handleInputChange("category_id", value)
                }
                disabled={categoriesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categoriesLoading ? (
                    <SelectItem value="" disabled>
                      Loading categories...
                    </SelectItem>
                  ) : (
                    categories?.map((category: Category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                        {category.is_private && " 🔒"}
                        {category.is_locked && " 🚫"}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.category_id && (
                <p className="text-sm text-red-600">{errors.category_id}</p>
              )}
            </div>

            {/* Title Input */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter thread title..."
                maxLength={255}
                className={errors.title ? "border-red-500" : ""}
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>
                  {errors.title && (
                    <span className="text-red-600">{errors.title}</span>
                  )}
                </span>
                <span>{formData.title.length}/255</span>
              </div>
            </div>

            {/* Content Textarea */}
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleInputChange("content", e.target.value)
                }
                placeholder="Share your thoughts..."
                rows={8}
                maxLength={10000}
                className={errors.content ? "border-red-500" : ""}
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>
                  {errors.content && (
                    <span className="text-red-600">{errors.content}</span>
                  )}
                </span>
                <span>{formData.content.length}/10,000</span>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={createThreadMutation.isPending || categoriesLoading}
                className="flex-1"
              >
                {createThreadMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Thread
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={createThreadMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
