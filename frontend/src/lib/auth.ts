export type Role = "user" | "moderator" | "admin"

export function defaultRouteForRole(role: Role): string {
  switch (role) {
    case "admin":
      return "/admin"
    case "moderator":
      return "/moderation"
    default:
      return "/dashboard"
  }
}
