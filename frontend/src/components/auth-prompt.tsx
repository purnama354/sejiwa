import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Lock, UserPlus, LogIn } from "lucide-react"

interface AuthPromptProps {
  title?: string
  description?: string
  action?: string
  variant?: "card" | "inline" | "banner"
  showCreateAccount?: boolean
}

export default function AuthPrompt({
  title = "Join the conversation",
  description = "Create an account to participate in discussions and connect with the community.",
  action = "view this content",
  variant = "card",
  showCreateAccount = true,
}: AuthPromptProps) {
  if (variant === "banner") {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-slate-900">{title}</p>
              <p className="text-sm text-slate-600">{description}</p>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button asChild variant="outline" size="sm">
              <Link to="/login">
                <LogIn className="w-4 h-4 mr-2" />
                Sign in
              </Link>
            </Button>
            {showCreateAccount && (
              <Button asChild size="sm">
                <Link to="/register">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Join now
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (variant === "inline") {
    return (
      <div className="text-center py-6 px-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center mx-auto mb-3">
          <Lock className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-600 mb-4 max-w-sm mx-auto">{description}</p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button asChild variant="outline" size="sm">
            <Link to="/login">
              <LogIn className="w-4 h-4 mr-2" />
              Sign in
            </Link>
          </Button>
          {showCreateAccount && (
            <Button asChild size="sm">
              <Link to="/register">
                <UserPlus className="w-4 h-4 mr-2" />
                Create account
              </Link>
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Default card variant
  return (
    <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
      <CardContent className="p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-600 mb-6 max-w-md mx-auto">{description}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="outline">
            <Link to="/login">
              <LogIn className="w-4 h-4 mr-2" />
              Sign in
            </Link>
          </Button>
          {showCreateAccount && (
            <Button asChild>
              <Link to="/register">
                <UserPlus className="w-4 h-4 mr-2" />
                Create account
              </Link>
            </Button>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-4">
          Join our anonymous community to {action}
        </p>
      </CardContent>
    </Card>
  )
}
