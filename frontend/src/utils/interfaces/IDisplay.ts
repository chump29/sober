import { type Nullable, type Nullish } from "@postfmly/types"

import { type ICost } from "./ICost.ts"
import { type ISubstance } from "./ISubstance.ts"

export interface IDisplayActions {
  getSelectedSubstanceNow: () => ISubstance
  getUserNow: () => Nullable<string>

  setDisplay: (date: Nullish<string>) => void
  setSelectedSubstance: (data: ISubstance) => void
  setUser: (data: Nullable<string>) => void
}

export interface IDisplayStats {
  days: number
  fortnights: number
  hours: number
  minutes: number
  months: number
  seconds: number
  weeks: number
  years: number
}

export interface IDisplay extends IDisplayStats {
  actions: IDisplayActions
  cost: Nullable<ICost>
  selectedSubstance: ISubstance
  user: Nullable<string>
}

export const defaultValues: IDisplayStats = {
  days: 0,
  fortnights: 0,
  hours: 0,
  minutes: 0,
  months: 0,
  seconds: 0,
  weeks: 0,
  years: 0
} as const
