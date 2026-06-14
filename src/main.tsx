import { StrictMode } from "react"

import { error, info } from "@postfmly/logger"

import { MantineProvider } from "@mantine/core"
import { ModalsProvider } from "@mantine/modals"
import { html, render, type TemplateResult } from "lit-html"
import { createRoot } from "react-dom/client"
import { type SafeParseResult, safeParse, summarize } from "valibot"

import { default as Display } from "./components/display/index.tsx"
import { findElement, getVersion } from "./components/shared/index.tsx"
import { StringAsBooleanSchema, TitleSchema, VersionSchema } from "./components/shared/schemas.ts"

const debug: SafeParseResult<StringAsBooleanSchema> = safeParse(StringAsBooleanSchema, import.meta.env.VITE_DEBUG)
const DEBUG: boolean = debug.success ? debug.output : false

const validatedTitle: SafeParseResult<TitleSchema> = safeParse(TitleSchema, import.meta.env.VITE_TITLE)
if (validatedTitle.success) {
  const title: HTMLElement | null = findElement("#title")
  if (title) {
    const template = (arrTitle: string[]): TemplateResult =>
      html`${arrTitle[0]} <img class="sm:flex md:inline mx-auto mt-5" src="sober.webp" title=${arrTitle.join(" ")}> ${arrTitle[1]}`
    render(template(validatedTitle.output.split(" ")), title)
  }
} else {
  error("Could not parse title", summarize(validatedTitle.issues))
}

let uiVersion: string = ""
const validatedUiVersion: SafeParseResult<VersionSchema> = safeParse(VersionSchema, import.meta.env.PACKAGE_VERSION)
if (validatedUiVersion.success) {
  uiVersion = validatedUiVersion.output
} else {
  error("Could not parse UI version", summarize(validatedUiVersion.issues))
}

uiVersion = getVersion(uiVersion)

if (DEBUG) {
  info(`Got UI version: ${uiVersion}`)
}

const version: HTMLElement | null = findElement("#version")
if (version) {
  version.innerHTML = `<span class="text-yellow">ᓚᘏᗢ</span> &nbsp; <span class="text-green">〃</span> &nbsp; <span class="text-red">&copy; 2026 postfmly</span> &nbsp; <span class="text-green">〃</span> &nbsp; <span class="text-blue">${uiVersion}</span>`
}

const root: HTMLElement | null = findElement("#root")
if (root) {
  createRoot(root).render(
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
