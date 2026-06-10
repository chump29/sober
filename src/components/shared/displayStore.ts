import { default as pluralize } from "@jarrodek/pluralize"
import { default as dayjs } from "dayjs"
import { default as duration } from "dayjs/plugin/duration"
import { create } from "zustand"

dayjs.extend(duration)

interface IDisplayActions {
  setDisplay(date: string | null | undefined): void
  toggleLoadedFromUrl(): void
  toggleShowSettings(): void
}

interface IDisplay {
  actions: IDisplayActions
  days: string
  hours: string
  loadedFromUrl: boolean
  minutes: string
  months: string
  seconds: string
  showSettings: boolean
  weeks: string
  years: string
}

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
            const monthDuration: number = duration.asMonths()
            const months: number = monthDuration > 1 ? +monthDuration.toFixed(2) : 0
            const yearsDuration: number = duration.asYears()
            const years: number = yearsDuration > 1 ? +yearsDuration.toFixed(2) : 0

            return {
              days: days > 0 ? pluralize("day", days, true) : "",
              hours: hours > 0 ? pluralize("hour", hours, true) : "",
              minutes: minutes > 0 ? pluralize("minute", minutes, true) : "",
              months: months > 0 ? pluralize("month", months, true) : "",
              seconds: pluralize("second", seconds, true),
              weeks: weeks > 0 ? pluralize("week", weeks, true) : "",
              years: years > 0 ? pluralize("year", years, true) : ""
            } as IDisplay
          }),
        toggleLoadedFromUrl: (): void =>
          set((state: IDisplay) => ({
            loadedFromUrl: !state.loadedFromUrl
          })),
        toggleShowSettings: (): void =>
          set((state: IDisplay) => ({
            showSettings: !state.showSettings
          }))
      } satisfies IDisplayActions,
      days: "",
      hours: "",
      loadedFromUrl: false,
      minutes: "",
      months: "",
      seconds: "",
      showSettings: false,
      weeks: "",
      years: ""
    }) satisfies IDisplay
)

export const days = (): string => displayStore((state: IDisplay): string => state.days)
export const hours = (): string => displayStore((state: IDisplay): string => state.hours)
export const loadedFromUrl = (): boolean => displayStore((state: IDisplay): boolean => state.loadedFromUrl)
export const minutes = (): string => displayStore((state: IDisplay): string => state.minutes)
export const months = (): string => displayStore((state: IDisplay): string => state.months)
export const seconds = (): string => displayStore((state: IDisplay): string => state.seconds)
export const showSettings = (): boolean => displayStore((state: IDisplay): boolean => state.showSettings)
export const weeks = (): string => displayStore((state: IDisplay): string => state.weeks)
export const years = (): string => displayStore((state: IDisplay): string => state.years)

export const displayStoreActions = (): IDisplayActions =>
  displayStore((state: IDisplay): IDisplayActions => state.actions)
