import { MantineProvider } from "@mantine/core"
import { ModalsProvider } from "@mantine/modals"
import { Notifications } from "@mantine/notifications"

import { error, info } from "@postfmly/logger"

import { default as httpMethods } from "http-methods-constants"
import { createRoot } from "react-dom/client"

import { version } from "../package.json" with { type: "json" }
import { fetchClient } from "./api/index.ts"
import { default as Display } from "./components/Display/index.tsx"
import { DEBUG, findElement, getVersion, handleError, type Nullable, validate } from "./utils/index.ts"
import { type IFetchClient } from "./utils/interfaces/IFetchClient.ts"
import { VersionSchema } from "./utils/schemas.ts"

const uiVersion: string = getVersion(validate<string, VersionSchema>(version, VersionSchema) ?? "")

if (DEBUG) {
  info(`Got UI version: ${uiVersion}`)
}

const frontend: Nullable<HTMLElement> = findElement("#frontend")
if (frontend) {
  frontend.innerHTML = `<sup>UI</sup> ${uiVersion}`
}

let apiVersion: string = ""

// * NOTE: not using await, don't hold up page render
fetchClient<string>({
  endpoint: "version",
  method: httpMethods.GET
} satisfies IFetchClient)
  .then((data: Nullable<string>): void => {
    apiVersion = validate<string, VersionSchema>(data, VersionSchema) ?? ""
  })
  .catch((e: Error): void => {
    handleError(e)
  })
  .finally((): void => {
    apiVersion = getVersion(apiVersion)

    if (DEBUG) {
      info(`Got API version: ${apiVersion}`)
    }

    const backend: Nullable<HTMLElement> = findElement("#backend")
    if (backend) {
      backend.innerHTML = `<sup>API</sup> ${apiVersion}`
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
  error("Could not find root element")
}
