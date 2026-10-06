import { beforeEach, describe, expect, test } from "bun:test"

import { type Nullable } from "@postfmly/types"

import { fakerEN_US as fake } from "@faker-js/faker"
import { renderHook } from "@testing-library/react"
import { default as dayjs } from "dayjs"
import { default as duration } from "dayjs/plugin/duration"

import { displayStore, displayStoreActions, round } from "../../src/utils/displayStore.ts"
import { type ICost } from "../../src/utils/interfaces/ICost.ts"
import { type IDisplayActions } from "../../src/utils/interfaces/IDisplay.ts"
import { type ISubstance } from "../../src/utils/interfaces/ISubstance.ts"
import { DATETIME_FORMAT } from "../../src/utils/schemas.ts"
import { getCost, getSubstance } from "./Helpers.ts"

dayjs.extend(duration)

let date: Nullable<string> = null
let diff: Nullable<duration.Duration> = null

const setDisplay = (): void => {
  displayStore.getState().actions.setDisplay(date)
}

beforeEach((): void => {
  displayStore.setState(displayStore.getInitialState(), true)

  date = dayjs(fake.date.past({ years: { max: 10, min: 1 } })).format(DATETIME_FORMAT)

  diff = dayjs.duration(dayjs().diff(dayjs(date)))

  setDisplay()
})

describe("displayStore", (): void => {
  test("Cost", (): void => {
    const c: ICost = getCost()

    displayStore.getState().actions.setCost(c)

    const cost: Nullable<ICost> = displayStore.getState().cost

    expect(cost).toBe(c)
  })

  test("Days", (): void => {
    const days: number = Math.floor(diff?.asDays() ?? 0)

    expect(displayStore.getState().days).toBe(days)
  })

  test("Hours", (): void => {
    const hours: number = Math.floor(diff?.asHours() ?? 0)

    expect(displayStore.getState().hours).toBe(hours)
  })

  test("Minutes", (): void => {
    const minutes: number = Math.floor(diff?.asMinutes() ?? 0)

    expect(displayStore.getState().minutes).toBe(minutes)
  })

  test("Months", (): void => {
    const months: number = round(diff?.asMonths() ?? 0)

    expect(displayStore.getState().months).toBe(months)
  })

  test("Seconds", (): void => {
    const seconds: number = Math.floor(diff?.asSeconds() ?? 0)

    expect(displayStore.getState().seconds).toBe(seconds)
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

    expect(displayStore.getState().weeks).toBe(weeks)
  })

  test("Years", (): void => {
    const years: number = round(diff?.asYears() ?? 0)

    expect(displayStore.getState().years).toBe(years)
  })

  test("Years - <1", (): void => {
    date = dayjs().format(DATETIME_FORMAT)

    setDisplay()

    expect(displayStore.getState().years).toBe(0)
  })

  test("Years - !showDecimals", (): void => {
    const substance: ISubstance = getSubstance()
    substance.showDecimals = false

    displayStore.setState({ selectedSubstance: substance })

    setDisplay()

    const years: number = Math.floor(diff?.asYears() ?? 0)

    expect(displayStore.getState().years).toBe(years)
  })

  test("Invalid date", (): void => {
    displayStore.getState().actions.setDisplay(null)

    expect(displayStore.getState().days).toBe(0)
    expect(displayStore.getState().hours).toBe(0)
    expect(displayStore.getState().minutes).toBe(0)
    expect(displayStore.getState().months).toBe(0)
    expect(displayStore.getState().seconds).toBe(0)
    expect(displayStore.getState().weeks).toBe(0)
    expect(displayStore.getState().years).toBe(0)
  })

  test("displayStoreActions", (): void => {
    const { result } = renderHook((): IDisplayActions => displayStoreActions())

    expect(result.current).toBeDefined()
  })
})
