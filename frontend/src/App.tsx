import { Outlet, Link } from "react-router-dom"
import { useAuthStore, type AuthState } from "@/store/auth"
import LogoutButton from "@/components/logout-button"
import "./App.css"

export default function App() {
  const isAuthed = useAuthStore((s: AuthState) => s.isAuthenticated)
  const user = useAuthStore((s: AuthState) => s.user)
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
          <Link to="/" className="font-semibold">
            Sejiwa
          </Link>
          <nav className="ml-auto text-sm text-muted-foreground flex items-center gap-3">
            {isAuthed ? (
              <>
                {user?.role === "admin" && <Link to="/admin">Admin</Link>}
                {(user?.role === "admin" || user?.role === "moderator") && (
                  <Link to="/moderation">Moderation</Link>
                )}
                <span className="text-foreground">{user?.username}</span>
                <LogoutButton />
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t text-xs text-muted-foreground">
        <div className="mx-auto max-w-6xl px-4 py-4">
          © {new Date().getFullYear()} Sejiwa
        </div>
      </footer>
    </div>
  )
}
