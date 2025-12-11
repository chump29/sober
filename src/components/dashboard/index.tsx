import { useEffect, useState } from "react"

import { formatDistanceToNowStrict } from "date-fns"

import "./index.css"

const date = new Date(2025, 9, 11)

export default function Dashboard() {
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

  useEffect(() => {
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
  }, [])

  return (
    <>
      <div className="h2 text-center fw-bold fst-italic pad date">
        Since {date.toLocaleDateString()}
      </div>
      <div className="h1 text-center pad fw-bold">
        {seconds}
        <br />
        {minutes}
        <br />
        {hours}
        <br />
        {days}
        <br />
        {parse(months)}
        <br />
        {parse(years)}
      </div>
    </>
  )
}
