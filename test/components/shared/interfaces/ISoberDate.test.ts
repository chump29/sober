import { describe, expect, test } from "bun:test"

import { fakerEN_US as fake } from "@faker-js/faker"
import { default as dayjs } from "dayjs"
import { type SafeParseResult, safeParse } from "valibot"

import { type ISoberDate, SoberDateSchema } from "../../../../src/components/shared/interfaces/ISoberDate.ts"
import { DATE_FORMAT } from "../../../../src/components/shared/schemas.ts"

describe("ISoberDate", (): void => {
  const soberDate: ISoberDate = {
    cost: Number(fake.commerce.price()),
    date: dayjs(fake.date.soon()).format(DATE_FORMAT),
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
