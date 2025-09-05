import { useEffect, useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import api from "@/lib/api"
import { useQueryClient } from "@tanstack/react-query"

type Props = {
  isOpen: boolean
  onClose: () => void
  categoryId: string
  categoryName?: string
}

export default function JoinCategoryModal({ isOpen, onClose, categoryId, categoryName }: Props) {
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()
  const qc = useQueryClient()

  useEffect(() => {
    if (!isOpen) {
      setPassword("")
      setSubmitting(false)
    }
  }, [isOpen])

  const onSubmit = async () => {
    setSubmitting(true)
    try {
      await api.post("/api/v1/users/me/subscriptions", {
        category_id: categoryId,
        password: password || undefined,
      })
      qc.invalidateQueries({ queryKey: ["user-categories"] })
      qc.invalidateQueries({ queryKey: ["user-stats"] })
      toast({ title: "Joined", description: `You're now following ${categoryName ?? "this category"}.`, variant: "success" })
      onClose()
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status
      const code = (err as { response?: { data?: { code?: string } } })?.response?.data?.code
      if (status === 400 && code === "PASSWORD_REQUIRED") {
        toast({ title: "Password required", description: "Please enter the category password.", variant: "warning" })
      } else if (status === 401 && code === "INVALID_PASSWORD") {
        toast({ title: "Invalid password", description: "Please try again.", variant: "error" })
      } else {
        toast({ title: "Failed to join", description: "Please try again.", variant: "error" })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Join ${categoryName ?? "Category"}`}
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button onClick={onSubmit} disabled={submitting}>{submitting ? "Joining..." : "Join"}</Button>
        </div>
      }
    >
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">If this category is password-protected, enter the password below. Leave it blank if not required.</p>
        <div className="grid gap-1.5">
          <Label htmlFor="join-password">Password (optional)</Label>
          <Input
            id="join-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
      </div>
    </Modal>
  )
}
