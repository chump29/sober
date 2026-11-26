import { type Dayjs, default as dayjs } from "dayjs"
import { type Duration, default as duration } from "dayjs/plugin/duration"
import { match } from "ts-pattern"

import { round, roundDown } from "./index.ts"
import { type IDisplayStats } from "./interfaces/IDisplay.ts"
import { type ISavings } from "./interfaces/ISavings.ts"
import { CostType } from "./schemas.ts"

dayjs.extend(duration)

const DAYS_PER_FORTNIGHT = 14
const DAYS_PER_YEAR = 365.2425
const MONTHS_PER_YEAR = 12
const HOURS_PER_DAY = 24
const MINUTES_PER_HOUR = 60
const SECONDS_PER_MINUTE = 60

const getDiff = (date: string, now: Dayjs = dayjs()): Duration => dayjs.duration(now.diff(dayjs(date)))

export const TIME = {
  DAYS_6MO: DAYS_PER_YEAR / 2,
  DAYS_30: 30,
  DAYS_60: 60,
  DAYS_90: 90,
  DAYS_PER_FORTNIGHT,
  DAYS_PER_MONTH: DAYS_PER_YEAR / MONTHS_PER_YEAR,
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
    days: Math.floor(diff.asDays()),
    fortnights: Math.floor(days / DAYS_PER_FORTNIGHT),
    hours: Math.floor(diff.asHours()),
    minutes: Math.floor(diff.asMinutes()),
    months: hasDecimals ? round(months) : roundDown(months),
    seconds: Math.floor(diff.asSeconds()),
    weeks: hasDecimals ? round(weeks) : roundDown(weeks),
    years: hasDecimals ? round(years) : roundDown(years)
  }
}

export const calculateSavings = (date: string, cost: number, costType: CostType, now: Dayjs = dayjs()): ISavings => {
  const dailyCost = match<CostType, number>(costType)
    .with(CostType.Day, () => cost)
    .with(CostType.Week, () => cost / TIME.DAYS_PER_WEEK)
    .with(CostType.Month, () => cost / TIME.DAYS_PER_MONTH)
    .with(CostType.Year, () => cost / TIME.DAYS_PER_YEAR)
    .exhaustive()

  const days = getDiff(date, now).asDays()

  return {
    day: dailyCost,
    month: dailyCost * TIME.DAYS_30,
    months2: dailyCost * TIME.DAYS_60,
    months3: dailyCost * TIME.DAYS_90,
    months6: dailyCost * TIME.DAYS_6MO,
    next: dailyCost * (days + TIME.DAYS_PER_YEAR),
    today: dailyCost * days,
    week: dailyCost * TIME.DAYS_PER_WEEK,
    year: dailyCost * TIME.DAYS_PER_YEAR
  }
}
