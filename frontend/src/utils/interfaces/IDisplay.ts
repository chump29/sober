import { type ICoin } from "./ICoin.ts"
import { type ICost } from "./ICost.ts"
import { type ISubstance } from "./ISubstance.ts"
import { type IUser } from "./IUser.ts"

interface IDisplayActions {
  setApiUnavailable: (data: boolean) => void
  setCoin: (data: ICoin | null) => void
  setCost: (data: ICost | null) => void
  setCostValue: (data: number | undefined) => void
  setDisplay: (date: string | null | undefined) => void
  setSelectedSubstance: (data: ISubstance) => void
  setUserData: (data: IUser | null) => void
  setUserValue: (data: string | null) => void
}

interface IDisplay {
  actions: IDisplayActions
  apiUnavailable: boolean
  coin: ICoin | null
  cost: ICost | null
  costValue: number | undefined
  d: number
  days: string
  hours: string
  m: number
  minutes: string
  months: string
  seconds: string
  selectedSubstance: ISubstance
  userData: IUser | null
  userValue: string | null
  w: number
  weeks: string
  y: number
  years: string
}

export { type IDisplay, type IDisplayActions }
