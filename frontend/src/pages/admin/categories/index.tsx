import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/services/categories"
import type { Category, CreateCategoryRequest } from "@/types/api"
import { Plus, Edit3, Trash2, Lock, Save, X, Folder, Hash } from "lucide-react"

export default function AdminCategories() {
  const qc = useQueryClient()
  const {
    data: categories,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
  })

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newCategory, setNewCategory] = useState<CreateCategoryRequest>({
    name: "",
    description: "",
  })

  const createMut = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] })
      setNewCategory({ name: "", description: "" })
      setShowCreateForm(false)
    },
  })

  const updateMut = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Category>) =>
      updateCategory(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  })

  const deleteMut = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  })

  const handleCreate = () => {
    if (newCategory.name.trim()) {
      createMut.mutate({
        name: newCategory.name.trim(),
        description: newCategory.description?.trim() || undefined,
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading categories...</div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 p-6">
        <div className="text-red-700">Failed to load categories</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Categories Management
          </h1>
          <p className="text-slate-600 mt-1">
            Organize and manage discussion categories
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200/60 p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">
              Create New Category
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Name
              </label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
                placeholder="Category name"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <input
                type="text"
                value={newCategory.description}
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    description: e.target.value,
                  })
                }
                placeholder="Optional description"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCreate}
              disabled={!newCategory.name.trim() || createMut.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              {createMut.isPending ? "Creating..." : "Create"}
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false)
                setNewCategory({ name: "", description: "" })
              }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories?.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onUpdate={(data) => updateMut.mutate({ id: category.id, ...data })}
            onDelete={() => {
              if (window.confirm(`Delete category "${category.name}"?`)) {
                deleteMut.mutate(category.id)
              }
            }}
            isUpdating={updateMut.isPending}
            isDeleting={deleteMut.isPending}
          />
        ))}
      </div>

      {categories?.length === 0 && (
        <div className="text-center py-12">
          <Folder className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            No categories yet
          </h3>
          <p className="text-slate-600 mb-4">
            Create your first category to get started
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>
      )}
    </div>
  )
}

function CategoryCard({
  category,
  onUpdate,
  onDelete,
  isUpdating,
  isDeleting,
}: {
  category: Category
  onUpdate: (data: Partial<Category>) => void
  onDelete: () => void
  isUpdating: boolean
  isDeleting: boolean
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    name: category.name,
    description: category.description,
    is_locked: category.is_locked,
  })

  const handleSave = () => {
    onUpdate(editData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditData({
      name: category.name,
      description: category.description,
      is_locked: category.is_locked,
    })
    setIsEditing(false)
  }

  return (
    <div className="rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200/60 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              category.is_locked
                ? "bg-gradient-to-r from-red-500 to-pink-600"
                : "bg-gradient-to-r from-blue-500 to-indigo-600"
            }`}
          >
            <Folder className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              {category.is_locked && <Lock className="w-4 h-4 text-red-500" />}
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Category
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <input
            value={editData.name}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="Category name"
          />
          <textarea
            value={editData.description}
            onChange={(e) =>
              setEditData({ ...editData, description: e.target.value })
            }
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
            rows={2}
            placeholder="Description"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={editData.is_locked}
              onChange={(e) =>
                setEditData({ ...editData, is_locked: e.target.checked })
              }
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-slate-600">Lock category</span>
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isUpdating}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition-colors"
            >
              <Save className="w-3 h-3" />
              {isUpdating ? "Saving..." : "Save"}
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-500 text-white text-sm rounded-lg hover:bg-slate-600 transition-colors"
            >
              <X className="w-3 h-3" />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <h3 className="font-semibold text-slate-900 mb-1">{category.name}</h3>
          <p className="text-slate-600 text-sm mb-3 line-clamp-2">
            {category.description || "No description"}
          </p>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Hash className="w-3 h-3" />
              <span>{category.thread_count} threads</span>
            </div>
            <span className="font-mono">{category.slug}</span>
          </div>
        </div>
      )}
    </div>
  )
}
