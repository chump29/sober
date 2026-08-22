import { type Nullable, type Nullish } from "@postfmly/types"

import { type ICoin } from "./ICoin.ts"
import { type ICost } from "./ICost.ts"
import { type ISubstance } from "./ISubstance.ts"

interface IDisplayActions {
  getDaysInt: () => number
  getMonthsFloat: () => number
  getSelectedSubstance: () => ISubstance
  getUser: () => Nullable<string>
  getWeeksFloat: () => number
  getYearsFloat: () => number

  setCoin: (data: Nullable<ICoin>) => void
  setCost: (data: Nullable<ICost>) => void
  setDisplay: (date: Nullish<string>) => void
  setSelectedSubstance: (data: ISubstance) => void
  setUser: (data: Nullable<string>) => void
}

interface IDisplay {
  actions: IDisplayActions
  coin: Nullable<ICoin>
  cost: Nullable<ICost>
  days: string
  daysInt: number
  hours: string
  minutes: string
  months: string
  monthsFloat: number
  seconds: string
  selectedSubstance: ISubstance
  user: Nullable<string>
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
