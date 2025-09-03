import { defaultRouteForRole } from "@/lib/auth"

export type Allowed = "user" | "moderator" | "admin"

export function computeRedirect(
  role: Allowed | undefined,
  allow: Allowed[]
): string | null {
  if (!role) return "/login"
  if (!allow.includes(role)) return defaultRouteForRole(role)
  return null
}
