import { describe, expect, test } from "bun:test"

import { type SafeParseResult, safeParse } from "valibot"

import { type ISubstance, SubstanceSchema } from "../../../src/utils/interfaces/ISubstance.ts"
import { getSubstance } from "../Helpers.ts"

describe("ISubstance", (): void => {
  const substance: ISubstance = getSubstance()

  test("ISubstance", (): void => {
    expect(safeParse(SubstanceSchema, substance).success).toBeTrue()
  })

  test("ISubstance - fail", (): void => {
    substance.id = 0

    const s: SafeParseResult<SubstanceSchema> = safeParse(SubstanceSchema, substance)

    expect(s.success).toBeFalse()
    expect(s.issues?.[0].message).toContain(">0")
  })
})
