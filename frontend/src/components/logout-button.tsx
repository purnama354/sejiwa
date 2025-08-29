import { useAuthStore, type AuthState } from "@/store/auth"

export default function LogoutButton() {
  const clear = useAuthStore((s: AuthState) => s.clearSession)
  return (
    <button
      onClick={() => clear()}
      className="rounded-md border px-3 py-1.5 text-sm hover:bg-secondary"
    >
      Logout
    </button>
  )
}
