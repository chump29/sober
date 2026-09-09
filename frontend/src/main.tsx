import { MantineProvider } from "@mantine/core"
import { ModalsProvider } from "@mantine/modals"
import { Notifications } from "@mantine/notifications"

import { type Nullable } from "@postfmly/types"

import { createRoot } from "react-dom/client"

import { version } from "../package.json" with { type: "json" }
import { fetchClient } from "./api/index.ts"
import { Display } from "./components/Display/index.tsx"
import { findElement, HttpMethods, handleError } from "./utils/index.ts"
import { type IFetchClient } from "./utils/interfaces/IFetchClient.ts"

const getVersion = (v: Nullable<string>): string => (v ? `v${v}` : "N/A")

const frontend: Nullable<HTMLElement> = findElement("#frontend")
if (frontend) {
  frontend.innerHTML = `<sup>UI</sup> ${getVersion(version)}`
}

// * NOTE: not using await, don't hold up page render
fetchClient<string>({
  endpoint: "version",
  method: HttpMethods.GET
} satisfies IFetchClient).then((data: Nullable<string>): void => {
  const backend: Nullable<HTMLElement> = findElement("#backend")
  if (backend) {
    backend.innerHTML = `<sup>API</sup> ${getVersion(data)}`
  }
})

const root: Nullable<HTMLElement> = findElement("#root")
if (root) {
  createRoot(root).render(
    <MantineProvider defaultColorScheme="dark">
      <ModalsProvider>
        <Notifications />
        <Display />
      </ModalsProvider>
    </MantineProvider>
  )
} else {
  handleError("Could not find root element")
}
