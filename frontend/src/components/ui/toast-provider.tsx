import React, { useState, useCallback } from "react"
import { Toast } from "./toast"
import type { ToastProps, ToastVariant } from "./toast"
import { createPortal } from "react-dom"
import { ToastContext } from "./toast-context"

export function ToastProvider({ children }: { children: React.ReactNode }) {
  type ToastItem = ToastProps & { exiting?: boolean }
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) =>
      prevToasts.map((toast) =>
        toast.id === id ? { ...toast, exiting: true } : toast
      )
    )

    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
    }, 300) // Animation duration
  }, [])

  const toast = useCallback(
    ({
      title,
      description,
      variant = "info",
      duration = 5000,
    }: {
      title: string
      description?: string
      variant?: ToastVariant
      duration?: number
    }) => {
      const id = Math.random().toString(36).substr(2, 9)

      const newToast: ToastProps = {
        id,
        title,
        description,
        variant,
        duration,
        onClose: () => removeToast(id),
      }

      setToasts((prevToasts) => [...prevToasts, newToast])

      if (duration !== Infinity) {
        setTimeout(() => {
          removeToast(id)
        }, duration)
      }

      return id
    },
    [removeToast]
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {typeof document !== "undefined" &&
        createPortal(
          <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
            {toasts.map((toast: ToastItem) => (
              <div
                key={toast.id}
                className={toast.exiting ? "toast-exit" : "toast-enter"}
              >
                <Toast {...toast} />
              </div>
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  )
}
