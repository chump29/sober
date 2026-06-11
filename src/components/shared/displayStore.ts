import { default as pluralize } from "@jarrodek/pluralize"
import { Big } from "big.js"
import { default as dayjs } from "dayjs"
import { default as duration } from "dayjs/plugin/duration"
import { create } from "zustand"

import { type IDisplay, type IDisplayActions } from "./interfaces/IDisplay.ts"

dayjs.extend(duration)

const displayStore = create<IDisplay>()(
  (set) =>
    ({
      actions: {
        setDisplay: (date: string | null | undefined): void =>
          set(() => {
            if (!date) {
              return {} as IDisplay
            }

            const duration: duration.Duration = dayjs.duration(dayjs().diff(dayjs(date)))
            const seconds: number = Math.floor(duration.asSeconds())
            const minutes: number = Math.floor(duration.asMinutes())
            const hours: number = Math.floor(duration.asHours())
            const days: number = Math.floor(duration.asDays())
            const weeks: number = Math.floor(duration.asWeeks())
            const monthsDuration: number = duration.asMonths()
            const months: number = monthsDuration > 1 ? +new Big(monthsDuration).toFixed(2, 0) : 0
            const yearsDuration: number = duration.asYears()
            const years: number = yearsDuration > 1 ? +new Big(yearsDuration).toFixed(2, 0) : 0

            return {
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
          })
      } satisfies IDisplayActions,
      days: "",
      hours: "",
      m: 0,
      minutes: "",
      months: "",
      seconds: "",
      w: 0,
      weeks: "",
      y: 0,
      years: ""
    }) satisfies IDisplay
)

export const days = (): string => displayStore((state: IDisplay): string => state.days)
export const hours = (): string => displayStore((state: IDisplay): string => state.hours)
export const minutes = (): string => displayStore((state: IDisplay): string => state.minutes)
export const months = (): string => displayStore((state: IDisplay): string => state.months)
export const seconds = (): string => displayStore((state: IDisplay): string => state.seconds)
export const weeks = (): string => displayStore((state: IDisplay): string => state.weeks)
export const years = (): string => displayStore((state: IDisplay): string => state.years)

export const displayStoreActions = (): IDisplayActions =>
  displayStore((state: IDisplay): IDisplayActions => state.actions)

export { displayStore }
