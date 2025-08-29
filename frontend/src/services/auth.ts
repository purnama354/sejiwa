import { z } from "zod"
import api from "@/lib/api"
import type { AuthResponse } from "@/types/api"

export const loginSchema = z.object({
  username: z.string().min(3, "Username is required"),
  password: z.string().min(6, "Password is required"),
})

export type LoginInput = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export type RegisterInput = z.infer<typeof registerSchema>

export async function login(input: LoginInput): Promise<AuthResponse> {
  const payload = loginSchema.parse(input)
  const { data } = await api.post<AuthResponse>("/auth/login", payload)
  return data
}

export async function register(input: RegisterInput): Promise<AuthResponse> {
  const payload = registerSchema.parse(input)
  const { data } = await api.post<AuthResponse>("/auth/register", payload)
  return data
}
