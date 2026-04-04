import { type EffectCallback, type JSX, type RefObject, useEffect, useRef, useState } from "react"

import SettingsIcon from "@mui/icons-material/Settings"
import IconButton from "@mui/material/IconButton"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { type PickerValue } from "@mui/x-date-pickers/internals"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { constructFrom, daysToWeeks, format, formatDistanceToNowStrict } from "date-fns"
import { toZonedTime } from "date-fns-tz"
import pluralize from "pluralize"
import { z } from "zod/mini"

import Coin from "../coin"
import Cost from "../cost"
import Settings from "../settings"
import { error, info, toComma } from "../shared"

const DEBUG: boolean = false

const tz: string = Intl.DateTimeFormat().resolvedOptions().timeZone

const Dashboard = (): JSX.Element => {
  const getDateFromString = (date: string): Date => {
    return new Date(toZonedTime(date, tz))
  }

  const getNewDate = (date: Date | null = null): string => {
    const dateNow: Date = date ?? new Date()
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

  try {
    const urlParam: URLSearchParams = new URLSearchParams(window.location.search)
    if (urlParam.has("soberDate") && !loadedDateFromUrl.current) {
      const soberDateParam = urlParam.get("soberDate")
      if (soberDateParam && z.iso.date().parse(soberDateParam)) {
        setDate(getDateFromString(soberDateParam))
        loadedDateFromUrl.current = true
        // v8 ignore if -- @preserve
        if (DEBUG) {
          info(`Got date: ${soberDateParam}`)
        }
      }
    }
    // biome-ignore lint/suspicious/noExplicitAny: catch everything
  } catch (e: any) {
    error(e)
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

  const handleDateChange = (date: PickerValue): void => {
    setNewSoberDate(new Date(toZonedTime(format(date as Date, "yyyy-MM-dd"), tz)))
  }

  const handleShowSettings = (): void => {
    setShowSettings(!showSettings)
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies(setNewSoberDate): not a dependency
  // biome-ignore lint/correctness/useExhaustiveDependencies(showCoin): is a dependency
  // biome-ignore lint/correctness/useExhaustiveDependencies(showCost): is a dependency
  // biome-ignore lint/correctness/useExhaustiveDependencies(cost): is a dependency
  useEffect((): ReturnType<EffectCallback> => {
    if (!date) {
      return
    }

    const interval: number = setInterval((): void => {
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
      <IconButton
        onClick={handleShowSettings}
        sx={{
          color: "#ccc",
          cursor: "pointer",
          position: "absolute",
          right: "2px",
          top: "2px"
        }}
        title="Settings">
        <SettingsIcon />
      </IconButton>
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
      ) : (
        <>
          <div className="text-center mt-20 font-bold">
            <form>
              <label className="text-3xl italic text-[#66cc00] text-shadow-[3px_3px_6px_#000000]" htmlFor="date">
                Sober since:
              </label>
              <div>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    closeOnSelect
                    defaultValue={constructFrom(date, date)}
                    label="Sober date"
                    maxDate={constructFrom(getNewDate(), getNewDate())}
                    onChange={handleDateChange}
                    sx={{
                      marginTop: "20px",
                      width: "150px"
                    }}
                  />
                </LocalizationProvider>
              </div>
            </form>
          </div>
          <div className="text-4xl text-center font-bold mt-20 mb-10 text-[#66ccff] font-counter">
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
          {showCost ? <Cost cost={cost} days={parseInt(days)} showCost={showCost} /> : null}
          {showCoin ? <Coin months={parseInt(months)} showCoin={showCoin} years={parseInt(years)} /> : null}
        </>
      )}
    </>
  )
}

export default Dashboard
