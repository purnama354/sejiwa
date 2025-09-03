import type { PropsWithChildren } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuthStore, type AuthState } from "@/store/auth"
import { defaultRouteForRole } from "@/lib/auth"

type Allowed = "user" | "moderator" | "admin"

export default function RoleRoute({
  children,
  allow,
}: PropsWithChildren<{ allow: Allowed[] }>) {
  const location = useLocation()
  const accessToken = useAuthStore((s: AuthState) => s.accessToken)
  const role = useAuthStore((s: AuthState) => s.user?.role)

  if (!accessToken)
    return <Navigate to="/login" replace state={{ from: location }} />

  // If user isn't in the allowed roles, redirect to dashboard
  if (!role || !allow.includes(role as Allowed)) {
    const target = role ? defaultRouteForRole(role as Allowed) : "/dashboard"
    return <Navigate to={target} replace />
  }

  // No special-casing. Use explicit allowlists per route.

  return children
}
