import { MantineProvider } from "@mantine/core"
import { ModalsProvider } from "@mantine/modals"
import { Notifications } from "@mantine/notifications"

import { createRoot } from "react-dom/client"

import { App } from "./App.tsx"
import { theme } from "./theme.ts"
import { handleError } from "./utils/index.ts"

import "./theme.css"

const root = document.querySelector("#root")
if (root) {
  createRoot(root).render(
    <MantineProvider forceColorScheme="dark" theme={theme}>
      <ModalsProvider>
        <Notifications />
        <App />
      </ModalsProvider>
    </MantineProvider>
  )
} else {
  handleError("Could not find root element")
}
