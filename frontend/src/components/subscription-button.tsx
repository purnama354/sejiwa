import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Heart, HeartOff, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { getUserCategories } from "@/services/user"
import api from "@/lib/api"

interface SubscriptionButtonProps {
  categoryId: string
  categoryName: string
  isSubscribed?: boolean
  variant?: "default" | "compact"
}

export default function SubscriptionButton({
  categoryId,
  categoryName,
  isSubscribed: initialSubscribed,
  variant = "default",
}: SubscriptionButtonProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Get current subscription status from user categories
  const { data: userCategories } = useQuery({
    queryKey: ["user-categories"],
    queryFn: getUserCategories,
    staleTime: 5 * 60 * 1000,
  })

  const isSubscribed =
    initialSubscribed ??
    userCategories?.some((cat) => cat.id === categoryId) ??
    false

  const subscribeMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/api/v1/users/me/subscriptions", {
        category_id: categoryId,
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-categories"] })
      queryClient.invalidateQueries({ queryKey: ["user-stats"] })
      toast({
        title: "Subscribed!",
        description: `You're now following ${categoryName}.`,
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive",
      })
    },
  })

  const unsubscribeMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.delete("/api/v1/users/me/subscriptions", {
        data: { category_id: categoryId },
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-categories"] })
      queryClient.invalidateQueries({ queryKey: ["user-stats"] })
      toast({
        title: "Unsubscribed",
        description: `You're no longer following ${categoryName}.`,
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to unsubscribe. Please try again.",
        variant: "destructive",
      })
    },
  })

  const handleToggleSubscription = () => {
    if (isSubscribed) {
      unsubscribeMutation.mutate()
    } else {
      subscribeMutation.mutate()
    }
  }

  const isPending = subscribeMutation.isPending || unsubscribeMutation.isPending

  if (variant === "compact") {
    return (
      <Button
        variant={isSubscribed ? "secondary" : "default"}
        size="sm"
        onClick={handleToggleSubscription}
        disabled={isPending}
        className="flex items-center gap-1"
      >
        {isSubscribed ? (
          <>
            <Minus className="w-3 h-3" />
            Unfollow
          </>
        ) : (
          <>
            <Plus className="w-3 h-3" />
            Follow
          </>
        )}
      </Button>
    )
  }

  return (
    <Button
      variant={isSubscribed ? "outline" : "default"}
      onClick={handleToggleSubscription}
      disabled={isPending}
      className="flex items-center gap-2"
    >
      {isSubscribed ? (
        <>
          <HeartOff className="w-4 h-4" />
          Unsubscribe
        </>
      ) : (
        <>
          <Heart className="w-4 h-4" />
          Subscribe
        </>
      )}
    </Button>
  )
}
