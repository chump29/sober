import { useEffect, useState, type ChangeEvent } from "react"

import { formatDistanceToNowStrict } from "date-fns"
import { toZonedTime } from "date-fns-tz"

const year = import.meta.env.VITE_YEAR
const month = import.meta.env.VITE_MONTH
const day = import.meta.env.VITE_DAY

const tz = Intl.DateTimeFormat().resolvedOptions().timeZone

export default function Dashboard() {
  const [date, setDate] = useState<Date | null>(new Date(year, month, day))
  const [seconds, setSeconds] = useState("")
  const [minutes, setMinutes] = useState("")
  const [hours, setHours] = useState("")
  const [days, setDays] = useState("")
  const [months, setMonths] = useState("")
  const [years, setYears] = useState("")

  function toComma(num: string) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  function parse(str: string) {
    return str.startsWith("0") ? "" : str
  }

  function handleDateChange(e: ChangeEvent<HTMLInputElement>) {
    const newDate = e.target.value
    if (newDate.length === 0) {
      setDate(null)
    } else {
      setDate(new Date(toZonedTime(newDate, tz)))
    }
    e.target.blur()
  }

  function isValid() {
    return date !== null
  }

  useEffect(() => {
    if (!date) {
      return
    }

    const interval = setInterval(() => {
      setDate(new Date(date))
    }, 1000)

    setSeconds(
      toComma(
        formatDistanceToNowStrict(date, {
          unit: "second",
          roundingMethod: "floor"
        })
      )
    )
    setMinutes(
      toComma(
        formatDistanceToNowStrict(date, {
          unit: "minute",
          roundingMethod: "floor"
        })
      )
    )
    setHours(
      toComma(
        formatDistanceToNowStrict(date, {
          unit: "hour",
          roundingMethod: "floor"
        })
      )
    )
    setDays(
      toComma(
        formatDistanceToNowStrict(date, {
          unit: "day",
          roundingMethod: "floor"
        })
      )
    )
    setMonths(
      toComma(
        formatDistanceToNowStrict(date, {
          unit: "month",
          roundingMethod: "floor"
        })
      )
    )
    setYears(
      toComma(
        formatDistanceToNowStrict(date, {
          unit: "year",
          roundingMethod: "floor"
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
            htmlFor="date"
            className="text-3xl italic text-[#66cc00] text-shadow-[3px_3px_6px_#000000]">
            Sober since:
          </label>
          <div>
            <input
              id="date"
              type="date"
              onChange={handleDateChange}
              className="text-center border rounded-xl w-40 mt-2 text-[#ccffff] cursor-text"
              defaultValue={date?.toISOString().substring(0, 10)}
              title="Date of last drink"
              data-testid="date"
            />
          </div>
        </form>
      </div>
      {isValid() ? (
        <div className="text-4xl text-center font-bold mt-20 text-[#66ccff]">
          {seconds}
          <br />
          {parse(minutes)}
          <br />
          {parse(hours)}
          <br />
          {parse(days)}
          <br />
          {parse(months)}
          <br />
          {parse(years)}
        </div>
      ) : null}
    </>
  )
}
