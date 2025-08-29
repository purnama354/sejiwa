import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { createAdmin, createModerator } from "@/services/admin"
import type { CreateAdminRequest, CreateModeratorRequest } from "@/types/api"

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-5xl p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Admin Tools</h1>
        <p className="text-muted-foreground">Manage privileged accounts.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
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
    <div className="rounded-lg border p-4">
      <h2 className="font-medium">Create Admin</h2>
      <div className="mt-3 grid gap-2">
        <input
          className="border rounded px-2 py-1"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <input
          className="border rounded px-2 py-1"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          className="border rounded px-2 py-1"
          placeholder="Full name"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
        />
        <input
          className="border rounded px-2 py-1"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button
          className="mt-2 border rounded px-3 py-1 disabled:opacity-50"
          disabled={isPending}
          onClick={async () => {
            setMessage("")
            try {
              await mutateAsync(form)
              setMessage("Admin created.")
            } catch (e: unknown) {
              setMessage(extractMessage(e) || "Failed to create admin")
            }
          }}
        >
          {isPending ? "Creating…" : "Create"}
        </button>
        {message && (
          <div className="text-sm text-muted-foreground">{message}</div>
        )}
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
    <div className="rounded-lg border p-4">
      <h2 className="font-medium">Create Moderator</h2>
      <div className="mt-3 grid gap-2">
        <input
          className="border rounded px-2 py-1"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <input
          className="border rounded px-2 py-1"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          className="border rounded px-2 py-1"
          placeholder="Full name"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
        />
        <input
          className="border rounded px-2 py-1"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <div className="text-xs text-muted-foreground">
          Permissions: {form.permissions?.join(", ")}
        </div>
        <button
          className="mt-2 border rounded px-3 py-1 disabled:opacity-50"
          disabled={isPending}
          onClick={async () => {
            setMessage("")
            try {
              await mutateAsync(form)
              setMessage("Moderator created.")
            } catch (e: unknown) {
              setMessage(extractMessage(e) || "Failed to create moderator")
            }
          }}
        >
          {isPending ? "Creating…" : "Create"}
        </button>
        {message && (
          <div className="text-sm text-muted-foreground">{message}</div>
        )}
      </div>
    </div>
  )
}
