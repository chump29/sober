import { type Dayjs, default as dayjs } from "dayjs"
import { type Duration } from "dayjs/plugin/duration"
import { match } from "ts-pattern"

import { round, roundDown } from "./index.ts"
import { type IDisplayStats } from "./interfaces/IDisplay.ts"
import { type ISavings } from "./interfaces/ISavings.ts"
import { CostType } from "./schemas.ts"

const DAYS_PER_YEAR = 365.2425
const MONTHS_PER_YEAR = 12
const HOURS_PER_DAY = 24
const MINUTES_PER_HOUR = 60
const SECONDS_PER_MINUTE = 60
const DAYS_PER_MONTH: number = DAYS_PER_YEAR / MONTHS_PER_YEAR

const THREE_MONTHS = 3
const SIX_MONTHS = 6

const getDiff = (date: string, now: Dayjs = dayjs()): Duration => {
  const start = dayjs(date)

  return dayjs.duration(start.isValid() ? Math.max(0, now.diff(start)) : 0) // clamped at 0
}

export const TIME = {
  DAYS_2MO: DAYS_PER_MONTH * 2,
  DAYS_3MO: DAYS_PER_MONTH * THREE_MONTHS,
  DAYS_6MO: DAYS_PER_MONTH * SIX_MONTHS,
  DAYS_PER_FORTNIGHT: 14,
  DAYS_PER_MONTH,
  DAYS_PER_WEEK: 7,
  DAYS_PER_YEAR,

  MINUTES_PER_DAY: HOURS_PER_DAY * MINUTES_PER_HOUR,
  SECONDS_PER_DAY: HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE,
  HOURS_PER_DAY,

  MONTHS_PER_YEAR
} as const

export const calculateStats = (date: string, hasDecimals: boolean, now: Dayjs = dayjs()): IDisplayStats => {
  const diff = getDiff(date, now)

  const days = diff.asDays()
  const weeks = diff.asWeeks()
  const months = diff.asMonths()
  const years = diff.asYears()

  return {
    days: Math.floor(days),
    fortnights: Math.floor(days / TIME.DAYS_PER_FORTNIGHT),
    hours: Math.floor(diff.asHours()),
    minutes: Math.floor(diff.asMinutes()),
    months: hasDecimals ? round(months) : roundDown(months),
    seconds: Math.floor(diff.asSeconds()),
    weeks: hasDecimals ? round(weeks) : roundDown(weeks),
    years: hasDecimals ? round(years) : roundDown(years)
  }
}

export const calculateSavings = (date: string, cost: number, costType: CostType, now: Dayjs = dayjs()): ISavings => {
  const c = Math.max(0, cost) // clamped at 0

  const dailyCost = match<CostType, number>(costType)
    .with(CostType.Day, () => c)
    .with(CostType.Week, () => c / TIME.DAYS_PER_WEEK)
    .with(CostType.Month, () => c / TIME.DAYS_PER_MONTH)
    .with(CostType.Year, () => c / TIME.DAYS_PER_YEAR)
    .exhaustive()

  const days = getDiff(date, now).asDays()

  return {
    day: dailyCost,
    month: dailyCost * TIME.DAYS_PER_MONTH,
    months2: dailyCost * TIME.DAYS_2MO,
    months3: dailyCost * TIME.DAYS_3MO,
    months6: dailyCost * TIME.DAYS_6MO,
    next: dailyCost * (days + TIME.DAYS_PER_YEAR),
    today: dailyCost * days,
    week: dailyCost * TIME.DAYS_PER_WEEK,
    year: dailyCost * TIME.DAYS_PER_YEAR
  }
}
