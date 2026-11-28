import { type TablerIcon } from "@tabler/icons-react"

import { type StatsType } from "../schemas.ts"

interface IShared {
  longTerm: number
  overall: number
}

export interface IAlcohol extends IShared {
  bloodPressure: number
  sleep: number
  type: typeof StatsType.Alcohol
}

export interface ISmoking extends IShared {
  lungFunction: number
  oxygenation: number
  type: typeof StatsType.Smoking
}

// * NOTE: leaving I prefix even though type
export type IHealth = IAlcohol | ISmoking

export interface IStat {
  bg: string
  color: string
  description: string
  icon: TablerIcon
  isMoney?: boolean
  label: string
  value?: number | IHealth
}

export interface IChart {
  days: number
  label: string
  savings: number
}
