import type { UserProfile } from "@/types/api"

const ACCESS_TOKEN_KEY = "sjw_access_token"
const REFRESH_TOKEN_KEY = "sjw_refresh_token"
const USER_KEY = "sjw_user"

export const storage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  setAccessToken: (t: string | null) =>
    t
      ? localStorage.setItem(ACCESS_TOKEN_KEY, t)
      : localStorage.removeItem(ACCESS_TOKEN_KEY),

  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setRefreshToken: (t: string | null) =>
    t
      ? localStorage.setItem(REFRESH_TOKEN_KEY, t)
      : localStorage.removeItem(REFRESH_TOKEN_KEY),

  getUser: (): UserProfile | null => {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as UserProfile) : null
  },
  setUser: (u: UserProfile | null) =>
    u
      ? localStorage.setItem(USER_KEY, JSON.stringify(u))
      : localStorage.removeItem(USER_KEY),
}

export default storage
