import { describe, expect, test } from "bun:test"

import { getMonthAndYear } from "../Helpers.ts"
import { IMonthAndYearMatcher } from "../Matchers.ts"

describe("IMonthAndYear", (): void => {
  test("IMonthAndYear", (): void => {
    expect(getMonthAndYear()).toMatchObject(IMonthAndYearMatcher)
  })
})
