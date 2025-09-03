import { useContext } from "react"
import { ToastContext } from "./toast-context"
import { ToastVariant } from "./toast"

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

// Helper types for the toast API
export interface ToastOptions {
  title: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

export type ToastFunction = (options: ToastOptions) => string
