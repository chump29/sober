import { StrictMode } from "react"

import { error, info } from "@postfmly/logger"

import { MantineProvider } from "@mantine/core"
import { ModalsProvider } from "@mantine/modals"
import { createRoot } from "react-dom/client"
import { type SafeParseResult, safeParse, summarize } from "valibot"

import { default as Display } from "./components/display/index.tsx"
import { findElement, getVersion } from "./components/shared/index.tsx"
import { BooleanSchema, VersionSchema } from "./components/shared/schemas.ts"

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

;(await findElement("#version")).innerHTML =
  `<span class="text-green">ᓚᘏᗢ</span> &nbsp; <span class="text-blue">〃</span> &nbsp; <span class="text-red">&copy; 2026 postfmly</span> &nbsp; <span class="text-blue">〃</span> &nbsp; <span class="text-green">${version}</span>`

createRoot(await findElement("#root")).render(
  <StrictMode>
    <MantineProvider defaultColorScheme="dark">
      <ModalsProvider>
        <Display />
      </ModalsProvider>
    </MantineProvider>
  </StrictMode>
)
