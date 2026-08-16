import { default as pluralize } from "@jarrodek/pluralize"
import { Big } from "big.js"
import { default as dayjs } from "dayjs"
import { default as duration } from "dayjs/plugin/duration"
import { create } from "zustand"

import { type ICoin } from "./interfaces/ICoin.ts"
import { type ICost } from "./interfaces/ICost.ts"
import { defaultValues, type IDisplay, type IDisplayActions } from "./interfaces/IDisplay.ts"
import { defaultSubstance, type ISubstance } from "./interfaces/ISubstance.ts"

dayjs.extend(duration)

const displayStore = create<IDisplay>()(
  (set, get) =>
    ({
      actions: {
        getDaysInt: (): number => get().daysInt,
        getMonthsFloat: (): number => get().monthsFloat,
        getSelectedSubstance: (): ISubstance => get().selectedSubstance,
        getUser: (): string | null => get().user,
        getWeeksFloat: (): number => get().weeksFloat,
        getYearsFloat: (): number => get().yearsFloat,

        setCoin: (data: ICoin | null): void =>
          set({
            coin: data
          }),
        setCost: (data: ICost | null): void =>
          set({
            cost: data
          }),
        setDisplay: (date: string | null | undefined): void =>
          set((): IDisplay => {
            if (!date) {
              return defaultValues as IDisplay
            }

            const diff: duration.Duration = dayjs.duration(dayjs().diff(dayjs(date)))
            const seconds: number = Math.floor(diff.asSeconds())
            const minutes: number = Math.floor(diff.asMinutes())
            const hours: number = Math.floor(diff.asHours())
            const days: number = Math.floor(diff.asDays())
            const weeksDuration: number = diff.asWeeks()
            const weeks: number = round(weeksDuration)
            const monthsDuration: number = diff.asMonths()
            const months: number = round(monthsDuration)
            const yearsDuration: number = diff.asYears()
            const years: number = round(yearsDuration)

            return {
              days: days > 0 ? pluralize("day", days, true) : "",
              daysInt: days,
              hours: hours > 0 ? pluralize("hour", hours, true) : "",
              minutes: minutes > 0 ? pluralize("minute", minutes, true) : "",
              months: months > 0 ? pluralize("month", months, true) : "",
              monthsFloat: months,
              seconds: pluralize("second", seconds, true),
              weeks: weeks > 0 ? pluralize("week", weeks, true) : "",
              weeksFloat: weeks,
              years: years > 0 ? pluralize("year", years, true) : "",
              yearsFloat: years
            } as IDisplay
          }),
        setSelectedSubstance: (data: ISubstance): void =>
          set({
            selectedSubstance: data
          }),
        setUser: (data: string | null): void =>
          set({
            user: data
          })
      } satisfies IDisplayActions,
      ...defaultValues,
      coin: null,
      cost: null,
      selectedSubstance: defaultSubstance,
      user: null
    }) as IDisplay
)

// hoisted
const round = (num: number): number => {
  if (num < 1) {
    return 0
  }

  if (displayStore.getState().selectedSubstance.showDecimals) {
    return Number(new Big(num).toFixed(2, Big.roundDown))
  }

  return Math.floor(num)
}

export const getCoin = (): ICoin | null => displayStore((state: IDisplay): ICoin | null => state.coin)
export const getCost = (): ICost | null => displayStore((state: IDisplay): ICost | null => state.cost)
export const getDays = (): string => displayStore((state: IDisplay): string => state.days)
export const getHours = (): string => displayStore((state: IDisplay): string => state.hours)
export const getMinutes = (): string => displayStore((state: IDisplay): string => state.minutes)
export const getMonths = (): string => displayStore((state: IDisplay): string => state.months)
export const getSeconds = (): string => displayStore((state: IDisplay): string => state.seconds)
export const getWeeks = (): string => displayStore((state: IDisplay): string => state.weeks)
export const getYears = (): string => displayStore((state: IDisplay): string => state.years)

export const displayStoreActions = (): IDisplayActions =>
  displayStore((state: IDisplay): IDisplayActions => state.actions)

export { displayStore, round }
