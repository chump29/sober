import { describe, expect, test } from "bun:test"

import { getCost } from "../Helpers.ts"
import { ICostMatcher } from "../Matchers.ts"

describe("ICost", (): void => {
  test("ICost", (): void => {
    expect(getCost()).toMatchObject(ICostMatcher)
  })
})
