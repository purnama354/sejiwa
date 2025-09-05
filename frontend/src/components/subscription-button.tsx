import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Heart, HeartOff, Plus, Minus, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { getUserCategories } from "@/services/user"
import api from "@/lib/api"
import { useState } from "react"
import JoinCategoryModal from "@/components/join-category-modal"

interface SubscriptionButtonProps {
  categoryId: string
  categoryName: string
  isSubscribed?: boolean
  variant?: "default" | "compact"
  isPrivate?: boolean
}

export default function SubscriptionButton({
  categoryId,
  categoryName,
  isSubscribed: initialSubscribed,
  variant = "default",
  isPrivate = false,
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
    mutationFn: async (password?: string) => {
      const { data } = await api.post("/users/me/subscriptions", {
        category_id: categoryId,
        password,
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
        variant: "error",
      })
    },
  })

  const unsubscribeMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.delete("/users/me/subscriptions", {
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
        variant: "error",
      })
    },
  })

  const [showJoin, setShowJoin] = useState(false)

  const handleToggleSubscription = async () => {
    if (isSubscribed) {
      unsubscribeMutation.mutate()
    } else {
      try {
        await subscribeMutation.mutateAsync(undefined)
      } catch (e) {
        const status = (e as { response?: { status?: number } })?.response
          ?.status
        const code = (e as { response?: { data?: { code?: string } } })
          ?.response?.data?.code
        if (
          (status === 400 && code === "PASSWORD_REQUIRED") ||
          status === 403
        ) {
          setShowJoin(true)
        } else if (status === 401 && code === "INVALID_PASSWORD") {
          toast({
            title: "Invalid password",
            description: "Please try again.",
            variant: "error",
          })
        }
      }
    }
  }

  const isPending = subscribeMutation.isPending || unsubscribeMutation.isPending

  if (variant === "compact") {
    return (
      <>
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
        <JoinCategoryModal
          isOpen={showJoin}
          onClose={() => setShowJoin(false)}
          categoryId={categoryId}
          categoryName={categoryName}
        />
      </>
    )
  }

  return (
    <>
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
            {isPrivate ? (
              <Lock className="w-4 h-4" />
            ) : (
              <Heart className="w-4 h-4" />
            )}
            {isPrivate ? "Join" : "Subscribe"}
          </>
        )}
      </Button>
      <JoinCategoryModal
        isOpen={showJoin}
        onClose={() => setShowJoin(false)}
        categoryId={categoryId}
        categoryName={categoryName}
      />
    </>
  )
}
