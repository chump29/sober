import { describe, expect, jest, test } from "bun:test"

import { fakerEN_US as fake } from "@faker-js/faker"

import { type IDisplay } from "../../../src/components/shared/interfaces/IDisplay.ts"

describe("IDisplay", (): void => {
  test("IDisplay", (): void => {
    const months: number = fake.number.int({
      max: 12,
      min: 1
    })
    const weeks: number = fake.number.int({
      max: 52,
      min: 1
    })
    const years: number = fake.number.int({
      max: 3000,
      min: 2000
    })

    expect({
      days: fake.number
        .int({
          max: 31,
          min: 1
        })
        .toString(),
      hours: fake.number
        .int({
          max: 23,
          min: 0
        })
        .toString(),
      m: months,
      minutes: fake.number
        .int({
          max: 59,
          min: 0
        })
        .toString(),
      months: months.toString(),
      seconds: fake.number
        .int({
          max: 59,
          min: 1
        })
        .toString(),
      w: weeks,
      weeks: weeks.toString(),
      y: years,
      years: years.toString(),
      actions: {
        setDisplay: jest.fn()
      }
    } satisfies IDisplay).toMatchObject({
      days: expect.any(String),
      hours: expect.any(String),
      m: expect.any(Number),
      minutes: expect.any(String),
      months: expect.any(String),
      seconds: expect.any(String),
      w: expect.any(Number),
      weeks: expect.any(String),
      y: expect.any(Number),
      years: expect.any(String),
      actions: {
        setDisplay: expect.any(Function)
      }
    } satisfies IDisplay)
  })
})
