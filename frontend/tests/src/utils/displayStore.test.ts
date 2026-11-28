import { beforeEach, describe, expect, test } from "bun:test"

import { type Nullable } from "@postfmly/types"

import { fakerEN_US as fake } from "@faker-js/faker"
import { renderHook } from "@testing-library/react"
import { default as dayjs } from "dayjs"

import { TIME } from "../../../src/utils/calc.ts"
import {
  displayStore,
  displayStoreActions,
  useCost,
  useDays,
  useFortnights,
  useHours,
  useMinutes,
  useMonths,
  useSeconds,
  useSelectedSubstance,
  useWeeks,
  useYears
} from "../../../src/utils/displayStore.ts"
import { type ICost } from "../../../src/utils/interfaces/ICost.ts"
import { type IDisplayActions } from "../../../src/utils/interfaces/IDisplay.ts"
import { defaultSubstance, type ISubstance } from "../../../src/utils/interfaces/ISubstance.ts"
import { CostType, DATETIME_FORMAT } from "../../../src/utils/schemas.ts"
import { getSubstance } from "./helpers.ts"

beforeEach((): void => {
  displayStore.setState(displayStore.getInitialState(), true)
})

describe("displayStore", (): void => {
  test("verify defaults", (): void => {
    const state = displayStore.getState()

    expect(state.days).toBe(0) // only testing single value from defaultValues
    expect(state.cost).toBeNull()
    expect(state.selectedSubstance).toStrictEqual(defaultSubstance)
    expect(state.user).toBeNull()
  })

  test("user", (): void => {
    const name = fake.person.firstName()

    const { setUser, getUserNow } = displayStore.getState().actions

    setUser(name)

    expect(getUserNow()).toBe(name)

    setUser(null)

    expect(getUserNow()).toBeNull()
  })

  test("setSelectedSubstance, cost > 0", (): void => {
    const cost = Number(fake.commerce.price({ min: 1 }))

    const days = fake.number.int({ max: TIME.DAYS_PER_MONTH, min: 1 })

    const substance = getSubstance({
      cost,
      costType: CostType.Day,
      date: dayjs().subtract(days, "days").format(DATETIME_FORMAT)
    })

    const { setSelectedSubstance, getSelectedSubstanceNow } = displayStore.getState().actions

    setSelectedSubstance(substance)

    const state = displayStore.getState()

    expect(getSelectedSubstanceNow()).toStrictEqual(substance)
    expect(state.days).toBe(days)
    expect(state.cost?.costPer).toBe(cost)
  })

  test("setSelectedSubstance, cost = 0", (): void => {
    const days = fake.number.int({ max: 10, min: 1 })

    const substance = getSubstance({
      cost: 0,
      date: dayjs().subtract(days, "days").format(DATETIME_FORMAT)
    })

    displayStore.getState().actions.setSelectedSubstance(substance)

    expect(displayStore.getState().cost).toBeNull()
    expect(displayStore.getState().days).toBe(days)
  })

  test("setDisplay - date = null", (): void => {
    const cost = Number(fake.commerce.price())

    const days = fake.number.int({ max: TIME.DAYS_PER_MONTH, min: 1 })

    const substance = getSubstance({
      cost,
      costType: CostType.Day,
      date: dayjs().subtract(days, "days").format(DATETIME_FORMAT)
    })

    displayStore.getState().actions.setSelectedSubstance(substance)

    displayStore.getState().actions.setDisplay(null)

    expect(displayStore.getState().days).toBe(0)
    expect(displayStore.getState().cost).toBeNull()
  })

  test("setDisplay - update", (): void => {
    const cost = Number(fake.commerce.price())

    const days = fake.number.int({ max: TIME.DAYS_PER_MONTH, min: 1 })

    let date = dayjs().subtract(days, "days").format(DATETIME_FORMAT)

    const substance = getSubstance({
      cost,
      costType: CostType.Day,
      date
    })

    displayStore.getState().actions.setSelectedSubstance(substance)

    displayStore.getState().actions.setDisplay(date)

    expect(displayStore.getState().days).toBe(days)
    expect(displayStore.getState().cost).not.toBeNull()

    date = dayjs(date).subtract(1, "day").format(DATETIME_FORMAT)

    displayStore.getState().actions.setDisplay(date)

    expect(displayStore.getState().days).toBe(days + 1)
    expect(displayStore.getState().cost).not.toBeNull()
  })

  test("atomics return values", (): void => {
    const substance = getSubstance()

    displayStore.getState().actions.setSelectedSubstance(substance)

    expect(renderHook((): Nullable<ICost> => useCost()).result.current).toStrictEqual(displayStore.getState().cost)
    expect(renderHook((): number => useDays()).result.current).toBe(displayStore.getState().days)
    expect(renderHook((): number => useFortnights()).result.current).toBe(displayStore.getState().fortnights)
    expect(renderHook((): number => useHours()).result.current).toBe(displayStore.getState().hours)
    expect(renderHook((): number => useMinutes()).result.current).toBe(displayStore.getState().minutes)
    expect(renderHook((): number => useMonths()).result.current).toBe(displayStore.getState().months)
    expect(renderHook((): number => useSeconds()).result.current).toBe(displayStore.getState().seconds)
    expect(renderHook((): number => useWeeks()).result.current).toBe(displayStore.getState().weeks)
    expect(renderHook((): number => useYears()).result.current).toBe(displayStore.getState().years)
    expect(renderHook((): ISubstance => useSelectedSubstance()).result.current).toStrictEqual(substance)
    expect(renderHook((): IDisplayActions => displayStoreActions()).result.current).toBe(
      displayStore.getState().actions
    )
  })
})
