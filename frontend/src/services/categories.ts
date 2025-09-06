import api from "@/lib/api"
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/types/api"

export async function listCategories() {
  const res = await api.get<Category[]>(`/categories`)
  return res.data
}

export async function listAdminCategories() {
  const res = await api.get<Category[]>(`/admin/categories`)
  return res.data
}

export async function createCategory(body: CreateCategoryRequest) {
  const res = await api.post<Category>(`/categories`, body)
  return res.data
}

export async function updateCategory(id: string, body: UpdateCategoryRequest) {
  const res = await api.put<Category>(`/categories/${id}`, body)
  return res.data
}

export async function deleteCategory(id: string) {
  const res = await api.delete<{ success: boolean; message: string }>(
    `/categories/${id}`
  )
  return res.data
}
