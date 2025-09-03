import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createAdmin, createModerator } from "@/services/admin"
import { getUsers } from "@/services/users"
import type {
  CreateAdminRequest,
  CreateModeratorRequest,
  UserProfile,
} from "@/types/api"
import {
  Shield,
  UserPlus,
  Mail,
  User,
  Lock,
  Search,
  Filter,
  Ban,
  RotateCcw,
  Crown,
  Plus,
  UserCog,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { BanUserModal, UnbanUserModal, PromoteUserModal } from "./user-modals"

export default function AdminPage() {
  type Tab =
    | "users"
    | "moderators"
    | "admins"
    | "create-admin"
    | "create-moderator"
  const [active, setActive] = useState<Tab>("users")
  const [q, setQ] = useState("")
  const [status, setStatus] = useState<"" | UserProfile["status"]>("")
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [showBanModal, setShowBanModal] = useState(false)
  const [showUnbanModal, setShowUnbanModal] = useState(false)
  const [showPromoteModal, setShowPromoteModal] = useState(false)
  // Pagination + role filter
  const [page, setPage] = useState(1)
  const pageSize = 10
  const roleFilter =
    active === "users"
      ? "user"
      : active === "moderators"
      ? "moderator"
      : active === "admins"
      ? "admin"
      : undefined

  // Reset page on filter changes
  useEffect(() => {
    setPage(1)
  }, [active, status, q])

  // Fetch users
  const {
    data: userData,
    isLoading,
    isRefetching,
    // error,
  } = useQuery({
    queryKey: [
      "users",
      roleFilter || "",
      status || "",
      page,
      pageSize,
      q || "",
    ],
    queryFn: () => {
      // console.log("Fetching users with params:", {
      //   role: roleFilter,
      //   status: status || undefined,
      //   page,
      //   pageSize,
      //   query: q || undefined,
      // })
      return getUsers({
        role: roleFilter as "user" | "moderator" | "admin" | undefined,
        status: (status || undefined) as
          | "active"
          | "inactive"
          | "suspended"
          | undefined,
        page,
        pageSize,
        query: q || undefined,
      })
    },
    // Use fixed values instead of referencing items which isn't defined yet
    staleTime: 30000,
    retry: 3,
  })

  // console.log("API response:", { userData, error })
  const items = userData?.items ?? []
  const total = userData?.total ?? 0
  const totalPages = userData?.totalPages ?? 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <p className="text-slate-600 mt-1">
          Manage users, moderators, and admins
        </p>
      </div>

      <div>
        {/* Main Tabs */}
        <div className="mb-6 border-b border-slate-200 flex flex-wrap">
          <TabButton
            label="Users"
            active={active === "users"}
            onClick={() => setActive("users")}
            icon={<User className="w-4 h-4 mr-1.5" />}
          />
          <TabButton
            label="Moderators"
            active={active === "moderators"}
            onClick={() => setActive("moderators")}
            icon={<UserCog className="w-4 h-4 mr-1.5" />}
          />
          <TabButton
            label="Admins"
            active={active === "admins"}
            onClick={() => setActive("admins")}
            icon={<Shield className="w-4 h-4 mr-1.5" />}
          />
          <TabButton
            label="Create Admin"
            active={active === "create-admin"}
            onClick={() => setActive("create-admin")}
            icon={<Plus className="w-4 h-4 mr-1.5" />}
          />
          <TabButton
            label="Create Moderator"
            active={active === "create-moderator"}
            onClick={() => setActive("create-moderator")}
            icon={<Plus className="w-4 h-4 mr-1.5" />}
          />
        </div>

        {/* Dynamic Content Based on Tab */}
        {active === "create-admin" ? (
          <div className="max-w-md mx-auto">
            <CreateAdminCard />
          </div>
        ) : active === "create-moderator" ? (
          <div className="max-w-md mx-auto">
            <CreateModeratorCard />
          </div>
        ) : (
          /* User List View */
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200/60 p-4">
              <div className="relative flex-1 min-w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search username…"
                  className="w-full rounded-lg border border-slate-200 bg-white/80 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as "" | UserProfile["status"])
                  }
                  className="appearance-none w-44 rounded-lg border border-slate-200 bg-white/80 pl-9 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">All status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            {/* List */}
            <div className="rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200/60 p-4">
              {isLoading ? (
                <div className="text-center py-12 text-slate-600">
                  Loading users…
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-slate-600">No {active} found</div>
                  <div className="text-xs text-slate-500 mt-1">
                    Try adjusting your filters
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm table-fixed">
                    <thead>
                      <tr className="text-left text-slate-500 border-b border-slate-200">
                        <th className="py-3 px-3 w-1/4 font-medium">Username</th>
                        <th className="py-3 px-3 w-20 font-medium">Role</th>
                        <th className="py-3 px-3 w-20 font-medium">Status</th>
                        <th className="py-3 px-3 w-16 font-medium text-center">Threads</th>
                        <th className="py-3 px-3 w-16 font-medium text-center">Replies</th>
                        <th className="py-3 px-3 w-32 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((u) => (
                        <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="py-3 px-3 font-medium text-slate-900 truncate">
                            {u.username}
                          </td>
                          <td className="py-3 px-3">
                            <RoleBadge role={u.role} />
                          </td>
                          <td className="py-3 px-3">
                            <StatusBadge status={u.status} />
                          </td>
                          <td className="py-3 px-3 text-center text-slate-600">{u.thread_count}</td>
                          <td className="py-3 px-3 text-center text-slate-600">{u.reply_count}</td>
                          <td className="py-3 px-3">
                            <div className="flex gap-1 justify-end">
                              {u.status !== "suspended" && (
                                <button
                                  className="px-2 py-1.5 text-xs border rounded hover:bg-slate-50 transition-colors"
                                  title="Ban user"
                                  onClick={() => {
                                    setSelectedUser(u)
                                    setShowBanModal(true)
                                  }}
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {u.status === "suspended" && (
                                <button
                                  className="px-2 py-1.5 text-xs border rounded hover:bg-slate-50 transition-colors"
                                  title="Unban user"
                                  onClick={() => {
                                    setSelectedUser(u)
                                    setShowUnbanModal(true)
                                  }}
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {active !== "admins" && u.role !== "admin" && (
                                <button
                                  className="px-2 py-1.5 text-xs border rounded hover:bg-slate-50 transition-colors"
                                  title="Promote"
                                  onClick={() => {
                                    setSelectedUser(u)
                                    setShowPromoteModal(true)
                                  }}
                                >
                                  <Crown className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between px-1">
              <div className="text-xs text-slate-500">
                Page {page} of {totalPages} • {total} total
              </div>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1.5 text-sm border rounded disabled:opacity-50"
                  disabled={page <= 1 || isLoading || isRefetching}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <button
                  className="px-3 py-1.5 text-sm border rounded disabled:opacity-50"
                  disabled={page >= totalPages || isLoading || isRefetching}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User action modals */}
        <BanUserModal
          isOpen={showBanModal}
          onClose={() => {
            setShowBanModal(false)
            setSelectedUser(null)
          }}
          user={selectedUser}
        />

        <UnbanUserModal
          isOpen={showUnbanModal}
          onClose={() => {
            setShowUnbanModal(false)
            setSelectedUser(null)
          }}
          user={selectedUser}
        />

        <PromoteUserModal
          isOpen={showPromoteModal}
          onClose={() => {
            setShowPromoteModal(false)
            setSelectedUser(null)
          }}
          user={selectedUser}
        />
      </div>
    </div>
  )
}

function TabButton({
  label,
  active,
  onClick,
  icon,
}: {
  label: string
  active: boolean
  onClick: () => void
  icon?: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center px-4 py-2 mb-[-1px] text-sm font-medium transition-all ${
        active
          ? "text-blue-600 border-x border-t border-slate-200 bg-white rounded-t-lg"
          : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

function RoleBadge({ role }: { role: string }) {
  switch (role) {
    case "admin":
      return <Badge variant="info">Admin</Badge>
    case "moderator":
      return <Badge variant="secondary">Moderator</Badge>
    default:
      return <Badge variant="outline">User</Badge>
  }
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "active":
      return <Badge variant="success">Active</Badge>
    case "inactive":
      return <Badge variant="secondary">Inactive</Badge>
    case "suspended":
      return <Badge variant="danger">Suspended</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function CreateAdminCard() {
  const [form, setForm] = useState<CreateAdminRequest>({
    username: "",
    password: "",
    email: "",
    full_name: "",
  })
  const [message, setMessage] = useState<string>("")
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useMutation({
    mutationFn: createAdmin,
    onSuccess: () => {
      // Invalidate users query to refresh the list after creating an admin
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
  function extractMessage(e: unknown) {
    type AxiosErr = { response?: { data?: { message?: string } } }
    if (e && typeof e === "object" && "response" in e) {
      const ae = e as AxiosErr
      return ae.response?.data?.message
    }
    return e instanceof Error ? e.message : undefined
  }
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-8 shadow-xl shadow-blue-500/10 ring-1 ring-slate-200/50 backdrop-blur-sm">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50" />

      {/* Content */}
      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Create Admin
            </h2>
            <p className="text-sm text-slate-600">
              Add a new administrator account
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full rounded-xl border border-slate-200 bg-white/80 pl-10 pr-4 py-3 text-slate-900 placeholder-slate-500 shadow-sm backdrop-blur-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full rounded-xl border border-slate-200 bg-white/80 pl-10 pr-4 py-3 text-slate-900 placeholder-slate-500 shadow-sm backdrop-blur-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="relative">
            <UserPlus className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full rounded-xl border border-slate-200 bg-white/80 pl-10 pr-4 py-3 text-slate-900 placeholder-slate-500 shadow-sm backdrop-blur-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="Full name"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full rounded-xl border border-slate-200 bg-white/80 pl-10 pr-4 py-3 text-slate-900 placeholder-slate-500 shadow-sm backdrop-blur-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <button
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isPending}
            onClick={async () => {
              setMessage("")
              try {
                await mutateAsync(form)
                setMessage("Admin created successfully!")
                setForm({
                  username: "",
                  password: "",
                  email: "",
                  full_name: "",
                })
              } catch (e: unknown) {
                setMessage(extractMessage(e) || "Failed to create admin")
              }
            }}
          >
            {isPending ? "Creating…" : "Create Admin"}
          </button>

          {message && (
            <div
              className={`rounded-xl p-3 text-sm font-medium ${
                message.includes("successfully")
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CreateModeratorCard() {
  const [form, setForm] = useState<CreateModeratorRequest>({
    username: "",
    password: "",
    email: "",
    full_name: "",
    permissions: ["manage_reports", "ban_users"],
  })
  const [message, setMessage] = useState<string>("")
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useMutation({
    mutationFn: createModerator,
    onSuccess: () => {
      // Invalidate users query to refresh the list after creating a moderator
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
  function extractMessage(e: unknown) {
    type AxiosErr = { response?: { data?: { message?: string } } }
    if (e && typeof e === "object" && "response" in e) {
      const ae = e as AxiosErr
      return ae.response?.data?.message
    }
    return e instanceof Error ? e.message : undefined
  }
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-8 shadow-xl shadow-purple-500/10 ring-1 ring-slate-200/50 backdrop-blur-sm">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50" />

      {/* Content */}
      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/25">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Create Moderator
            </h2>
            <p className="text-sm text-slate-600">
              Add a new moderator account
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full rounded-xl border border-slate-200 bg-white/80 pl-10 pr-4 py-3 text-slate-900 placeholder-slate-500 shadow-sm backdrop-blur-sm transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              placeholder="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full rounded-xl border border-slate-200 bg-white/80 pl-10 pr-4 py-3 text-slate-900 placeholder-slate-500 shadow-sm backdrop-blur-sm transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="relative">
            <UserPlus className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full rounded-xl border border-slate-200 bg-white/80 pl-10 pr-4 py-3 text-slate-900 placeholder-slate-500 shadow-sm backdrop-blur-sm transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              placeholder="Full name"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full rounded-xl border border-slate-200 bg-white/80 pl-10 pr-4 py-3 text-slate-900 placeholder-slate-500 shadow-sm backdrop-blur-sm transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              placeholder="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
            <div className="text-sm font-medium text-slate-700 mb-2">
              Default Permissions:
            </div>
            <div className="flex flex-wrap gap-2">
              {form.permissions?.map((permission) => (
                <span
                  key={permission}
                  className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800"
                >
                  {permission.replace("_", " ")}
                </span>
              ))}
            </div>
          </div>

          <button
            className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:from-purple-700 hover:to-pink-700 hover:shadow-xl hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isPending}
            onClick={async () => {
              setMessage("")
              try {
                await mutateAsync(form)
                setMessage("Moderator created successfully!")
                setForm({
                  username: "",
                  password: "",
                  email: "",
                  full_name: "",
                  permissions: ["manage_reports", "ban_users"],
                })
              } catch (e: unknown) {
                setMessage(extractMessage(e) || "Failed to create moderator")
              }
            }}
          >
            {isPending ? "Creating…" : "Create Moderator"}
          </button>

          {message && (
            <div
              className={`rounded-xl p-3 text-sm font-medium ${
                message.includes("successfully")
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
