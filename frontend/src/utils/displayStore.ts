import { default as pluralize } from "@jarrodek/pluralize"
import { Big } from "big.js"
import { default as dayjs } from "dayjs"
import { default as duration } from "dayjs/plugin/duration"
import { create } from "zustand"

import { type ICoin } from "./interfaces/ICoin.ts"
import { type ICost } from "./interfaces/ICost.ts"
import { type IDisplay, type IDisplayActions } from "./interfaces/IDisplay.ts"
import { defaultSubstance, type ISubstance } from "./interfaces/ISubstance.ts"
import { type IUser } from "./interfaces/IUser.ts"

dayjs.extend(duration)

const displayStore = create<IDisplay>()(
  (set) =>
    ({
      actions: {
        setCoin: (data: ICoin | null): void =>
          set({
            coin: data
          }),
        setCost: (data: ICost | null): void =>
          set({
            cost: data
          }),
        setCostValue: (data: number | undefined): void =>
          set({
            costValue: data
          }),
        setDisplay: (date: string | null | undefined): void =>
          set(() => {
            if (!date) {
              return {} as IDisplay
            }

            const diff: duration.Duration = dayjs.duration(dayjs().diff(dayjs(date)))
            const seconds: number = Math.floor(diff.asSeconds())
            const minutes: number = Math.floor(diff.asMinutes())
            const hours: number = Math.floor(diff.asHours())
            const days: number = Math.floor(diff.asDays())
            const weeks: number = Math.floor(diff.asWeeks())
            const monthsDuration: number = diff.asMonths()
            const months: number = monthsDuration > 1 ? Number(new Big(monthsDuration).toFixed(2, 0)) : 0
            const yearsDuration: number = diff.asYears()
            const years: number = yearsDuration > 1 ? Number(new Big(yearsDuration).toFixed(2, 0)) : 0

            return {
              d: days,
              days: days > 0 ? pluralize("day", days, true) : "",
              hours: hours > 0 ? pluralize("hour", hours, true) : "",
              m: Math.floor(months),
              minutes: minutes > 0 ? pluralize("minute", minutes, true) : "",
              months: months > 0 ? pluralize("month", months, true) : "",
              seconds: pluralize("second", seconds, true),
              w: weeks,
              weeks: weeks > 0 ? pluralize("week", weeks, true) : "",
              y: Math.floor(years),
              years: years > 0 ? pluralize("year", years, true) : ""
            } as IDisplay
          }),
        setSelectedSubstance: (data: ISubstance): void =>
          set({
            selectedSubstance: data
          }),
        setUserData: (data: IUser | null): void =>
          set({
            userData: data
          }),
        setUserValue: (data: string | null): void =>
          set({
            userValue: data
          })
      } satisfies IDisplayActions,
      coin: null,
      cost: null,
      costValue: undefined,
      d: 0,
      days: "",
      hours: "",
      m: 0,
      minutes: "",
      months: "",
      seconds: "",
      selectedSubstance: defaultSubstance,
      userData: null,
      userValue: null,
      w: 0,
      weeks: "",
      y: 0,
      years: ""
    }) satisfies IDisplay
)

export const getCoin = (): ICoin | null => displayStore((state: IDisplay): ICoin | null => state.coin)
export const getCost = (): ICost | null => displayStore((state: IDisplay): ICost | null => state.cost)
export const getCostValue = (): number | undefined =>
  displayStore((state: IDisplay): number | undefined => state.costValue)
export const getDays = (): string => displayStore((state: IDisplay): string => state.days)
export const getHours = (): string => displayStore((state: IDisplay): string => state.hours)
export const getMinutes = (): string => displayStore((state: IDisplay): string => state.minutes)
export const getMonths = (): string => displayStore((state: IDisplay): string => state.months)
export const getSeconds = (): string => displayStore((state: IDisplay): string => state.seconds)
export const getSelectedSubstance = (): ISubstance =>
  displayStore((state: IDisplay): ISubstance => state.selectedSubstance)
export const getUserData = (): IUser | null => displayStore((state: IDisplay): IUser | null => state.userData)
export const getUserValue = (): string | null => displayStore((state: IDisplay): string | null => state.userValue)
export const getWeeks = (): string => displayStore((state: IDisplay): string => state.weeks)
export const getYears = (): string => displayStore((state: IDisplay): string => state.years)

export const displayStoreActions = (): IDisplayActions =>
  displayStore((state: IDisplay): IDisplayActions => state.actions)

export { displayStore }
