import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, type LoginInput } from "@/services/auth"
import { useAuthStore, type AuthState } from "@/store/auth"
import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

type FromLocation = { state?: { from?: { pathname?: string } } }

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation() as FromLocation
  const from = location.state?.from?.pathname ?? "/dashboard"
  const login = useAuthStore((s: AuthState) => s.login)
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  })
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form

  const onSubmit = async (data: LoginInput) => {
    setServerError(null)
    try {
      await login(data.username, data.password)
      navigate(from, { replace: true })
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      const msg = err?.response?.data?.message || "Login failed"
      setServerError(msg)
    }
  }

  return (
    <div className="relative min-h-dvh grid place-items-center overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1000px_600px_at_50%-100%,oklch(0.97_0_0),transparent)]" />
      <Card className="relative w-full max-w-sm border bg-card/70 backdrop-blur">
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          {serverError && (
            <div className="mb-4 rounded-md bg-destructive/10 text-destructive px-3 py-2 text-sm">
              {serverError}
            </div>
          )}
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField<LoginInput>
                name="username"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="yourname" {...field} />
                    </FormControl>
                    <FormMessage>
                      {errors.username?.message || fieldState.error?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField<LoginInput>
                name="password"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage>
                      {errors.password?.message || fieldState.error?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </Form>
          <p className="mt-4 text-sm text-muted-foreground">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-primary underline-offset-2 hover:underline"
            >
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
