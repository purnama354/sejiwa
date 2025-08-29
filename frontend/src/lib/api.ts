import axios from "axios"
import storage from "@/lib/storage"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  withCredentials: false,
})

// Token management (in-memory; synced by store)
let accessToken: string | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

export default api

// Global 401 handling: clear session and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // If already on auth pages, just surface error
      if (
        typeof location !== "undefined" &&
        (location.pathname.startsWith("/login") ||
          location.pathname.startsWith("/register"))
      ) {
        return Promise.reject(err)
      }
      storage.setAccessToken(null)
      storage.setRefreshToken(null)
      storage.setUser(null)
      setAccessToken(null)
      // Avoid redirect loops during auth calls
      if (!location.pathname.startsWith("/login")) {
        window.location.href = "/login"
      }
    }
    return Promise.reject(err)
  }
)
