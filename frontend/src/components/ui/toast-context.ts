import { createContext } from "react"
import type { ToastOptions } from "./use-toast"

interface ToastContextValue {
  toast: (props: ToastOptions) => string
}

export const ToastContext = createContext<ToastContextValue | undefined>(
  undefined
)
