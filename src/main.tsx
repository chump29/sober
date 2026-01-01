import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import Dashboard from "./components/dashboard"

document.getElementById("header")!.innerText =
  `v${import.meta.env.PACKAGE_VERSION}`

document.getElementById("year")!.innerText +=
  `-${new Date().getFullYear().toString()}`

const POSTFMLY_US = "postfmly.us"
const copyright = document.getElementById("copyright") as HTMLAnchorElement
if (window.location.href.includes(POSTFMLY_US)) {
  copyright.href = `https://www.${POSTFMLY_US}`
  copyright.title = `www.${POSTFMLY_US}`
  copyright.innerText = POSTFMLY_US
}

if (import.meta.env.DEV) {
  createRoot(document.getElementById("root")!).render(<Dashboard />)
} else {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <Dashboard />
    </StrictMode>
  )
}
