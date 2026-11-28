import { type Dayjs } from "dayjs"

// * NOTE: leaving I prefix even though types

export type IMilestoneDefinition =
  | {
      days: number
      label: string
      months?: never
    }
  | {
      days?: never
      label: string
      months: number
    }

export type IMilestone = IMilestoneDefinition & {
  completed: boolean
  targetDate: Dayjs
}
