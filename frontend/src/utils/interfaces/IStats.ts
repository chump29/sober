import { type TablerIcon } from "@tabler/icons-react"

export interface IHealth {
  bloodPressure: number
  longTerm: number
  overall: number
  sleep: number
}

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
