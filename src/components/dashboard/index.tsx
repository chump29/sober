import { type ChangeEvent, type JSX, type RefObject, useEffect, useRef, useState } from "react"

import { Cog8ToothIcon } from "@heroicons/react/24/outline"
import { daysToWeeks, formatDistanceToNowStrict } from "date-fns"
import { toZonedTime } from "date-fns-tz"
import pluralize from "pluralize"

import Coin from "../coin"
import Cost from "../cost"
import Settings from "../settings"
import { toComma } from "../shared"

const tz: string = Intl.DateTimeFormat().resolvedOptions().timeZone

const urlParam: URLSearchParams = new URLSearchParams(window.location.search)
const soberDateFormat = /^\d{4}-\d{1,2}-\d{1,2}$/ // YYYY-MM-DD

const Dashboard = (): JSX.Element => {
  const getDateFromString = (date: string): Date => {
    return new Date(toZonedTime(date, tz))
  }

  const getNewDate = (date: Date | null = null): string => {
    const dateNow: Date = date || new Date()
    return `${dateNow.getFullYear()}-${(dateNow.getMonth() + 1).toString().padStart(2, "0")}-${dateNow.getDate().toString().padStart(2, "0")}`
  }

  const soberDate: string = localStorage.getItem("soberDate") || getNewDate()

  const getShowCoin = (): string | null => {
    return localStorage.getItem("soberDate-showCoin")
  }

  const getShowCost = (): string | null => {
    return localStorage.getItem("soberDate-showCost")
  }

  const getCost = (): string | null => {
    return localStorage.getItem("soberDate-cost")
  }

  const [date, setDate] = useState<Date>(getDateFromString(soberDate))
  const [seconds, setSeconds] = useState<string>("")
  const [minutes, setMinutes] = useState<string>("")
  const [hours, setHours] = useState<string>("")
  const [days, setDays] = useState<string>("")
  const [weeks, setWeeks] = useState<string>("")
  const [months, setMonths] = useState<string>("")
  const [years, setYears] = useState<string>("")
  const [showSettings, setShowSettings] = useState<boolean>(false)
  const [showCoin, setShowCoin] = useState<boolean>(Boolean(getShowCoin()))
  const [showCost, setShowCost] = useState<boolean>(Boolean(getShowCost()))
  const [cost, setCost] = useState<number>(Number(getCost()))

  const loadedDateFromUrl: RefObject<boolean> = useRef<boolean>(false)

  if (urlParam.has("soberDate") && !loadedDateFromUrl.current) {
    const soberDateParam = urlParam.get("soberDate")
    if (soberDateParam && soberDateFormat.test(soberDateParam)) {
      setDate(getDateFromString(soberDateParam))
      loadedDateFromUrl.current = true
    }
  }

  if (getShowCoin() === null) {
    localStorage.setItem("soberDate-showCoin", true.toString())
  }

  if (getShowCost() === null || getCost() === null) {
    localStorage.setItem("soberDate-showCost", true.toString())
    localStorage.setItem("soberDate-cost", "0")
  }

  const parse = (str: string): string => {
    return str.startsWith("0") ? "" : str
  }

  const setSoberDate = (str: string): void => {
    if (localStorage.getItem("soberDate") !== str) {
      localStorage.setItem("soberDate", str)
    }
  }

  const setNewSoberDate = (date: Date): void => {
    setDate(date)
    setSoberDate(getNewDate(date))
  }

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setNewSoberDate(new Date(toZonedTime((e.target.value ||= getNewDate()), tz)))
    e.target.blur()
  }

  const handleShowSettings = (): void => {
    setShowSettings(!showSettings)
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies(setNewSoberDate): not a dependency
  // biome-ignore lint/correctness/useExhaustiveDependencies(showCoin): is a dependency
  // biome-ignore lint/correctness/useExhaustiveDependencies(showCost): is a dependency
  // biome-ignore lint/correctness/useExhaustiveDependencies(cost): is a dependency
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
  }, [
    date,
    showCoin,
    showCost,
    cost
  ])

  return (
    <>
      <Cog8ToothIcon
        className="size-7 absolute top-2 right-2 text-[#cccccc] cursor-pointer"
        onClick={handleShowSettings}
        title="Settings"
      />
      {showSettings ? (
        <Settings
          cost={cost}
          handleShowSettings={handleShowSettings}
          setCost={setCost}
          setShowCoin={setShowCoin}
          setShowCost={setShowCost}
          showCoin={showCoin}
          showCost={showCost}
        />
      ) : null}
      <div className="text-center mt-20 font-bold">
        <form>
          <label className="text-3xl italic text-[#66cc00] text-shadow-[3px_3px_6px_#000000]" htmlFor="date">
            Sober since:
          </label>
          <div>
            <input
              className="text-center border rounded-xl w-40 mt-2 text-[#ccffff] cursor-text"
              data-testid="date"
              defaultValue={date?.toISOString().substring(0, 10)}
              max={getNewDate()}
              onChange={handleDateChange}
              title="Sober date"
              type="date"
            />
          </div>
        </form>
      </div>
      <div className="text-4xl text-center font-bold mt-20 text-[#66ccff] font-counter">
        {seconds}
        {parse(minutes) ? <br /> : null}
        {parse(minutes)}
        {parse(hours) ? <br /> : null}
        {parse(hours)}
        {parse(days) ? <br /> : null}
        {parse(days)}
        {parse(weeks) ? <br /> : null}
        {parse(weeks)}
        {parse(months) ? <br /> : null}
        {parse(months)}
        {parse(years) ? <br /> : null}
        {parse(years)}
      </div>
      {showCost ? <Cost cost={cost} showCost={showCost} weeks={parseInt(weeks)} /> : null}
      {showCoin ? <Coin months={parseInt(months)} showCoin={showCoin} years={parseInt(years)} /> : null}
    </>
  )
}

export default Dashboard
