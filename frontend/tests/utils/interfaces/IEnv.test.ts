import { describe, expect, test } from "bun:test"

import { env } from "../../../src/env.ts"
import { IEnvMatcher } from "../Matchers.ts"

describe("IEnv", (): void => {
  test("IEnv", (): void => {
    expect(env).toMatchObject(IEnvMatcher)
  })
})
