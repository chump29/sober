import { StrictMode } from "react"

import CssBaseline from "@mui/material/CssBaseline"
import { createTheme, type Theme, ThemeProvider } from "@mui/material/styles"
import { createRoot } from "react-dom/client"
import { z } from "zod/mini"

import Dashboard from "./components/dashboard"
import { error, info } from "./components/shared"

const DEBUG: boolean = false

const theme: Theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#66ccff"
    },
    text: {
      primary: "#66cc00"
    }
  }
})

const getVersion = (version: string): string => {
  return version.length ? `v${version}` : "N/A"
}

let version: string = ""
try {
  version = z
    .string()
    .check(z.regex(/^\d+\.\d+\.\d+$/))
    .parse(import.meta.env.PACKAGE_VERSION)
  if (DEBUG) {
    info(`Got UI version: ${version}`)
  }
  // biome-ignore lint/suspicious/noExplicitAny: catch everything
} catch (e: any) {
  error("Could not get UI version", e)
}
document.getElementById("frontend")!.innerText = getVersion(version)

if (import.meta.env.DEV) {
  createRoot(document.getElementById("root")!).render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Dashboard />
    </ThemeProvider>
  )
} else {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Dashboard />
      </ThemeProvider>
    </StrictMode>
  )
}
