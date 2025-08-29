// Shared API response types based on swagger.yaml

export type ApiErrorDetail = {
  field: string
  code: string
  message: string
}

export type ErrorResponse = {
  success: boolean
  message: string
  error: string
  code: string
  details?: ApiErrorDetail[]
  timestamp: string
}

export type UserProfile = {
  id: string
  username: string
  role: "user" | "moderator" | "admin"
  status: "active" | "inactive" | "suspended"
  created_at: string
  updated_at: string
  last_active_at: string
  thread_count: number
  reply_count: number
}

export type AuthResponse = {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  user: UserProfile
}
