import { describe, expect, test } from "bun:test"

import { getCoin } from "../Helpers.ts"
import { ICoinMatcher } from "../Matchers.ts"

describe("ICoin", (): void => {
  test("ICoin", (): void => {
    expect(getCoin()).toMatchObject(ICoinMatcher)
  })
})
