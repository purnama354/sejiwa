import { useState } from "react"
import { ConfirmationModal } from "@/components/ui/modal"
import type { UserProfile } from "@/types/api"

export function BanUserModal({
  isOpen,
  onClose,
  user,
}: {
  isOpen: boolean
  onClose: () => void
  user: UserProfile | null
}) {
  const [banReason, setBanReason] = useState("")
  const [banDuration, setBanDuration] = useState<number | undefined>(undefined)

  // Mock mutation with toast notification
  const isPending = false
  const mutate = ({
    userId,
    reason,
    duration,
  }: {
    userId: string
    reason: string
    duration?: number
  }) => {
    // In a real implementation, we would import useToast from '@/components/ui/use-toast'
    // const { toast } = useToast()
    // toast({ title: "User banned successfully" })
    alert(
      `Mock ban user API called with userId: ${userId}, reason: ${reason}, duration: ${
        duration || "permanent"
      }`
    )
    onClose()
    setBanReason("")
    setBanDuration(undefined)
  }

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={() => {
        if (user) {
          mutate({
            userId: user.id,
            reason: banReason,
            duration: banDuration,
          })
        }
      }}
      title="Ban User"
      variant="danger"
      confirmText="Ban User"
      isLoading={isPending}
      message={
        <div className="space-y-4">
          <p>
            Are you sure you want to ban{" "}
            <span className="font-medium">{user?.username}</span>?
          </p>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Reason for ban
            </label>
            <textarea
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              rows={3}
              placeholder="Provide a reason for the ban"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Ban Duration (days, leave empty for permanent)
            </label>
            <input
              type="number"
              min="1"
              value={banDuration || ""}
              onChange={(e) => {
                const val = e.target.value
                  ? parseInt(e.target.value, 10)
                  : undefined
                setBanDuration(val)
              }}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="Number of days"
            />
          </div>
        </div>
      }
    />
  )
}

export function UnbanUserModal({
  isOpen,
  onClose,
  user,
}: {
  isOpen: boolean
  onClose: () => void
  user: UserProfile | null
}) {
  // Mock mutation with toast notification
  const isPending = false
  const mutate = (userId: string) => {
    // In a real implementation, we would import useToast from '@/components/ui/use-toast'
    // const { toast } = useToast()
    // toast({ title: "User unbanned successfully", variant: "success" })
    alert(`Mock unban user API called with userId: ${userId}`)
    onClose()
  }

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={() => {
        if (user) {
          mutate(user.id)
        }
      }}
      title="Unban User"
      variant="info"
      confirmText="Unban User"
      isLoading={isPending}
      message={
        <p>
          Are you sure you want to unban{" "}
          <span className="font-medium">{user?.username}</span>?
        </p>
      }
    />
  )
}

export function PromoteUserModal({
  isOpen,
  onClose,
  user,
}: {
  isOpen: boolean
  onClose: () => void
  user: UserProfile | null
}) {
  // Mock mutation with toast notification
  const isPending = false
  const mutate = ({
    userId,
    toRole,
  }: {
    userId: string
    toRole: "moderator" | "admin"
  }) => {
    // In a real implementation, we would import useToast from '@/components/ui/use-toast'
    // const { toast } = useToast()
    // toast({
    //   title: `User promoted to ${toRole} successfully`,
    //   variant: "success",
    //   description: `User has been granted ${toRole} permissions`
    // })
    alert(
      `Mock promote user API called with userId: ${userId}, toRole: ${toRole}`
    )
    onClose()
  }

  const nextRole =
    user?.role === "user"
      ? "moderator"
      : user?.role === "moderator"
      ? "admin"
      : ""

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={() => {
        if (user && nextRole) {
          mutate({
            userId: user.id,
            toRole: nextRole as "moderator" | "admin",
          })
        }
      }}
      title={`Promote ${user?.username || ""}`}
      variant="warning"
      confirmText="Promote"
      isLoading={isPending}
      message={
        <p>
          Are you sure you want to promote{" "}
          <span className="font-medium">{user?.username}</span> to{" "}
          <span className="font-medium">{nextRole}</span>?
        </p>
      }
    />
  )
}
