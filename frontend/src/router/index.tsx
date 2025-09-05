import { createBrowserRouter, Navigate } from "react-router-dom"
import { lazy } from "react"
import App from "@/App"
import RoleRoute from "@/router/role-route"
import PublicOnly from "@/router/public-only"
import Fallback from "@/router/fallback"
const HomePage = lazy(() => import("@/pages/home"))
const LoginPage = lazy(() => import("@/pages/auth/login"))
const RegisterPage = lazy(() => import("@/pages/auth/register"))
const DashboardPage = lazy(() => import("@/pages/dashboard"))
const ModerationPage = lazy(() => import("@/pages/moderation"))
const AdminLayout = lazy(() => import("@/pages/admin/layout"))
const AdminDashboard = lazy(() => import("@/pages/admin/dashboard"))
const AdminPage = lazy(() => import("@/pages/admin"))
const AdminCategories = lazy(() => import("@/pages/admin/categories"))
const ModeratorLayout = lazy(() => import("@/pages/moderation/layout"))
const ModeratorDashboard = lazy(() => import("@/pages/moderation/dashboard"))
const AdminSettings = lazy(() => import("@/pages/admin/settings"))
const PrivacySettings = lazy(() => import("@/pages/profile/privacy"))
const NotificationSettings = lazy(() => import("@/pages/profile/notifications"))

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <Fallback>
            <HomePage />
          </Fallback>
        ),
      },
      {
        path: "login",
        element: (
          <PublicOnly>
            <Fallback>
              <LoginPage />
            </Fallback>
          </PublicOnly>
        ),
      },
      {
        path: "register",
        element: (
          <PublicOnly>
            <Fallback>
              <RegisterPage />
            </Fallback>
          </PublicOnly>
        ),
      },
      {
        path: "dashboard",
        element: (
          <RoleRoute allow={["user"]}>
            <Fallback>
              <DashboardPage />
            </Fallback>
          </RoleRoute>
        ),
      },
      {
        path: "profile",
        children: [
          {
            path: "privacy",
            element: (
              <RoleRoute allow={["user", "moderator", "admin"]}>
                <Fallback>
                  <PrivacySettings />
                </Fallback>
              </RoleRoute>
            ),
          },
          {
            path: "notifications",
            element: (
              <RoleRoute allow={["user", "moderator", "admin"]}>
                <Fallback>
                  <NotificationSettings />
                </Fallback>
              </RoleRoute>
            ),
          },
        ],
      },
      {
        path: "moderation",
        element: (
          <RoleRoute allow={["moderator"]}>
            <Fallback>
              <ModeratorLayout />
            </Fallback>
          </RoleRoute>
        ),
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          {
            path: "dashboard",
            element: (
              <Fallback>
                <ModeratorDashboard />
              </Fallback>
            ),
          },
          {
            path: "reports",
            element: (
              <Fallback>
                <ModerationPage />
              </Fallback>
            ),
          },
        ],
      },
      {
        path: "admin",
        element: (
          <RoleRoute allow={["admin"]}>
            <Fallback>
              <AdminLayout />
            </Fallback>
          </RoleRoute>
        ),
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          {
            path: "dashboard",
            element: (
              <Fallback>
                <AdminDashboard />
              </Fallback>
            ),
          },
          {
            path: "users",
            element: (
              <Fallback>
                <AdminPage />
              </Fallback>
            ),
          },
          {
            path: "categories",
            element: (
              <Fallback>
                <AdminCategories />
              </Fallback>
            ),
          },
          {
            path: "settings",
            element: (
              <Fallback>
                <AdminSettings />
              </Fallback>
            ),
          },
        ],
      },
    ],
  },
])

export default router
