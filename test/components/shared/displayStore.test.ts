import { beforeEach, describe, expect, test } from "bun:test"

import { fakerEN_US as fake } from "@faker-js/faker"
import { default as pluralize } from "@jarrodek/pluralize"
import { renderHook } from "@testing-library/react"
import { Big } from "big.js"
import { default as dayjs } from "dayjs"
import { default as duration } from "dayjs/plugin/duration"

import {
  days,
  displayStore,
  displayStoreActions,
  hours,
  minutes,
  months,
  seconds,
  weeks,
  years
} from "../../../src/components/shared/displayStore.ts"
import { type IDisplay } from "../../../src/components/shared/interfaces/IDisplay.ts"

dayjs.extend(duration)

const defaultState: IDisplay = displayStore.getState()

beforeEach((): void => {
  displayStore.setState(defaultState, true)
})

describe("displayStore", (): void => {
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

  test("hooks", (): void => {
    const date: string = fake.date
      .past({
        refDate: dayjs().subtract(2, "years").toDate(),
        years: 2
      })
      .toISOString()

    displayStore.getState().actions.setDisplay(date)

    const diff: duration.Duration = dayjs.duration(dayjs().diff(dayjs(date)))

    const { result: s } = renderHook((): string => seconds())
    expect(s.current).toBe(pluralize("second", Math.floor(diff.asSeconds()), true))

    const { result: m } = renderHook((): string => minutes())
    expect(m.current).toBe(pluralize("minute", Math.floor(diff.asMinutes()), true))

    const { result: h } = renderHook((): string => hours())
    expect(h.current).toBe(pluralize("hour", Math.floor(diff.asHours()), true))

    const { result: d } = renderHook((): string => days())
    expect(d.current).toBe(pluralize("day", Math.floor(diff.asDays()), true))

    const { result: w } = renderHook((): string => weeks())
    expect(w.current).toBe(pluralize("week", Math.floor(diff.asWeeks()), true))

    const { result: mo } = renderHook((): string => months())
    expect(mo.current).toBe(pluralize("month", Number(new Big(diff.asMonths()).toFixed(2, 0)), true))

    const { result: y } = renderHook((): string => years())
    expect(y.current).toBe(pluralize("year", Number(new Big(diff.asYears()).toFixed(2, 0)), true))
  })

  test("displayStoreActions", (): void => {
    renderHook((): void => {
      const { setDisplay } = displayStoreActions()

      setDisplay(null)
    })

    expect(displayStore.getState().seconds.length).toBe(0)
  })
})
