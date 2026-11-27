import { type TablerIcon } from "@tabler/icons-react"

import { StatsType } from "../schemas.ts"

export interface IAlcohol {
  bloodPressure: number
  longTerm: number
  overall: number
  sleep: number
  type: typeof StatsType.Alcohol
}

export interface ISmoking {
  longTerm: number
  lungFunction: number
  overall: number
  oxygenation: number
  type: typeof StatsType.Smoking
}

export interface IHealthMap {
  [StatsType.Alcohol]: IAlcohol
  [StatsType.Smoking]: ISmoking
}

export type IHealth = IHealthMap[keyof IHealthMap]

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
