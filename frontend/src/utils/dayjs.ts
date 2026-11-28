import { default as dayjs } from "dayjs"
import { default as advancedFormat } from "dayjs/plugin/advancedFormat"
import { default as duration } from "dayjs/plugin/duration"
import { default as timezone } from "dayjs/plugin/timezone"
import { default as utc } from "dayjs/plugin/utc"

dayjs.extend(utc) // * NOTE: required for timezone
dayjs.extend(timezone)
dayjs.extend(advancedFormat) // * NOTE: for Do format option
dayjs.extend(duration)

dayjs.tz.setDefault(dayjs.tz.guess())
