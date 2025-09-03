import type { PropsWithChildren } from "react"
import { Navigate } from "react-router-dom"
import { useAuthStore, type AuthState } from "@/store/auth"
import { defaultRouteForRole } from "@/lib/auth"

export default function PublicOnly({ children }: PropsWithChildren) {
	const token = useAuthStore((s: AuthState) => s.accessToken)
	const role = useAuthStore((s: AuthState) => s.user?.role)

	if (token && role) {
		return <Navigate to={defaultRouteForRole(role)} replace />
	}

	return children
}

