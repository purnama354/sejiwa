import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createAdmin, createModerator } from "@/services/admin"
import { listCategories, createCategory, updateCategory, deleteCategory } from "@/services/categories"
import type { CreateAdminRequest, CreateModeratorRequest, Category } from "@/types/api"

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
        <CategoriesCard />
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

function CategoriesCard() {
  const qc = useQueryClient()
  const { data, isLoading, isError } = useQuery({ queryKey: ["categories"], queryFn: listCategories })
  const [draft, setDraft] = useState<{ name: string; description: string }>({ name: "", description: "" })

  const createMut = useMutation({
    mutationFn: createCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  })
  const updateMut = useMutation({
    mutationFn: ({ id, name, description, is_locked }: { id: string } & Partial<Category>) =>
      updateCategory(id, { name, description, is_locked }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  })
  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  })

  return (
    <div className="rounded-lg border p-4 md:col-span-2">
      <h2 className="font-medium">Manage Categories</h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_2fr_auto]">
        <input className="border rounded px-2 py-1" placeholder="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        <input className="border rounded px-2 py-1" placeholder="Description" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
        <button className="border rounded px-3 py-1 disabled:opacity-50" disabled={createMut.isPending || !draft.name.trim()} onClick={() => createMut.mutate({ name: draft.name.trim(), description: draft.description.trim() || undefined })}>
          {createMut.isPending ? "Adding…" : "Add"}
        </button>
      </div>
      <div className="mt-4 divide-y">
        {isLoading && <div>Loading…</div>}
        {isError && <div className="text-red-600">Failed to load categories</div>}
        {data?.map((c) => (
          <CategoryRow key={c.id} cat={c} onSave={(payload) => updateMut.mutate({ id: c.id, ...payload })} onDelete={() => deleteMut.mutate(c.id)} />
        ))}
      </div>
    </div>
  )
}

function CategoryRow({ cat, onSave, onDelete }: { cat: Category; onSave: (p: Partial<Category>) => void; onDelete: () => void }) {
  const [edit, setEdit] = useState<Partial<Category>>({ name: cat.name, description: cat.description, is_locked: cat.is_locked })
  const dirty = edit.name !== cat.name || edit.description !== cat.description || edit.is_locked !== cat.is_locked
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 py-3">
      <div className="flex-1 min-w-0">
        <div className="text-sm text-muted-foreground">{cat.slug}</div>
        <div className="flex gap-2 mt-1">
          <input className="border rounded px-2 py-1 flex-1" value={edit.name ?? ""} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
          <input className="border rounded px-2 py-1 flex-[2]" value={edit.description ?? ""} onChange={(e) => setEdit({ ...edit, description: e.target.value })} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!edit.is_locked} onChange={(e) => setEdit({ ...edit, is_locked: e.target.checked })} /> Locked</label>
      <div className="ml-auto flex items-center gap-2">
        <button className="border rounded px-3 py-1 disabled:opacity-50" disabled={!dirty} onClick={() => onSave(edit)}>Save</button>
        <button className="border rounded px-3 py-1" onClick={onDelete}>Delete</button>
      </div>
    </div>
  )
}
