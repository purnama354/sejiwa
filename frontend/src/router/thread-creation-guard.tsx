import { useAuthStore } from "@/store/auth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield } from "lucide-react"

interface ThreadCreationGuardProps {
  children: React.ReactNode
}

export default function ThreadCreationGuard({
  children,
}: ThreadCreationGuardProps) {
  const { user } = useAuthStore()

  // Admin users are not authorized to create threads
  if (user?.role === "admin") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Alert className="border-orange-200 bg-orange-50">
          <Shield className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Access Restricted:</strong> As an administrator, you are not
            authorized to create threads. Your role is focused on platform
            management and oversight. You can view and manage threads through
            the admin panel.
          </AlertDescription>
        </Alert>
        <div className="text-center mt-6">
          <p className="text-slate-600 mb-4">
            You can still access admin functions:
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => (window.location.href = "/admin")}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Admin Panel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
