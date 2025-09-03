// A simplified toast implementation that doesn't trigger parser issues
// This is a basic wrapper that could be extended with proper toast components later

/**
 * Display a toast notification
 */
function showToast(
  message: string,
  type: "success" | "error" | "warning" | "info" = "info"
) {
  if (typeof document !== "undefined") {
    // Just using alert for now, but would use proper UI components in production
    console.log(`[${type.toUpperCase()}] ${message}`)
  }
}

/**
 * Simple toast interface
 */
const toast = {
  success: (message: string) => showToast(message, "success"),
  error: (message: string) => showToast(message, "error"),
  warning: (message: string) => showToast(message, "warning"),
  info: (message: string) => showToast(message, "info"),
}

export default toast
