import type { PropsWithChildren } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuthStore, type AuthState } from "@/store/auth"

function ProtectedRoute({ children }: PropsWithChildren) {
  const accessToken = useAuthStore((s: AuthState) => s.accessToken)
  const location = useLocation()

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}

export default ProtectedRoute
