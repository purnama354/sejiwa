import { Outlet, Link, useLocation } from "react-router-dom"
import { useAuthStore } from "@/store/auth"
import { useState, useEffect } from "react"
import {
  ShieldCheck,
  LayoutDashboard,
  MessageSquareWarning,
  Menu,
  X,
  LogOut,
} from "lucide-react"

export default function ModeratorLayout() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Lock body scroll when sidebar is open and enable Esc to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false)
    }
    if (sidebarOpen) {
      document.body.style.overflow = "hidden"
      window.addEventListener("keydown", onKey)
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", onKey)
    }
  }, [sidebarOpen])

  const nav = [
    {
      to: "/moderation",
      label: "Dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    { to: "/moderation/reports", label: "Reports", icon: MessageSquareWarning },
  ]

  const isActive = (to: string, exact = false) =>
    exact ? location.pathname === to : location.pathname.startsWith(to)

  const handleNavClick = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-100/40">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white/90 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-30">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-slate-500 hover:text-slate-700 transition-colors"
            >
              {sidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-slate-900">Sejiwa</h1>
              <p className="text-xs text-slate-500">Moderation</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 w-60 min-h-screen bg-white/80 backdrop-blur-sm border-r border-slate-200/60 shadow-lg transform transition-transform duration-300 ease-in-out lg:transform-none ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
        >
          {/* Mobile sidebar top bar with close button */}
          <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-slate-200/60 bg-white/90">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-medium text-slate-900">Moderation</h2>
                <p className="text-xs text-slate-500">Sejiwa</p>
              </div>
            </div>
            <button
              aria-label="Close menu"
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-slate-500 hover:text-slate-700 rounded-md transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-5 border-b border-slate-200/60 hidden lg:block">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">Moderator</h2>
                <p className="text-xs text-slate-500">Sejiwa</p>
              </div>
            </div>
          </div>

          <nav className="p-3 space-y-2">
            {nav.map((n) => {
              const Icon = n.icon
              const active = isActive(n.to, n.exact)
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={handleNavClick}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    active
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      active ? "text-white" : "text-slate-400"
                    }`}
                  />
                  <span className="font-medium">{n.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Desktop User Section */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200/60 hidden lg:block">
            <div className="flex items-center justify-between px-3">
              <div>
                <div className="text-sm font-medium text-slate-900 truncate">
                  {user?.username}
                </div>
                <div className="text-xs text-slate-500 capitalize">
                  {user?.role}
                </div>
              </div>
              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen lg:ml-0">
          <div className="p-4 sm:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
