import { type ICoin } from "./ICoin.ts"
import { type ICost } from "./ICost.ts"
import { type ISubstance } from "./ISubstance.ts"

interface IDisplayActions {
  getDaysInt: () => number
  getMonthsFloat: () => number
  getSelectedSubstance: () => ISubstance
  getUser: () => string | null
  getWeeksFloat: () => number
  getYearsFloat: () => number

  setCoin: (data: ICoin | null) => void
  setCost: (data: ICost | null) => void
  setDisplay: (date: string | null | undefined) => void
  setSelectedSubstance: (data: ISubstance) => void
  setUser: (data: string | null) => void
}

interface IDisplay {
  actions: IDisplayActions
  coin: ICoin | null
  cost: ICost | null
  days: string
  daysInt: number
  hours: string
  minutes: string
  months: string
  monthsFloat: number
  seconds: string
  selectedSubstance: ISubstance
  user: string | null
  weeks: string
  weeksFloat: number
  years: string
  yearsFloat: number
}

const defaultValues: Partial<IDisplay> = {
  days: "",
  daysInt: 0,
  hours: "",
  minutes: "",
  months: "",
  monthsFloat: 0,
  seconds: "",
  weeks: "",
  weeksFloat: 0,
  years: "",
  yearsFloat: 0
} as Partial<IDisplay>

export { defaultValues, type IDisplay, type IDisplayActions }
