import { Outlet, Link } from "react-router-dom"
import { useAuthStore, type AuthState } from "@/store/auth"
import LogoutButton from "@/components/logout-button"
import { Button } from "@/components/ui/button"
import { Heart, Shield } from "lucide-react"
import "./App.css"

export default function App() {
  const isAuthed = useAuthStore((s: AuthState) => Boolean(s.accessToken))
  const user = useAuthStore((s: AuthState) => s.user)
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Sejiwa
            </span>
          </Link>
          <nav className="ml-auto flex items-center gap-3">
            {isAuthed ? (
              <>
                <Link
                  to="/"
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
                >
                  Home
                </Link>
                {user?.role === "admin" && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </Link>
                )}
                {user?.role === "moderator" && (
                  <Link
                    to="/moderation"
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
                  >
                    <Shield className="w-4 h-4" />
                    Moderation
                  </Link>
                )}
                <div className="flex items-center gap-3 pl-3 border-l border-border">
                  <span className="text-sm font-medium text-foreground">
                    {user?.username}
                  </span>
                  <LogoutButton />
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link to="/">Home</Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/register">Get started</Link>
                </Button>
              </div>
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
