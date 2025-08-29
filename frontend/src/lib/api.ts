import axios from "axios"

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
