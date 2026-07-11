import { describe, expect, jest, test } from "bun:test"

import { fakerEN_US as fake } from "@faker-js/faker"

import { type IDisplay, type IDisplayActions } from "../../../src/utils/interfaces/IDisplay.ts"
import { getCoin, getCost, getSubstance, getUser } from "../Helpers.ts"
import { ICoinMatcher, ICostMatcher, ISubstanceMatcher, IUserMatcher } from "../Matchers.ts"

describe("IDisplay", (): void => {
  test("IDisplay", (): void => {
    const days: number = fake.number.int({
      max: 31,
      min: 1
    })
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
      actions: {
        setApiUnavailable: jest.fn(),
        setCoin: jest.fn(),
        setCost: jest.fn(),
        setCostValue: jest.fn(),
        setDisplay: jest.fn(),
        setSelectedSubstance: jest.fn(),
        setUserData: jest.fn(),
        setUserValue: jest.fn()
      } satisfies IDisplayActions,
      apiUnavailable: fake.datatype.boolean(),
      coin: getCoin(),
      cost: getCost(),
      costValue: Number(fake.commerce.price()),
      d: days,
      days: days.toString(),
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
          min: 0
        })
        .toString(),
      selectedSubstance: getSubstance(),
      userData: getUser(),
      userValue: fake.person.firstName(),
      w: weeks,
      weeks: weeks.toString(),
      y: years,
      years: years.toString()
    } satisfies IDisplay).toMatchObject({
      apiUnavailable: expect.any(Boolean),
      coin: ICoinMatcher,
      cost: ICostMatcher,
      costValue: expect.any(Number),
      d: expect.any(Number),
      days: expect.any(String),
      hours: expect.any(String),
      m: expect.any(Number),
      minutes: expect.any(String),
      months: expect.any(String),
      seconds: expect.any(String),
      selectedSubstance: ISubstanceMatcher,
      userData: IUserMatcher,
      userValue: expect.any(String),
      w: expect.any(Number),
      weeks: expect.any(String),
      y: expect.any(Number),
      years: expect.any(String),
      actions: {
        setApiUnavailable: expect.any(Function),
        setCoin: expect.any(Function),
        setCost: expect.any(Function),
        setCostValue: expect.any(Function),
        setDisplay: expect.any(Function),
        setSelectedSubstance: expect.any(Function),
        setUserData: expect.any(Function),
        setUserValue: expect.any(Function)
      }
    } satisfies IDisplay)
  })
})
