import { StrictMode } from "react"

import { MantineProvider } from "@mantine/core"
import { ModalsProvider } from "@mantine/modals"
import { createRoot } from "react-dom/client"
import { type SafeParseResult, safeParse, summarize } from "valibot"
import { error, info } from "@postfmly/logger"

import Dashboard from "./components/dashboard"
import { findElement, getVersion } from "./components/shared"
import { VersionSchema, BooleanSchema } from "./components/shared/schemas"

const d: SafeParseResult<BooleanSchema> = safeParse(BooleanSchema, import.meta.env.VITE_DEBUG)
const DEBUG: boolean = d.success ? d.output : false

let version: string = ""
const v: SafeParseResult<VersionSchema> = safeParse(VersionSchema, import.meta.env.PACKAGE_VERSION)
if (v.success) {
  version = v.output
} else {
  error("Could not parse UI version", summarize(v.issues))
}

version = await getVersion(version)

if (DEBUG) {
  info(`Got UI version: ${version}`)
}

;(await findElement("#frontend")).textContent = version

createRoot(await findElement("#root")).render(
  <StrictMode>
    <MantineProvider defaultColorScheme="dark">
      <ModalsProvider>
        <Dashboard />
      </ModalsProvider>
    </MantineProvider>
  </StrictMode>

)
