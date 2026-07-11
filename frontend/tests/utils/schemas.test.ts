import { describe, expect, test } from "bun:test"

import { fakerEN_US as fake } from "@faker-js/faker"
import { default as dayjs } from "dayjs"
import { default as httpMethods } from "http-methods-constants"
import { type SafeParseResult, safeParse } from "valibot"

import {
  BooleanSchema,
  CostSchema,
  DATE_FORMAT,
  DateSchema,
  IdSchema,
  MAX_LEN_STR,
  MethodSchema,
  NameSchema,
  StringAsBooleanSchema,
  StringSchema,
  TimeoutSchema,
  TitleSchema,
  UrlSchema,
  VersionSchema
} from "../../src/utils/schemas.ts"

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
    const b: SafeParseResult<BooleanSchema> = safeParse(BooleanSchema, Number.NaN)

    expect(b.success).toBeFalse()
    expect(b.issues?.[0].message).toStartWith("Invalid type: Expected boolean")
  })

  test("DateSchema", (): void => {
    expect(safeParse(DateSchema, dayjs(fake.date.soon()).format(DATE_FORMAT)).success).toBeTrue()
  })

  test("DateSchema - fail", (): void => {
    const d: SafeParseResult<DateSchema> = safeParse(DateSchema, "TEST")

    expect(d.success).toBeFalse()
    expect(d.issues?.[0].message).toStartWith("Not a valid ISO 8601 date")
  })

  test("UrlSchema", (): void => {
    expect(safeParse(UrlSchema, fake.internet.url()).success).toBeTrue()
  })

  test("UrlSchema - fail", (): void => {
    const u: SafeParseResult<UrlSchema> = safeParse(UrlSchema, "test")

    expect(u.success).toBeFalse()
    expect(u.issues?.[0].message).toStartWith("Invalid URL")
  })

  test("TimeoutSchema", (): void => {
    expect(
      safeParse(
        TimeoutSchema,
        `${fake.number.int({
          max: 5,
          min: 1
        })}${fake.helpers.arrayElement<string>([
          "s",
          "m"
        ])}`
      ).success
    ).toBeTrue()
  })

  test("TimeoutSchema - fail", (): void => {
    const t: SafeParseResult<TimeoutSchema> = safeParse(TimeoutSchema, "1ms")

    expect(t.success).toBeFalse()
    expect(t.issues?.[0].message).toContain(">=200") // MIN_TIMEOUT
  })

  test("CostSchema", (): void => {
    expect(safeParse(CostSchema, Number(fake.commerce.price())).success).toBeTrue()
  })

  test("CostSchema - fail", (): void => {
    const c: SafeParseResult<CostSchema> = safeParse(CostSchema, 0)

    expect(c.success).toBeFalse()
    expect(c.issues?.[0].message).toInclude(">0")
  })

  test("NameSchema", (): void => {
    expect(safeParse(NameSchema, fake.person.firstName()).success).toBeTrue()
  })

  test("NameSchema - fail", (): void => {
    const n: SafeParseResult<NameSchema> = safeParse(NameSchema, fake.string.alphanumeric(MAX_LEN_STR + 1))

    expect(n.success).toBeFalse()
    expect(n.issues?.[0].message).toContain(`<=${MAX_LEN_STR}`)
  })

  test("IdSchema", (): void => {
    expect(
      safeParse(
        IdSchema,
        fake.number.int({
          max: 100,
          min: 1
        })
      ).success
    ).toBeTrue()
  })

  test("IdSchema - fail", (): void => {
    const i: SafeParseResult<IdSchema> = safeParse(IdSchema, 0)

    expect(i.success).toBeFalse()
    expect(i.issues?.[0].message).toContain(">0")
  })

  test("TitleSchema", (): void => {
    let words: string
    // * NOTE: hyphens are word breaks, do not use
    do {
      words = fake.word.words(2)
    } while (words.includes("-"))

    expect(safeParse(TitleSchema, words).success).toBeTrue()
  })

  test("TitleSchema - fail", (): void => {
    const t: SafeParseResult<TitleSchema> = safeParse(TitleSchema, fake.word.words(1))

    expect(t.success).toBeFalse()
    expect(t.issues?.[0].message).toContain("Expected 2")
  })

  test("StringSchema", (): void => {
    expect(safeParse(StringSchema, fake.word.sample()).success).toBeTrue()
  })

  test("StringSchema - fail", (): void => {
    const s: SafeParseResult<StringSchema> = safeParse(StringSchema, "")

    expect(s.success).toBeFalse()
    expect(s.issues?.[0].message).toContain("!0")
  })

  test("MethodSchema", (): void => {
    expect(safeParse(MethodSchema, fake.helpers.objectKey(httpMethods)))
  })

  test("MethodSchema - fail", (): void => {
    const m: SafeParseResult<MethodSchema> = safeParse(MethodSchema, "nop")

    expect(m.success).toBeFalse()
    expect(m.issues?.[0].message).toStartWith("Invalid type")
  })
})
