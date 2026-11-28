import "./utils/dayjs.ts"

import { MantineProvider } from "@mantine/core"
import { ModalsProvider } from "@mantine/modals"
import { Notifications } from "@mantine/notifications"

import { info } from "@postfmly/logger"

import dayjs from "dayjs"
import { createRoot } from "react-dom/client"

import { App } from "./App.tsx"
import { env } from "./env.ts"
import { theme } from "./theme.ts"
import { handleError } from "./utils/index.ts"

import "./theme.css"

if (env.DEBUG) {
  info("Debug is ON")

  info(`Timezone set to: ${dayjs.tz.guess()}`)
}

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
