import type { PropsWithChildren } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuthStore, type AuthState } from "@/store/auth"
import { useToast } from "@/components/ui/use-toast"
import { computeRedirect } from "./guard-utils"

type Allowed = "user" | "moderator" | "admin"

export default function RoleRoute({
  children,
  allow,
}: PropsWithChildren<{ allow: Allowed[] }>) {
  const location = useLocation()
  const accessToken = useAuthStore((s: AuthState) => s.accessToken)
  const role = useAuthStore((s: AuthState) => s.user?.role)
  const { toast } = useToast()

  if (!accessToken)
    return <Navigate to="/login" replace state={{ from: location }} />

  // If user isn't in the allowed roles, redirect to dashboard
  if (!role || !allow.includes(role as Allowed)) {
    // Compute redirect target
    const target =
      computeRedirect(role as Allowed | undefined, allow) ?? "/dashboard"
    // Notify user
    toast({
      title: "Not authorized",
      description: "You don't have access to that section.",
      variant: "warning",
    })
    return <Navigate to={target} replace />
  }

  // No special-casing. Use explicit allowlists per route.

  return children
}
