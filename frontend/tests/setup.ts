import { afterAll, afterEach, expect, mock, spyOn } from "bun:test"

// biome-ignore lint/performance/noNamespaceImport: proper setup
import * as matchers from "@testing-library/jest-dom/matchers"
import { cleanup } from "@testing-library/react"

import { env } from "../src/env.ts"

expect.extend(matchers)

if (!env.TEST_FULL) {
  spyOn(console, "info").mockReturnValue(undefined)
  spyOn(console, "error").mockReturnValue(undefined)

  // for fetchClient
  spyOn(console, "groupCollapsed").mockReturnValue(undefined)
  spyOn(console, "dir").mockReturnValue(undefined)
}

afterEach((): void => {
  cleanup()

  document.body.replaceChildren() // clear

  mock.clearAllMocks()
})

afterAll((): void => {
  mock.restore()
})
