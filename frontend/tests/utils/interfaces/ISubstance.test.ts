import { describe, expect, test } from "bun:test"

import { defaultSubstance } from "../../../src/utils/interfaces/ISubstance.ts"
import { ISubstanceMatcher } from "../Matchers.ts"

describe("ISubstance", (): void => {
  test("ISubstance", (): void => {
    expect(defaultSubstance).toMatchObject(ISubstanceMatcher)
  })
})
