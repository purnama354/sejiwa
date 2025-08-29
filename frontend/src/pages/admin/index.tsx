import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { createAdmin, createModerator } from "@/services/admin"
import type { CreateAdminRequest, CreateModeratorRequest } from "@/types/api"
import { Shield, UserPlus, Mail, User, Lock } from "lucide-react"

export default function AdminPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <p className="text-slate-600 mt-1">
          Create and manage privileged accounts
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CreateAdminCard />
        <CreateModeratorCard />
      </div>
    </div>
  )
}

function CreateAdminCard() {
  const [form, setForm] = useState<CreateAdminRequest>({
    username: "",
    password: "",
    email: "",
    full_name: "",
  })
  const [message, setMessage] = useState<string>("")
  const { mutateAsync, isPending } = useMutation({ mutationFn: createAdmin })
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
  const { mutateAsync, isPending } = useMutation({
    mutationFn: createModerator,
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
