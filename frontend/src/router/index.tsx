import { createBrowserRouter, Navigate } from "react-router-dom"
import App from "@/App"
import LoginPage from "@/pages/auth/login"
import RegisterPage from "@/pages/auth/register"
import ProtectedRoute from "@/router/protected-route"
import RoleRoute from "@/router/role-route"
import DashboardPage from "@/pages/dashboard"
import ModerationPage from "@/pages/moderation"
import AdminLayout from "@/pages/admin/layout"
import AdminDashboard from "@/pages/admin/dashboard"
import AdminPage from "@/pages/admin"
import AdminCategories from "@/pages/admin/categories"
import ModeratorLayout from "@/pages/moderation/layout"
import ModeratorDashboard from "@/pages/moderation/dashboard"
import AdminSettings from "@/pages/admin/settings"

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
            <ModeratorLayout />
          </RoleRoute>
        ),
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <ModeratorDashboard /> },
          { path: "reports", element: <ModerationPage /> },
        ],
      },
      {
        path: "admin",
        element: (
          <RoleRoute allow={["admin"]}>
            <AdminLayout />
          </RoleRoute>
        ),
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <AdminDashboard /> },
          { path: "users", element: <AdminPage /> },
          { path: "categories", element: <AdminCategories /> },
          { path: "settings", element: <AdminSettings /> },
        ],
      },
    ],
  },
])

export default router
