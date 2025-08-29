import { createBrowserRouter, Navigate } from "react-router-dom"
import App from "@/App"
import LoginPage from "@/pages/auth/login"
import RegisterPage from "@/pages/auth/register"
import ProtectedRoute from "@/router/protected-route"
import RoleRoute from "@/router/role-route"
import DashboardPage from "@/pages/dashboard"
import ModerationPage from "@/pages/moderation"
import AdminPage from "@/pages/admin"

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "moderation",
        element: (
          <RoleRoute allow={["moderator", "admin"]}>
            <ModerationPage />
          </RoleRoute>
        ),
      },
      {
        path: "admin",
        element: (
          <RoleRoute allow={["admin"]}>
            <AdminPage />
          </RoleRoute>
        ),
      },
    ],
  },
])

export default router
