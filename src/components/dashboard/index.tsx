import { useEffect, useState, type ChangeEvent } from "react"

import { daysToWeeks, formatDistanceToNowStrict } from "date-fns"
import { toZonedTime } from "date-fns-tz"
import pluralize from "pluralize"

import Coin from "../coin"

const tz = Intl.DateTimeFormat().resolvedOptions().timeZone

export default function Dashboard() {
  const soberDate = localStorage.getItem("soberDate") || getNewDate()

  const [date, setDate] = useState<Date>(new Date(toZonedTime(soberDate, tz)))
  const [seconds, setSeconds] = useState("")
  const [minutes, setMinutes] = useState("")
  const [hours, setHours] = useState("")
  const [days, setDays] = useState("")
  const [weeks, setWeeks] = useState("")
  const [months, setMonths] = useState("")
  const [years, setYears] = useState("")

  function getNewDate(date: Date | null = null): string {
    const dateNow = date || new Date()
    return `${dateNow.getFullYear()}-${(dateNow.getMonth() + 1).toString().padStart(2, "0")}-${dateNow.getDate().toString().padStart(2, "0")}`
  }

  function toComma(num: string): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  function parse(str: string): string {
    return str.startsWith("0") ? "" : str
  }

  function setSoberDate(str: string) {
    if (localStorage.getItem("soberDate") !== str) {
      localStorage.setItem("soberDate", str)
    }
  }

  function handleDateChange(e: ChangeEvent<HTMLInputElement>) {
    const newDate = (e.target.value ||= getNewDate())
    const d = new Date(toZonedTime(newDate, tz))
    setDate(d)
    setSoberDate(getNewDate(d))
    e.target.blur()
  }

  useEffect(() => {
    if (!date) {
      return
    }

    const interval = setInterval(() => {
      const d = new Date(toZonedTime(date, tz))
      setDate(d)
      setSoberDate(getNewDate(d))
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
    const d = formatDistanceToNowStrict(date, {
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

    return () => clearInterval(interval)
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
