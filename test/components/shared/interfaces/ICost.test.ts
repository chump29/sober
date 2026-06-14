import { describe, expect, test } from "bun:test"

import { fakerEN_US as fake } from "@faker-js/faker"
import { Big } from "big.js"

import { type ICost } from "../../../../src/components/shared/interfaces/ICost.ts"

describe("ICost", (): void => {
  test("ICost", (): void => {
    const cost: number = fake.number.float({
      fractionDigits: 2,
      max: 100,
      min: 1
    })

    const DaysPerWeek: number = 7

    const costPerDay: number = cost / DaysPerWeek

    expect({
      cost,
      costPerDay: new Big(costPerDay).toFixed(2, 0)
    } satisfies ICost).toMatchObject({
      cost: expect.any(Number),
      costPerDay: expect.any(String)
    } satisfies ICost)
  })
})
