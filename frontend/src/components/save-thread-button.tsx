import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Bookmark, BookmarkCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { saveThread, unsaveThread } from "@/services/user"

interface SaveThreadButtonProps {
  threadId: string
  threadTitle: string
  isSaved?: boolean
  variant?: "default" | "compact"
}

export default function SaveThreadButton({
  threadId,
  threadTitle,
  isSaved = false,
  variant = "default",
}: SaveThreadButtonProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const saveMutation = useMutation({
    mutationFn: () => saveThread(threadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-threads"] })
      queryClient.invalidateQueries({ queryKey: ["user-stats"] })
      toast({
        title: "Thread saved",
        description: `"${threadTitle}" has been saved for later.`,
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save thread. Please try again.",
        variant: "destructive",
      })
    },
  })

  const unsaveMutation = useMutation({
    mutationFn: () => unsaveThread(threadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-threads"] })
      queryClient.invalidateQueries({ queryKey: ["user-stats"] })
      toast({
        title: "Thread unsaved",
        description: `"${threadTitle}" has been removed from saved.`,
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to unsave thread. Please try again.",
        variant: "destructive",
      })
    },
  })

  const handleToggleSave = () => {
    if (isSaved) {
      unsaveMutation.mutate()
    } else {
      saveMutation.mutate()
    }
  }

  const isPending = saveMutation.isPending || unsaveMutation.isPending

  return (
    <Button
      variant={isSaved ? "secondary" : "outline"}
      size={variant === "compact" ? "sm" : "default"}
      onClick={handleToggleSave}
      disabled={isPending}
      className="flex items-center gap-2"
    >
      {isSaved ? (
        <>
          <BookmarkCheck className="w-4 h-4" />
          {variant !== "compact" && "Saved"}
        </>
      ) : (
        <>
          <Bookmark className="w-4 h-4" />
          {variant !== "compact" && "Save"}
        </>
      )}
    </Button>
  )
}
