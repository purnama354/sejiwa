import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { createModerator } from "@/services/admin"
import type { CreateModeratorRequest } from "@/types/api"
import { Shield, Mail, User, Lock, Plus } from "lucide-react"

export default function AdminModerators() {
  const [form, setForm] = useState<CreateModeratorRequest>({
    username: "",
    password: "",
    email: "",
    full_name: "",
    permissions: ["manage_reports", "ban_users"],
  })
  const [message, setMessage] = useState<string>("")
  const { mutateAsync, isPending } = useMutation({ mutationFn: createModerator })

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Moderators</h1>
      <p className="text-slate-600 mb-6">Create a new moderator account</p>
      <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow ring-1 ring-slate-200/60">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50" />
        <div className="relative space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">New Moderator</h2>
          </div>
          <Field icon={User} placeholder="Username" value={form.username} onChange={(v) => setForm({ ...form, username: v })} />
          <Field icon={Mail} placeholder="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <Field icon={User} placeholder="Full name" value={form.full_name || ""} onChange={(v) => setForm({ ...form, full_name: v })} />
          <Field icon={Lock} placeholder="Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} />
          <button
            className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2.5 font-medium text-white disabled:opacity-50"
            disabled={isPending}
            onClick={async () => {
              setMessage("")
              try {
                await mutateAsync(form)
                setMessage("Moderator created successfully")
                setForm({ username: "", password: "", email: "", full_name: "", permissions: ["manage_reports", "ban_users"] })
              } catch (e) {
                setMessage(e instanceof Error ? e.message : "Failed to create moderator")
              }
            }}
          >
            <div className="flex items-center justify-center gap-2"><Plus className="w-4 h-4" />Create Moderator</div>
          </button>
          {message && <div className="text-sm text-slate-600">{message}</div>}
        </div>
      </div>
    </div>
  )
}

function Field({ icon: Icon, ...props }: {
  icon: React.ComponentType<{ className?: string }>
  placeholder: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        className="w-full rounded-lg border border-slate-200 bg-white/80 pl-9 pr-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
        {...props}
        onChange={(e) => props.onChange((e.target as HTMLInputElement).value)}
      />
    </div>
  )
}
