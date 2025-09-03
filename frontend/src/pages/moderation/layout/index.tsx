import { Outlet, Link, useLocation } from "react-router-dom"
import { useAuthStore } from "@/store/auth"
import {
  ShieldCheck,
  LayoutDashboard,
  MessageSquareWarning,
} from "lucide-react"

export default function ModeratorLayout() {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-100/40">
      <div className="flex">
        <aside className="w-60 min-h-screen bg-white/80 backdrop-blur-sm border-r border-slate-200/60 shadow-lg">
          <div className="p-5 border-b border-slate-200/60">
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
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200/60">
            <div className="px-3">
              <div className="text-sm font-medium text-slate-900 truncate">
                {user?.username}
              </div>
              <div className="text-xs text-slate-500 capitalize">
                {user?.role}
              </div>
            </div>
          </div>
        </aside>
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
