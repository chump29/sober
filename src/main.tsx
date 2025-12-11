import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import Dashboard from "./components/dashboard"

import "bootstrap/dist/css/bootstrap.min.css"

if (import.meta.env.DEV) {
  createRoot(document.getElementById("root")!).render(<Dashboard />)
} else {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <Dashboard />
    </StrictMode>
  )
}
