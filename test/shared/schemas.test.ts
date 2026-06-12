import { describe, expect, test } from "bun:test"

import { fakerEN_US as fake } from "@faker-js/faker"
import { type SafeParseResult, safeParse } from "valibot"

import {
  BooleanSchema,
  CostSchema,
  DateSchema,
  StringAsBooleanSchema,
  VersionSchema
} from "../../src/components/shared/schemas.ts"

describe("schemas", (): void => {
  test("VersionSchema", (): void => {
    expect(safeParse(VersionSchema, fake.system.semver()).success).toBeTrue()
  })

  test("VersionSchema - fail", (): void => {
    const v: SafeParseResult<VersionSchema> = safeParse(VersionSchema, "v0")

    expect(v.success).toBeFalse()
    expect(v.issues?.[0].message).toStartWith("Invalid SemVer")
  })

  test("StringAsBooleanSchema", (): void => {
    expect(safeParse(StringAsBooleanSchema, "true").success).toBeTrue()
  })

  test("StringAsBooleanSchema - fail", (): void => {
    const s: SafeParseResult<StringAsBooleanSchema> = safeParse(StringAsBooleanSchema, null)

    expect(s.success).toBeFalse()
    expect(s.issues?.[0].message).toStartWith("Invalid type: Expected string")
  })

  test("BooleanSchema", (): void => {
    expect(safeParse(BooleanSchema, true).success).toBeTrue()
  })

  test("BooleanSchema - fail", (): void => {
    const b: SafeParseResult<BooleanSchema> = safeParse(BooleanSchema, NaN)

    expect(b.success).toBeFalse()
    expect(b.issues?.[0].message).toStartWith("Invalid type: Expected boolean")
  })

  test("DateSchema", (): void => {
    expect(safeParse(DateSchema, fake.date.soon().toISOString().split("T")[0]).success).toBeTrue()
  })

  test("DateSchema - fail", (): void => {
    const d: SafeParseResult<DateSchema> = safeParse(DateSchema, "TEST")

    expect(d.success).toBeFalse()
    expect(d.issues?.[0].message).toStartWith("Not a valid ISO 8601 date")
  })

  test("CostSchema", (): void => {
    expect(
      safeParse(
        CostSchema,
        fake.number.float({
          min: 1
        })
      ).success
    ).toBeTrue()
  })

  test("CostSchema - fail", (): void => {
    const c: SafeParseResult<CostSchema> = safeParse(CostSchema, 0)

    expect(c.success).toBeFalse()
    expect(c.issues?.[0].message).toInclude(">0")
  })
})
