import { type Nullable, type Nullish } from "@postfmly/types"

import { Big } from "big.js"
import { default as dayjs } from "dayjs"
import { default as duration } from "dayjs/plugin/duration"
import { create } from "zustand"

import { type ICost } from "./interfaces/ICost.ts"
import { defaultValues, type IDisplay, type IDisplayActions } from "./interfaces/IDisplay.ts"
import { defaultSubstance, type ISubstance } from "./interfaces/ISubstance.ts"

dayjs.extend(duration)

const displayStore = create<IDisplay>()(
  (set, get) =>
    ({
      actions: {
        getDaysNow: (): number => get().days,
        getMonthsNow: (): number => get().months,
        getSelectedSubstance: (): ISubstance => get().selectedSubstance,
        getUser: (): Nullable<string> => get().user,
        getWeeksNow: (): number => get().weeks,
        getYearsNow: (): number => get().years,

        setCost: (data: Nullable<ICost>): void =>
          set({
            cost: data
          }),
        setDisplay: (date: Nullish<string>): void =>
          set((): IDisplay => {
            if (!date) {
              return defaultValues as IDisplay
            }

            const diff: duration.Duration = dayjs.duration(dayjs().diff(dayjs(date)))

            const weeksDuration: number = diff.asWeeks()
            const monthsDuration: number = diff.asMonths()
            const yearsDuration: number = diff.asYears()

            return {
              days: Math.floor(diff.asDays()),
              hours: Math.floor(diff.asHours()),
              minutes: Math.floor(diff.asMinutes()),
              months: round(monthsDuration),
              seconds: Math.floor(diff.asSeconds()),
              weeks: round(weeksDuration),
              years: round(yearsDuration)
            } as IDisplay
          }),
        setSelectedSubstance: (data: ISubstance): void =>
          set({
            selectedSubstance: data
          }),
        setUser: (data: Nullable<string>): void =>
          set({
            user: data
          })
      } satisfies IDisplayActions,
      ...defaultValues,
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

export const getCost = (): Nullable<ICost> => displayStore((state: IDisplay): Nullable<ICost> => state.cost)
export const getDays = (): number => displayStore((state: IDisplay): number => state.days)
export const getHours = (): number => displayStore((state: IDisplay): number => state.hours)
export const getMinutes = (): number => displayStore((state: IDisplay): number => state.minutes)
export const getMonths = (): number => displayStore((state: IDisplay): number => state.months)
export const getSeconds = (): number => displayStore((state: IDisplay): number => state.seconds)
export const getWeeks = (): number => displayStore((state: IDisplay): number => state.weeks)
export const getYears = (): number => displayStore((state: IDisplay): number => state.years)

export const displayStoreActions = (): IDisplayActions =>
  displayStore((state: IDisplay): IDisplayActions => state.actions)

export { displayStore, round }
