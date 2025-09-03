import * as React from "react"
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export type ToastVariant = "success" | "error" | "warning" | "info"

export interface ToastProps {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
  duration?: number
  onClose: () => void
}

// Add style to document head
if (typeof document !== "undefined") {
  const style = document.createElement("style")
  style.innerHTML = `
    .toast-enter {
      animation: toast-in 0.3s ease-out forwards;
    }
    .toast-exit {
      animation: toast-out 0.3s ease-in forwards;
    }
    @keyframes toast-in {
      0% { opacity: 0; transform: translateX(100%); }
      100% { opacity: 1; transform: translateX(0); }
    }
    @keyframes toast-out {
      0% { opacity: 1; transform: translateX(0); }
      100% { opacity: 0; transform: translateX(100%); }
    }
  `
  document.head.appendChild(style)
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ title, description, variant = "info", onClose }, ref) => {
    const variantStyles = {
      success: {
        container: "bg-green-50 border-green-200",
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        title: "text-green-800",
        description: "text-green-700",
      },
      error: {
        container: "bg-red-50 border-red-200",
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
        title: "text-red-800",
        description: "text-red-700",
      },
      warning: {
        container: "bg-amber-50 border-amber-200",
        icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
        title: "text-amber-800",
        description: "text-amber-700",
      },
      info: {
        container: "bg-blue-50 border-blue-200",
        icon: <Info className="h-5 w-5 text-blue-500" />,
        title: "text-blue-800",
        description: "text-blue-700",
      },
    }

    const styles = variantStyles[variant]

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border p-4 shadow-md relative overflow-hidden",
          styles.container
        )}
      >
        <div className="flex">
          <div className="flex-shrink-0">{styles.icon}</div>
          <div className="ml-3 flex-1">
            <p className={cn("font-medium text-sm", styles.title)}>{title}</p>
            {description && (
              <p className={cn("mt-1 text-sm", styles.description)}>
                {description}
              </p>
            )}
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              type="button"
              className="inline-flex rounded-md text-slate-400 hover:text-slate-500 focus:outline-none"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    )
  }
)

Toast.displayName = "Toast"

export { Toast }
