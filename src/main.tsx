import { StrictMode } from "react"

import { error, info } from "@postfmly/logger"

import { MantineProvider } from "@mantine/core"
import { ModalsProvider } from "@mantine/modals"
import { createRoot } from "react-dom/client"
import { type SafeParseResult, safeParse, summarize } from "valibot"

import { default as Display } from "./components/display/index.tsx"
import { findElement, getVersion } from "./components/shared/index.tsx"
import { StringAsBooleanSchema, VersionSchema } from "./components/shared/schemas.ts"

const d: SafeParseResult<StringAsBooleanSchema> = safeParse(StringAsBooleanSchema, import.meta.env.VITE_DEBUG)
const DEBUG: boolean = d.success ? d.output : false

let version: string = ""
const v: SafeParseResult<VersionSchema> = safeParse(VersionSchema, import.meta.env.PACKAGE_VERSION)
if (v.success) {
  version = v.output
} else {
  error("Could not parse UI version", summarize(v.issues))
}

version = getVersion(version)

if (DEBUG) {
  info(`Got UI version: ${version}`)
}

const span: HTMLElement | null = findElement("#version")
if (span) {
  span.innerHTML = `<span class="text-yellow">ᓚᘏᗢ</span> &nbsp; <span class="text-green">〃</span> &nbsp; <span class="text-red">&copy; 2026 postfmly</span> &nbsp; <span class="text-green">〃</span> &nbsp; <span class="text-blue">${version}</span>`
}

const div: HTMLElement | null = findElement("#root")
if (div) {
  createRoot(div).render(
    <StrictMode>
      <MantineProvider defaultColorScheme="dark">
        <ModalsProvider>
          <Display />
        </ModalsProvider>
      </MantineProvider>
    </StrictMode>
  )
} else {
  error("Could not find root element")
}
