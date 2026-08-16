import { beforeEach, describe, expect, test } from "bun:test"

import { fakerEN_US as fake } from "@faker-js/faker"
import { default as pluralize } from "@jarrodek/pluralize"
import { renderHook } from "@testing-library/react"
import { default as dayjs } from "dayjs"
import { default as duration } from "dayjs/plugin/duration"

import { displayStore, displayStoreActions, round } from "../../src/utils/displayStore.ts"
import { type ICoin } from "../../src/utils/interfaces/ICoin.ts"
import { type ICost } from "../../src/utils/interfaces/ICost.ts"
import { type IDisplayActions } from "../../src/utils/interfaces/IDisplay.ts"
import { type ISubstance } from "../../src/utils/interfaces/ISubstance.ts"
import { DATE_FORMAT } from "../../src/utils/schemas.ts"
import { getCoin, getCost, getSubstance } from "./Helpers.ts"

dayjs.extend(duration)

let date: string | null = null
let diff: duration.Duration | null = null

const setDisplay = (): void => {
  displayStore.getState().actions.setDisplay(date)
}

beforeEach((): void => {
  displayStore.setState(displayStore.getInitialState(), true)

  date = dayjs(fake.date.past({ years: { max: 10, min: 1 } })).format(DATE_FORMAT)

  diff = dayjs.duration(dayjs().diff(dayjs(date)))

  setDisplay()
})

describe("displayStore", (): void => {
  test("Coin", (): void => {
    const c: ICoin = getCoin()

    displayStore.getState().actions.setCoin(c)

    expect(displayStore.getState().coin).toBe(c)
  })

  test("Cost", (): void => {
    const c: ICost = getCost()

    displayStore.getState().actions.setCost(c)

    const cost: ICost | null = displayStore.getState().cost

    expect(cost).toBe(c)
  })

  test("Days", (): void => {
    const days: number = Math.floor(diff?.asDays() ?? 0)

    expect(displayStore.getState().days).toBe(days > 0 ? pluralize("day", days, true) : "")
  })

  test("Hours", (): void => {
    const hours: number = Math.floor(diff?.asHours() ?? 0)

    expect(displayStore.getState().hours).toBe(hours > 0 ? pluralize("hour", hours, true) : "")
  })

  test("Minutes", (): void => {
    const minutes: number = Math.floor(diff?.asMinutes() ?? 0)

    expect(displayStore.getState().minutes).toBe(minutes > 0 ? pluralize("minute", minutes, true) : "")
  })

  test("Months", (): void => {
    const months: number = round(diff?.asMonths() ?? 0)

    expect(displayStore.getState().months).toBe(months > 0 ? pluralize("month", months, true) : "")
  })

  test("Seconds", (): void => {
    const seconds: number = Math.floor(diff?.asSeconds() ?? 0)

    expect(displayStore.getState().seconds).toBe(pluralize("second", seconds, true))
  })

  test("SelectedSubstance", (): void => {
    const substance: ISubstance = getSubstance()

    displayStore.getState().actions.setSelectedSubstance(substance)

    expect(displayStore.getState().selectedSubstance).toBe(substance)
  })

  test("User", (): void => {
    const user: string = fake.person.firstName()

    displayStore.getState().actions.setUser(user)

    expect(displayStore.getState().user).toBe(user)
  })

  test("Weeks", (): void => {
    const weeks: number = round(diff?.asWeeks() ?? 0)

    expect(displayStore.getState().weeks).toBe(weeks > 0 ? pluralize("week", weeks, true) : "")
  })

  test("Years", (): void => {
    const years: number = round(diff?.asYears() ?? 0)

    expect(displayStore.getState().years).toBe(years > 0 ? pluralize("year", years, true) : "")
  })

  test("Years - <1", (): void => {
    date = dayjs().format(DATE_FORMAT)

    setDisplay()

    expect(displayStore.getState().years).toBe("")
  })

  test("Years - !showDecimals", (): void => {
    const substance: ISubstance = getSubstance()
    substance.showDecimals = false

    displayStore.setState({ selectedSubstance: substance })

    setDisplay()

    const years: number = Math.floor(diff?.asYears() ?? 0)

    expect(displayStore.getState().years).toBe(pluralize("year", years, true))
  })

  test("Invalid date", (): void => {
    displayStore.getState().actions.setDisplay(null)

    expect(displayStore.getState().days).toBe("")
    expect(displayStore.getState().daysInt).toBe(0)
    expect(displayStore.getState().hours).toBe("")
    expect(displayStore.getState().minutes).toBe("")
    expect(displayStore.getState().months).toBe("")
    expect(displayStore.getState().monthsFloat).toBe(0)
    expect(displayStore.getState().seconds).toBe("")
    expect(displayStore.getState().weeks).toBe("")
    expect(displayStore.getState().weeksFloat).toBe(0)
    expect(displayStore.getState().years).toBe("")
    expect(displayStore.getState().yearsFloat).toBe(0)
  })

  test("displayStoreActions", (): void => {
    const { result } = renderHook((): IDisplayActions => displayStoreActions())

    expect(result.current).toBeDefined()
  })
})
