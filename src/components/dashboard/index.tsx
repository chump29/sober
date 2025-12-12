import { useEffect, useState, type ChangeEvent } from "react"
import Form from "react-bootstrap/Form"

import { formatDistanceToNowStrict } from "date-fns"

import "./index.css"

const year = import.meta.env.VITE_YEAR
const month = import.meta.env.VITE_MONTH
const day = import.meta.env.VITE_DAY

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
      setDate(new Date(newDate))
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
      setDate(new Date(year, month, day))
    }, 1000)

    setSeconds(
      toComma(
        formatDistanceToNowStrict(date as Date, {
          unit: "second",
          roundingMethod: "floor"
        })
      )
    )
    setMinutes(
      toComma(
        formatDistanceToNowStrict(date as Date, {
          unit: "minute",
          roundingMethod: "floor"
        })
      )
    )
    setHours(
      toComma(
        formatDistanceToNowStrict(date as Date, {
          unit: "hour",
          roundingMethod: "floor"
        })
      )
    )
    setDays(
      toComma(
        formatDistanceToNowStrict(date as Date, {
          unit: "day",
          roundingMethod: "floor"
        })
      )
    )
    setMonths(
      toComma(
        formatDistanceToNowStrict(date as Date, {
          unit: "month",
          roundingMethod: "floor"
        })
      )
    )
    setYears(
      toComma(
        formatDistanceToNowStrict(date as Date, {
          unit: "year",
          roundingMethod: "floor"
        })
      )
    )

    return () => clearInterval(interval)
  }, [date])

  return (
    <>
      <Form className="container input-sm w-25">
        <Form.Group className="text-center">
          <Form.Label htmlFor="date" className="h2 fw-bold fst-italic pad date">
            Sober since:
          </Form.Label>
          <Form.Control
            id="date"
            type="date"
            onChange={handleDateChange}
            className="text-center fw-bold"
            defaultValue={date?.toISOString().substring(0, 10)}
            title="Sober since"
          />
        </Form.Group>
      </Form>
      {isValid() ? (
        <div className="h1 text-center pad fw-bold count">
          {parse(seconds)}
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
