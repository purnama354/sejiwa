import { Outlet, Link, useLocation } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
import { useAuthStore, type AuthState } from "@/store/auth"
import LogoutButton from "@/components/logout-button"
import { Button } from "@/components/ui/button"
import { Heart, Shield, Menu } from "lucide-react"
import "./App.css"

export default function App() {
  const isAuthed = useAuthStore((s: AuthState) => Boolean(s.accessToken))
  const user = useAuthStore((s: AuthState) => s.user)
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="mx-auto max-w-6xl px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2 sm:gap-4">
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
          {/* Desktop nav */}
          <nav className="ml-auto hidden sm:flex items-center gap-3">
            {isAuthed ? (
              <>
                <Link
                  to="/"
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
                >
                  Home
                </Link>
                {user?.role === "user" && (
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
                  >
                    Dashboard
                  </Link>
                )}
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
                  <span className="text-sm font-medium text-foreground hidden sm:inline">
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
          {/* Mobile menu toggle */}
          <MobileNav
            isAuthed={isAuthed}
            userRole={user?.role || null}
            username={user?.username || null}
          />
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

type MobileNavProps = {
  isAuthed: boolean
  userRole: string | null
  username: string | null
}

function MobileNav({ isAuthed, userRole, username }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const menuRef = useRef<HTMLDivElement | null>(null)

  // Close on route change
  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])
  return (
    <div className="ml-auto sm:hidden relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Menu className="w-5 h-5" />
      </Button>
      {open && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/20" />
          <div
            ref={menuRef}
            className="absolute right-0 mt-2 w-56 rounded-lg border bg-background shadow-lg p-2 z-50"
          >
            {isAuthed ? (
              <div className="flex flex-col">
                <Link
                  to="/"
                  className="px-3 py-2 rounded-md text-sm hover:bg-accent"
                  onClick={() => setOpen(false)}
                >
                  Home
                </Link>
                {userRole === "user" && (
                  <Link
                    to="/dashboard"
                    className="px-3 py-2 rounded-md text-sm hover:bg-accent"
                    onClick={() => setOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}
                {userRole === "admin" && (
                  <Link
                    to="/admin"
                    className="px-3 py-2 rounded-md text-sm hover:bg-accent"
                    onClick={() => setOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                {userRole === "moderator" && (
                  <Link
                    to="/moderation"
                    className="px-3 py-2 rounded-md text-sm hover:bg-accent"
                    onClick={() => setOpen(false)}
                  >
                    Moderation
                  </Link>
                )}
                {username && (
                  <div className="px-3 pt-2 pb-1 text-xs text-muted-foreground">
                    Signed in as {username}
                  </div>
                )}
                <div className="px-2 pt-1">
                  <LogoutButton />
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                <Link
                  to="/"
                  className="px-3 py-2 rounded-md text-sm hover:bg-accent"
                  onClick={() => setOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-md text-sm hover:bg-accent"
                  onClick={() => setOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-2 rounded-md text-sm hover:bg-accent"
                  onClick={() => setOpen(false)}
                >
                  Get started
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
