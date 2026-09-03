import { MantineProvider } from "@mantine/core"
import { ModalsProvider } from "@mantine/modals"
import { Notifications } from "@mantine/notifications"

import { error, info } from "@postfmly/logger"
import { type Nullable, type Optional } from "@postfmly/types"

import { default as httpMethods } from "http-methods-constants"
import { createRoot } from "react-dom/client"

import { version } from "../package.json" with { type: "json" }
import { fetchClient } from "./api/index.ts"
import { Display } from "./components/Display/index.tsx"
import { env } from "./env.ts"
import { findElement, handleError } from "./utils/index.ts"
import { type IFetchClient } from "./utils/interfaces/IFetchClient.ts"

// biome-ignore lint/nursery/useExplicitType: inferred
const { SOBER_DEBUG: DEBUG } = env

if (DEBUG) {
  info(`Got UI version: ${version}`)
}

const getVersion = (v: Optional<string>): string => (v && v.length > 0 ? `v${v}` : "N/A")

const frontend: Nullable<HTMLElement> = findElement("#frontend")
if (frontend) {
  frontend.innerHTML = `<sup>UI</sup> ${version}`
}

// * NOTE: not using await, don't hold up page render
fetchClient<string>({
  endpoint: "version",
  method: httpMethods.GET
} satisfies IFetchClient)
  .then((data: Nullable<string>): void => {
    if (data === null) {
      throw new Error("Could not get API version")
    }

    const apiVersion: string = getVersion(data)

    if (DEBUG) {
      info(`Got API version: ${apiVersion}`)
    }

    const backend: Nullable<HTMLElement> = findElement("#backend")
    if (backend) {
      backend.innerHTML = `<sup>API</sup> ${apiVersion}`
    }
  })
  .catch((e: Error): void => {
    handleError(e)
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
  error("Could not find root element")
}
