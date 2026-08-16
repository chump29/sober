import { describe, expect, test } from "bun:test"

import { getSubstanceDisplay } from "../Helpers.ts"
import { ISubstanceDisplayMatcher } from "../Matchers.ts"

describe("ISubstanceDisplay", (): void => {
  test("ISubstanceDisplay", (): void => {
    expect(getSubstanceDisplay()).toMatchObject(ISubstanceDisplayMatcher)
  })
})
