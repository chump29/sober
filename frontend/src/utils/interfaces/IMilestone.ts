import { type Dayjs } from "dayjs"

export interface IMilestoneDefinition {
  days?: number
  label: string
  months?: number
}

export interface IMilestone extends IMilestoneDefinition {
  completed: boolean
  targetDate: Dayjs
}
