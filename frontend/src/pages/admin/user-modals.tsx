import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ConfirmationModal } from "@/components/ui/modal"
import type { UserProfile } from "@/types/api"
import {
  banUser,
  unbanUser,
  promoteToAdmin,
  promoteToModerator,
} from "@/services/users"
import { useToast } from "@/components/ui/use-toast"

function getErrorMessage(err: unknown): string {
  if (typeof err === "string") return err
  if (err instanceof Error) return err.message
  if (err && typeof err === "object") {
    const e = err as {
      message?: unknown
      response?: { data?: { message?: unknown } }
    }
    const apiMsg = e.response?.data?.message
    if (typeof apiMsg === "string") return apiMsg
    if (typeof e.message === "string") return e.message
  }
  return "Unknown error"
}

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
  const { toast } = useToast()
  const qc = useQueryClient()
  const { mutate, isPending } = useMutation({
    mutationFn: async ({
      userId,
      reason,
      duration,
    }: {
      userId: string
      reason: string
      duration?: number
    }) => {
      await banUser(userId, { reason, duration })
    },
    onSuccess: async () => {
      toast({
        title: "User banned",
        description: `${user?.username} has been banned.`,
      })
      await qc.invalidateQueries({ queryKey: ["users"] })
      setBanReason("")
      setBanDuration(undefined)
      onClose()
    },
    onError: (err: unknown) => {
      const message = getErrorMessage(err)
      toast({
        title: "Failed to ban user",
        description: message,
        variant: "error",
      })
    },
  })

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
  const { toast } = useToast()
  const qc = useQueryClient()
  const { mutate, isPending } = useMutation({
    mutationFn: async (userId: string) => {
      await unbanUser(userId)
    },
    onSuccess: async () => {
      toast({
        title: "User unbanned",
        description: `${user?.username} has been unbanned.`,
      })
      await qc.invalidateQueries({ queryKey: ["users"] })
      onClose()
    },
    onError: (err: unknown) => {
      const message = getErrorMessage(err)
      toast({
        title: "Failed to unban user",
        description: message,
        variant: "error",
      })
    },
  })

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
  const { toast } = useToast()
  const qc = useQueryClient()
  const { mutate, isPending } = useMutation({
    mutationFn: async ({
      userId,
      toRole,
    }: {
      userId: string
      toRole: "moderator" | "admin"
    }) => {
      if (toRole === "moderator") {
        await promoteToModerator(userId)
      } else {
        await promoteToAdmin(userId)
      }
    },
    onSuccess: async (_data, variables) => {
      toast({
        title: "User promoted",
        description: `${user?.username} is now a ${variables.toRole}.`,
      })
      await qc.invalidateQueries({ queryKey: ["users"] })
      onClose()
    },
    onError: (err: unknown) => {
      const message = getErrorMessage(err)
      toast({
        title: "Failed to promote user",
        description: message,
        variant: "error",
      })
    },
  })

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
