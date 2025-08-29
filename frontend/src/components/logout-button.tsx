import { useAuthStore, type AuthState } from "@/store/auth"
import { useNavigate } from "react-router-dom"

export default function LogoutButton() {
  const clear = useAuthStore((s: AuthState) => s.clearSession)
  const navigate = useNavigate()
  return (
    <button
      onClick={() => {
        clear()
        navigate("/login", { replace: true })
      }}
      className="rounded-md border px-3 py-1.5 text-sm hover:bg-secondary"
    >
      Logout
    </button>
  )
}
