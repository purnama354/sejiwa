import api from "@/lib/api"
import type {
  CreateAdminRequest,
  CreateModeratorRequest,
  ModeratorProfile,
} from "@/types/api"

export async function createAdmin(body: CreateAdminRequest) {
  const res = await api.post<ModeratorProfile>(`/admin/auth/create-admin`, body)
  return res.data
}

export async function createModerator(body: CreateModeratorRequest) {
  const res = await api.post<ModeratorProfile>(
    `/admin/auth/create-moderator`,
    body
  )
  return res.data
}
