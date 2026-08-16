import { describe, expect, test } from "bun:test"

import { defaultValues } from "../../../src/utils/interfaces/IDisplay.ts"
import { IDisplayMatcher } from "../Matchers.ts"

describe("IDisplay - defaultValues", (): void => {
  test("IDisplay", (): void => {
    expect(defaultValues).toMatchObject(IDisplayMatcher)
  })
})
