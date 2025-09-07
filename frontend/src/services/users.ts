import api from "@/lib/api"
import type { UserProfile } from "@/types/api"

interface BanUserRequest {
  reason: string
  duration?: number // in days, if not provided or 0, it's permanent
  notify_user?: boolean
}

interface ActionResponse {
  success: boolean
  message: string
  user?: UserProfile
}

export async function banUser(
  userId: string,
  data: BanUserRequest
): Promise<ActionResponse> {
  const response = await api.post<ActionResponse>(
    `/moderation/users/${userId}/ban`,
    data
  )
  return response.data
}

export async function unbanUser(userId: string): Promise<ActionResponse> {
  const response = await api.post<ActionResponse>(
    `/moderation/users/${userId}/unban`
  )
  return response.data
}

export async function getUsers(params?: {
  role?: "user" | "moderator" | "admin"
  status?: "active" | "inactive" | "suspended"
  page?: number
  pageSize?: number
  query?: string
}): Promise<{
  items: UserProfile[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}> {
  const response = await api.get("/admin/users", { params })
  return response.data
}

export async function promoteToModerator(
  userId: string
): Promise<ActionResponse> {
  const response = await api.post<ActionResponse>(
    `/admin/users/${userId}/promote-to-moderator`
  )
  return response.data
}

export async function promoteToAdmin(userId: string): Promise<ActionResponse> {
  const response = await api.post<ActionResponse>(
    `/admin/users/${userId}/promote-to-admin`
  )
  return response.data
}

export async function getUsersForModeration(params?: {
  status?: string
  page?: number
  pageSize?: number
}): Promise<UserProfile[]> {
  const response = await api.get("/moderation/users", { params })
  return response.data
}
