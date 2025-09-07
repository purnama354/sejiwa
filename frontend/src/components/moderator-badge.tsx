import { Badge } from "@/components/ui/badge"
import { Crown, Shield } from "lucide-react"

interface ModeratorBadgeProps {
  role: "user" | "moderator" | "admin"
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
}

export default function ModeratorBadge({
  role,
  size = "sm",
  showLabel = false,
}: ModeratorBadgeProps) {
  if (role === "user") {
    return null
  }

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-sm px-2 py-1",
    lg: "text-base px-3 py-1.5",
  }

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }

  if (role === "admin") {
    return (
      <Badge
        className={`bg-purple-100 text-purple-800 border-purple-200 ${sizeClasses[size]} inline-flex items-center gap-1`}
      >
        <Crown className={iconSizes[size]} />
        {showLabel && "Admin"}
      </Badge>
    )
  }

  if (role === "moderator") {
    return (
      <Badge
        className={`bg-orange-100 text-orange-800 border-orange-200 ${sizeClasses[size]} inline-flex items-center gap-1`}
      >
        <Shield className={iconSizes[size]} />
        {showLabel && "Moderator"}
      </Badge>
    )
  }

  return null
}
