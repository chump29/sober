import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type JSX,
  type RefObject
} from "react"

import { daysToWeeks, formatDistanceToNowStrict } from "date-fns"
import { toZonedTime } from "date-fns-tz"
import pluralize from "pluralize"

import Coin from "../coin"

const tz: string = Intl.DateTimeFormat().resolvedOptions().timeZone

const urlParam: URLSearchParams = new URLSearchParams(window.location.search)
const soberDateFormat = /^\d{4}-\d{1,2}-\d{1,2}$/ // YYYY-MM-DD

export default function Dashboard(): JSX.Element {
  const soberDate: string = localStorage.getItem("soberDate") || getNewDate()

  const [date, setDate] = useState<Date>(getDateFromString(soberDate))
  const [seconds, setSeconds] = useState<string>("")
  const [minutes, setMinutes] = useState<string>("")
  const [hours, setHours] = useState<string>("")
  const [days, setDays] = useState<string>("")
  const [weeks, setWeeks] = useState<string>("")
  const [months, setMonths] = useState<string>("")
  const [years, setYears] = useState<string>("")

  const loadedDateFromUrl: RefObject<boolean> = useRef<boolean>(false)

  if (urlParam.has("soberDate") && !loadedDateFromUrl.current) {
    const soberDateParam = urlParam.get("soberDate")
    if (soberDateParam && soberDateFormat.test(soberDateParam)) {
      setDate(getDateFromString(soberDateParam))
      loadedDateFromUrl.current = true
    }
  }

  function getDateFromString(date: string): Date {
    return new Date(toZonedTime(date, tz))
  }

  function getNewDate(date: Date | null = null): string {
    const dateNow: Date = date || new Date()
    return `${dateNow.getFullYear()}-${(dateNow.getMonth() + 1).toString().padStart(2, "0")}-${dateNow.getDate().toString().padStart(2, "0")}`
  }

  function toComma(num: string): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  function parse(str: string): string {
    return str.startsWith("0") ? "" : str
  }

  function setSoberDate(str: string): void {
    if (localStorage.getItem("soberDate") !== str) {
      localStorage.setItem("soberDate", str)
    }
  }

  function setNewSoberDate(date: Date): void {
    setDate(date)
    setSoberDate(getNewDate(date))
  }

  function handleDateChange(e: ChangeEvent<HTMLInputElement>): void {
    setNewSoberDate(
      new Date(toZonedTime((e.target.value ||= getNewDate()), tz))
    )
    e.target.blur()
  }

  useEffect(() => {
    if (!date) {
      return
    }

    const interval: number = setInterval(() => {
      setNewSoberDate(new Date(toZonedTime(date, tz)))
    }, 1000)

    setSeconds(
      toComma(
        formatDistanceToNowStrict(date, {
          roundingMethod: "floor",
          unit: "second"
        })
      )
    )
    setMinutes(
      toComma(
        formatDistanceToNowStrict(date, {
          roundingMethod: "floor",
          unit: "minute"
        })
      )
    )
    setHours(
      toComma(
        formatDistanceToNowStrict(date, {
          roundingMethod: "floor",
          unit: "hour"
        })
      )
    )
    const d: string = formatDistanceToNowStrict(date, {
      roundingMethod: "floor",
      unit: "day"
    })
    setDays(toComma(d))
    setWeeks(toComma(pluralize("week", daysToWeeks(parseInt(d)), true)))
    setMonths(
      toComma(
        formatDistanceToNowStrict(date, {
          roundingMethod: "floor",
          unit: "month"
        })
      )
    )
    setYears(
      toComma(
        formatDistanceToNowStrict(date, {
          roundingMethod: "floor",
          unit: "year"
        })
      )
    )

    return (): void => clearInterval(interval)
  }, [date])

  return (
    <>
      <div className="text-center mt-20 font-bold">
        <form>
          <label
            className="text-3xl italic text-[#66cc00] text-shadow-[3px_3px_6px_#000000]"
            htmlFor="date">
            Sober since:
          </label>
          <div>
            <input
              className="text-center border rounded-xl w-40 mt-2 text-[#ccffff] cursor-text"
              data-testid="date"
              defaultValue={date?.toISOString().substring(0, 10)}
              id="date"
              max={getNewDate()}
              title="Sober date"
              type="date"
              onChange={handleDateChange}
            />
          </div>
        </form>
      </div>
      <div className="text-4xl text-center font-bold mt-20 text-[#66ccff] font-counter">
        {seconds}
        <br />
        {parse(minutes)}
        <br />
        {parse(hours)}
        <br />
        {parse(days)}
        <br />
        {parse(weeks)}
        <br />
        {parse(months)}
        <br />
        {parse(years)}
      </div>
      <Coin months={parseInt(months)} years={parseInt(years)} />
    </>
  )
}
