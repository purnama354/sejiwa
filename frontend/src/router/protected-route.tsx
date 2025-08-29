import type { PropsWithChildren } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuthStore, type AuthState } from "@/store/auth"

function ProtectedRoute({ children }: PropsWithChildren) {
  const isAuthed = useAuthStore((s: AuthState) => s.isAuthenticated)
  const location = useLocation()

  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}

export default ProtectedRoute
