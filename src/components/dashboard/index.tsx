import { useEffect, useState, type ChangeEvent } from "react"
import Form from "react-bootstrap/Form"

import { formatDistanceToNowStrict } from "date-fns"

import "./index.css"

export default function Dashboard() {
  const [date, setDate] = useState<Date | null>(null)
  const [seconds, setSeconds] = useState("")
  const [minutes, setMinutes] = useState("")
  const [hours, setHours] = useState("")
  const [days, setDays] = useState("")
  const [months, setMonths] = useState("")
  const [years, setYears] = useState("")

  const toComma = (num: string) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  const parse = (str: string) => {
    return str.startsWith("0") ? "" : str
  }

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value
    if (newDate.length === 0) {
      setDate(null)
    } else {
      setDate(new Date(newDate))
    }
    e.target.blur()
  }

  const isValid = (): boolean => {
    return date !== null
  }

  useEffect(() => {
    if (!date) {
      return
    }
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
