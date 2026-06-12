import { describe, expect, test } from "bun:test"

import { fakerEN_US as fake } from "@faker-js/faker"
import { type SafeParseResult, safeParse } from "valibot"

import { type ISoberDate, SoberDateSchema } from "../../../src/components/shared/interfaces/ISoberDate.ts"

describe("ISoberDate", (): void => {
  const soberDate: ISoberDate = {
    cost: fake.number.float({
      fractionDigits: 2,
      max: 1000,
      min: 1
    }),
    date: fake.date.soon().toISOString().split("T")[0],
    showCoin: fake.datatype.boolean(),
    showCost: fake.datatype.boolean()
  } satisfies ISoberDate

  test("SoberDateSchema", (): void => {
    expect(safeParse(SoberDateSchema, soberDate).success).toBeTrue()
  })

  test("SoberDateSchema - fail", (): void => {
    const bak: number | undefined = soberDate.cost

    soberDate.cost = 0

    const s: SafeParseResult<SoberDateSchema> = safeParse(SoberDateSchema, soberDate)

    expect(s.success).toBeFalse()
    expect(s.issues?.[0].message).toContain(">0")

    soberDate.cost = bak
  })

  test("ISoberDate", (): void => {
    expect(soberDate).toMatchObject({
      cost: expect.any(Number),
      date: expect.any(String),
      showCoin: expect.any(Boolean),
      showCost: expect.any(Boolean)
    } satisfies ISoberDate)
  })
})
