import { type Nullable, type Nullish } from "@postfmly/types"

import { type ICost } from "./ICost.ts"
import { type ISubstance } from "./ISubstance.ts"

interface IDisplayActions {
  getDaysNow: () => number
  getMonthsNow: () => number
  getSelectedSubstance: () => ISubstance
  getUser: () => Nullable<string>
  getWeeksNow: () => number
  getYearsNow: () => number

  setCost: (data: Nullable<ICost>) => void
  setDisplay: (date: Nullish<string>) => void
  setSelectedSubstance: (data: ISubstance) => void
  setUser: (data: Nullable<string>) => void
}

interface IDisplay {
  actions: IDisplayActions
  cost: Nullable<ICost>
  days: number
  hours: number
  minutes: number
  months: number
  seconds: number
  selectedSubstance: ISubstance
  user: Nullable<string>
  weeks: number
  years: number
}

const defaultValues: Partial<IDisplay> = {
  days: 0,
  hours: 0,
  minutes: 0,
  months: 0,
  seconds: 0,
  weeks: 0,
  years: 0
} as Partial<IDisplay>

export { defaultValues, type IDisplay, type IDisplayActions }
