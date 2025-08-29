import { createBrowserRouter, Navigate } from "react-router-dom"
import App from "@/App"
import LoginPage from "@/pages/auth/login"
import RegisterPage from "@/pages/auth/register"
import ProtectedRoute from "@/router/protected-route"

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
            <div className="p-6">Welcome to Sejiwa</div>
          </ProtectedRoute>
        ),
      },
    ],
  },
])

export default router
