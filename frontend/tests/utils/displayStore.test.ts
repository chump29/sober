import { beforeEach, describe, expect, test } from "bun:test"

import { fakerEN_US as fake } from "@faker-js/faker"
import { default as pluralize } from "@jarrodek/pluralize"
import { renderHook } from "@testing-library/react"
import { Big } from "big.js"
import { default as dayjs } from "dayjs"
import { default as duration } from "dayjs/plugin/duration"

import {
  displayStore,
  displayStoreActions,
  getCoin as dsGetCoin,
  getCost as dsGetCost,
  getCostValue,
  getDays,
  getHours,
  getMinutes,
  getMonths,
  getSeconds,
  getSelectedSubstance,
  getUserData,
  getUserValue,
  getWeeks,
  getYears
} from "../../src/utils/displayStore.ts"
import { type ICoin } from "../../src/utils/interfaces/ICoin.ts"
import { type ICost } from "../../src/utils/interfaces/ICost.ts"
import { defaultSubstance, type ISubstance } from "../../src/utils/interfaces/ISubstance.ts"
import { type IUser } from "../../src/utils/interfaces/IUser.ts"
import { getCoin, getCost, getSubstance, getUser } from "./Helpers.ts"

dayjs.extend(duration)

beforeEach((): void => {
  displayStore.setState(displayStore.getInitialState(), true)
})

describe("displayStore", (): void => {
  test("setCoin", (): void => {
    const c: ICoin = getCoin()

    displayStore.getState().actions.setCoin(c)

    expect(displayStore.getState().coin).toBe(c)
  })

  test("setCost", (): void => {
    const c: ICost = getCost()

    displayStore.getState().actions.setCost(c)

    expect(displayStore.getState().cost).toBe(c)
  })

  test("setCostValue", (): void => {
    const c: number = Number(fake.commerce.price())

    displayStore.getState().actions.setCostValue(c)

    expect(displayStore.getState().costValue).toBe(c)
  })

  test("setDisplay", (): void => {
    const date: string = fake.date
      .past({
        refDate: dayjs().subtract(2, "years").toDate(),
        years: 2
      })
      .toISOString()

    displayStore.getState().actions.setDisplay(date)

    const diff: duration.Duration = dayjs.duration(dayjs().diff(dayjs(date)))

    expect(displayStore.getState().d).toBe(Math.floor(diff.asDays()))
    expect(displayStore.getState().w).toBe(Math.floor(diff.asWeeks()))
    expect(displayStore.getState().m).toBe(Math.floor(diff.asMonths()))
    expect(displayStore.getState().y).toBe(Math.floor(diff.asYears()))
  })

  test("setDisplay - fail", (): void => {
    displayStore.getState().actions.setDisplay(null)

    expect(displayStore.getState().d).toBe(0)
    expect(displayStore.getState().w).toBe(0)
    expect(displayStore.getState().m).toBe(0)
    expect(displayStore.getState().y).toBe(0)
  })

  test("setSelectedSubstance", (): void => {
    const s: ISubstance = getSubstance()

    displayStore.getState().actions.setSelectedSubstance(s)

    expect(displayStore.getState().selectedSubstance).toBe(s)
  })

  test("setUserData", (): void => {
    const u: IUser = getUser()

    displayStore.getState().actions.setUserData(u)

    expect(displayStore.getState().userData).toBe(u)
  })

  test("setUserValue", (): void => {
    const u: string = fake.person.firstName()

    displayStore.getState().actions.setUserValue(u)

    expect(displayStore.getState().userValue).toBe(u)
  })

  test("hooks", (): void => {
    const { result: coin } = renderHook((): ICoin | null => dsGetCoin())
    expect(coin.current).toBeNull()

    const { result: cost } = renderHook((): ICost | null => dsGetCost())
    expect(cost.current).toBeNull()

    const { result: costValue } = renderHook((): number | undefined => getCostValue())
    expect(costValue.current).toBeUndefined()

    const date: string = fake.date
      .past({
        refDate: dayjs().subtract(2, "years").toDate(),
        years: 2
      })
      .toISOString()

    displayStore.getState().actions.setDisplay(date)

    const diff: duration.Duration = dayjs.duration(dayjs().diff(dayjs(date)))

    const { result: s } = renderHook((): string => getSeconds())
    expect(s.current).toBe(pluralize("second", Math.floor(diff.asSeconds()), true))

    const { result: m } = renderHook((): string => getMinutes())
    expect(m.current).toBe(pluralize("minute", Math.floor(diff.asMinutes()), true))

    const { result: h } = renderHook((): string => getHours())
    expect(h.current).toBe(pluralize("hour", Math.floor(diff.asHours()), true))

    const { result: d } = renderHook((): string => getDays())
    expect(d.current).toBe(pluralize("day", Math.floor(diff.asDays()), true))

    const { result: w } = renderHook((): string => getWeeks())
    expect(w.current).toBe(pluralize("week", Math.floor(diff.asWeeks()), true))

    const { result: mo } = renderHook((): string => getMonths())
    expect(mo.current).toBe(pluralize("month", Number(new Big(diff.asMonths()).toFixed(2, 0)), true))

    const { result: y } = renderHook((): string => getYears())
    expect(y.current).toBe(pluralize("year", Number(new Big(diff.asYears()).toFixed(2, 0)), true))

    const { result: selectedSubstance } = renderHook((): ISubstance => getSelectedSubstance())
    expect(selectedSubstance.current).toBe(defaultSubstance)

    const { result: userData } = renderHook((): IUser | null => getUserData())
    expect(userData.current).toBeNull()

    const { result: userValue } = renderHook((): string | null => getUserValue())
    expect(userValue.current).toBeNull()
  })

  test("displayStoreActions", (): void => {
    renderHook((): void => {
      const { setCoin, setCost, setCostValue, setDisplay, setSelectedSubstance, setUserData, setUserValue } =
        displayStoreActions()

      setCoin(null)
      setCost(null)
      setCostValue(undefined)
      setDisplay(null)
      setSelectedSubstance(defaultSubstance)
      setUserData(null)
      setUserValue(null)
    })

    expect(displayStore.getState().coin).toBeNull()
    expect(displayStore.getState().cost).toBeNull()
    expect(displayStore.getState().costValue).toBeUndefined()
    expect(displayStore.getState().d).toBe(0)
    expect(displayStore.getState().days.length).toBe(0)
    expect(displayStore.getState().hours.length).toBe(0)
    expect(displayStore.getState().coin).toBeNull()
    expect(displayStore.getState().m).toBe(0)
    expect(displayStore.getState().minutes.length).toBe(0)
    expect(displayStore.getState().months.length).toBe(0)
    expect(displayStore.getState().seconds.length).toBe(0)
    expect(displayStore.getState().selectedSubstance).toBe(defaultSubstance)
    expect(displayStore.getState().userData).toBeNull()
    expect(displayStore.getState().userValue).toBeNull()
    expect(displayStore.getState().w).toBe(0)
    expect(displayStore.getState().weeks.length).toBe(0)
    expect(displayStore.getState().y).toBe(0)
    expect(displayStore.getState().years.length).toBe(0)
  })
})
