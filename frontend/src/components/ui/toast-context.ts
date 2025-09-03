import { createContext } from "react"
import { ToastOptions } from "./use-toast"

interface ToastContextValue {
  toast: (props: ToastOptions) => string
}

export const ToastContext = createContext<ToastContextValue | undefined>(
  undefined
)
