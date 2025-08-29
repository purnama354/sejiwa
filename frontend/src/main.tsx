import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import { RouterProvider } from "react-router-dom"
import router from "@/router"
import { AppProviders } from "@/providers/app-providers"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>
)
