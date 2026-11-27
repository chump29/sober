// biome-ignore-all lint/style/useComponentExportOnlyModules: mocks

import { beforeEach, describe, expect, mock, test } from "bun:test"

import { type JSX } from "react"

import { MantineProvider } from "@mantine/core"

import { type Nullable } from "@postfmly/types"

import { fakerEN_US as fake } from "@faker-js/faker"
import { render, screen, waitFor } from "@testing-library/react"
import { type UserEvent, userEvent } from "@testing-library/user-event"
import { default as dayjs } from "dayjs"
import { default as fetchMock } from "jest-fetch-mock"
import { match, P } from "ts-pattern"

import { Home } from "../../../src/pages/Home.tsx"
import { Endpoint, HttpMethod, HttpStatus, Metric, validate } from "../../../src/utils/index.ts"
import { type ICost } from "../../../src/utils/interfaces/ICost.ts"
import { defaultValues, type IDisplayStats } from "../../../src/utils/interfaces/IDisplay.ts"
import { type ISubstance, SubstanceSchema } from "../../../src/utils/interfaces/ISubstance.ts"
import { type ISubstancesProps } from "../../../src/utils/interfaces/ISubstancesProps.ts"
import { DATETIME_FORMAT, DateTimeSchema } from "../../../src/utils/schemas.ts"
import { getSubstance, toDisplay } from "../utils/helpers.ts"

type MockComponent = Record<string, unknown>

const Substances = (): JSX.Element => <div data-testid="substances" />
mock.module(
  "../../../src/components/Substances.tsx",
  (): MockComponent => ({
    Substances
  })
)

const Coin = (): JSX.Element => <div data-testid="coin" />
mock.module(
  "../../../src/components/Coin.tsx",
  (): MockComponent => ({
    Coin
  })
)

const date = dayjs(fake.date.past()).format(DATETIME_FORMAT.replace(".SSS", ""))

interface IDateTimePickerMockProps {
  disabled?: boolean
  onChange?: (value: string) => void
  timePickerProps?: {
    leftSection?: JSX.Element
  }
  value?: string
}
const DateTimePicker = ({ disabled, onChange, timePickerProps, value }: IDateTimePickerMockProps): JSX.Element => (
  <div data-testid="date-time-picker">
    <button disabled={disabled} type="button">
      {value ? dayjs(value).format(DATETIME_FORMAT) : ""}
    </button>
    <button
      onClick={(): void => {
        onChange?.("invalid-date")
      }}
      type="button">
      Trigger Invalid Date
    </button>
    <button
      onClick={(): void => {
        onChange?.(date)
      }}
      type="button">
      Trigger Date Change
    </button>
    {timePickerProps?.leftSection}
  </div>
)
mock.module(
  "@mantine/dates",
  (): MockComponent => ({
    DateTimePicker
  })
)

type MYStats = Pick<IDisplayStats, "months" | "years">

let statsResult: MYStats = { months: 0, years: 0 }

const calculateStats = mock((): MYStats => statsResult)
mock.module(
  "../../../src/utils/calc.ts",
  (): MockComponent => ({
    calculateStats
  })
)

let currentCost: Nullable<ICost> = null

let currentMetrics: IDisplayStats = { ...defaultValues }

mock.module(
  "../../../src/utils/displayStore.ts",
  (): MockComponent => ({
    useCost: (): Nullable<ICost> => currentCost,
    useDays: (): number => currentMetrics.days,
    useFortnights: (): number => currentMetrics.fortnights,
    useHours: (): number => currentMetrics.hours,
    useMinutes: (): number => currentMetrics.minutes,
    useMonths: (): number => currentMetrics.months,
    useSeconds: (): number => currentMetrics.seconds,
    useWeeks: (): number => currentMetrics.weeks,
    useYears: (): number => currentMetrics.years
  })
)

let substance: ISubstance
let refreshSubstances: ReturnType<typeof mock>
let setSelectedSubstance: ReturnType<typeof mock>
let currentUser: Nullable<string>
let fetchResponse: Nullable<ISubstance>
let lastRequest: Nullable<Request> = null

const fetch = fetchMock.enableMocks().mockResponse((req: Request): Response => {
  lastRequest = req

  return match<string, Response>(new URL(req.url).pathname)
    .with(P.string.includes(Endpoint.UpdateSubstance), () =>
      fetchResponse === null ? new Response(null, { status: HttpStatus.NoContent }) : Response.json(fetchResponse)
    )
    .otherwise((s: string): never => {
      throw new Error(`Invalid API call: ${s}`)
    })
})

const renderHome = (overrides: Partial<ISubstancesProps> = {}): void => {
  const props = {
    allSubstances: [substance],
    refreshSubstances,
    selectedSubstance: substance,
    setSelectedSubstance,
    substances: [toDisplay(substance)],
    user: currentUser,
    ...overrides
  }

  render(<Home {...props} />, { wrapper: MantineProvider })
}

const reBasedOn = /Based on/u
const reCostType = /per (?:day|week|month|year)/u
let yearRegex: RegExp

beforeEach((): void => {
  const pastDate = dayjs(fake.date.past())

  yearRegex = new RegExp(String(pastDate.year()), "u")

  substance = {
    ...getSubstance({
      date: pastDate.format(DATETIME_FORMAT)
    }),
    showCoin: true,
    showCost: true,
    showTime: true
  }

  fetchResponse = substance

  lastRequest = null

  currentUser = fake.person.firstName()

  refreshSubstances = mock((): Promise<undefined> => Promise.resolve(undefined))

  setSelectedSubstance = mock((): undefined => undefined)

  currentCost = {
    cost: Number(fake.finance.amount({ dec: 2, max: 999, min: 100 })),
    costPer: Number(fake.finance.amount({ dec: 2, max: 50, min: 5 })),
    costType: fake.helpers.arrayElement(["day", "week", "month", "year"])
  }

  currentMetrics = {
    days: fake.number.int({ max: 29, min: 20 }),
    fortnights: 0,
    hours: fake.number.int({ max: 49, min: 40 }),
    minutes: fake.number.int({ max: 69, min: 60 }),
    months: fake.number.int({ max: 19, min: 11 }),
    seconds: fake.number.int({ max: 9999, min: 1000 }),
    weeks: fake.number.int({ max: 99, min: 80 }),
    years: 0
  }

  statsResult = {
    months: fake.number.float({ fractionDigits: 2, max: 11, min: 1 }),
    years: fake.number.float({ fractionDigits: 2, max: 5, min: 0 })
  }
})

// biome-ignore lint/nursery/useLowercaseTestTitle: component name
describe("Home", (): void => {
  test("displays substances", (): void => {
    renderHome()

    expect(screen.getByTestId("substances")).toBeInTheDocument()
  })

  test("displays header and all metrics", (): void => {
    renderHome()

    expect(screen.getByText("SOBER SINCE")).toBeInTheDocument()

    for (const m of Object.values(Metric)) {
      expect(screen.getByText(m.toUpperCase())).toBeInTheDocument()
    }
  })

  test("displays non-zero metrics", (): void => {
    renderHome()

    expect(screen.getByText(currentMetrics.seconds.toLocaleString())).toBeInTheDocument()
    expect(screen.getByText(String(currentMetrics.minutes))).toBeInTheDocument()
    expect(screen.getByText(String(currentMetrics.hours))).toBeInTheDocument()
    expect(screen.getByText(String(currentMetrics.days))).toBeInTheDocument()
    expect(screen.getByText(String(currentMetrics.weeks))).toBeInTheDocument()
    expect(screen.getByText(String(currentMetrics.months))).toBeInTheDocument()
  })

  test("displays savings", (): void => {
    renderHome()

    expect(screen.getByText("ESTIMATED SAVINGS")).toBeInTheDocument()
    expect(screen.getByText(`$${currentCost?.cost.toFixed(2)}`)).toBeInTheDocument()
    expect(screen.getByText(reBasedOn)).toBeInTheDocument()
    expect(screen.getByText(`$${currentCost?.costPer.toFixed(2)}`)).toBeInTheDocument()
    expect(screen.getByText(reCostType)).toBeInTheDocument()
  })

  test("hides savings when showCost is false", (): void => {
    renderHome({
      selectedSubstance: {
        ...substance,
        showCost: false
      }
    })

    expect(screen.queryByText("ESTIMATED SAVINGS")).toBeNull()
  })

  test("hides savings when cost is null", (): void => {
    currentCost = null

    renderHome()

    expect(screen.queryByText("ESTIMATED SAVINGS")).toBeNull()
  })

  test("displays coin button when showCoin is true and months > 0", (): void => {
    renderHome()

    expect(screen.getByTestId("coin")).toBeInTheDocument()
  })

  test("hides coin button when showCoin is false", (): void => {
    renderHome({
      selectedSubstance: {
        ...substance,
        showCoin: false
      }
    })

    expect(screen.queryByTestId("coin")).toBeNull()
  })

  test("hides coin when months is 0", (): void => {
    statsResult = { months: 0, years: 0 }

    renderHome()

    expect(screen.queryByTestId("coin")).toBeNull()
  })

  test("disables date picker when selectedSubstance has no name", (): void => {
    renderHome({
      selectedSubstance: {
        ...substance,
        name: ""
      }
    })

    expect(screen.getByRole("button", { name: yearRegex })).toBeDisabled()
  })

  const openDatePicker = async (user?: UserEvent): Promise<UserEvent> => {
    const u = user ?? userEvent.setup()

    await u.click(screen.getByRole("button", { name: yearRegex }))

    return u
  }

  test("changes date", async (): Promise<void> => {
    const updated: ISubstance = {
      ...substance,
      date
    }

    fetchResponse = updated

    renderHome()

    const user = userEvent.setup()

    await user.click(screen.getByRole("button", { name: "Trigger Date Change" }))

    await waitFor((): void => {
      expect(fetch).toHaveBeenCalledTimes(1)
    })

    expect(lastRequest?.url).toContain(`/api/${Endpoint.UpdateSubstance}/${substance.id}`)
    expect(lastRequest?.method).toBe(HttpMethod.PUT)
    expect(await lastRequest?.json()).toStrictEqual(expect.objectContaining({ date }))

    await waitFor((): void => {
      expect(setSelectedSubstance).toHaveBeenCalledWith(validate(updated, SubstanceSchema))
    })
  })

  test("unchecks set time", async (): Promise<void> => {
    const updated: ISubstance = {
      ...substance,
      date: dayjs(substance.date).startOf("day").format(DATETIME_FORMAT.replace("hh", "HH")),
      showTime: false
    }

    fetchResponse = updated

    renderHome()

    const user = await openDatePicker()

    const checkbox = await screen.findByRole("checkbox")

    expect(checkbox).toBeChecked()

    await user.click(checkbox)

    await waitFor((): void => {
      expect(fetch).toHaveBeenCalledTimes(1)
    })

    expect(lastRequest?.url).toContain(`/api/${Endpoint.UpdateSubstance}/${substance.id}`)
    expect(lastRequest?.method).toBe(HttpMethod.PUT)
    expect(await lastRequest?.json()).toStrictEqual(
      expect.objectContaining({
        date: validate(updated.date, DateTimeSchema),
        showTime: false
      })
    )

    await waitFor((): void => {
      expect(setSelectedSubstance).toHaveBeenCalledWith(validate(updated, SubstanceSchema))
    })
  })

  test("checks set time", async (): Promise<void> => {
    substance = {
      ...substance,
      showTime: false
    }

    const updated = {
      ...substance,
      showTime: true
    }

    fetchResponse = updated

    renderHome()

    const user = await openDatePicker()

    const checkbox = await screen.findByRole("checkbox")

    expect(checkbox).not.toBeChecked()

    await user.click(checkbox)

    await waitFor((): void => {
      expect(fetch).toHaveBeenCalledTimes(1)
    })

    expect(lastRequest?.url).toContain(`/api/${Endpoint.UpdateSubstance}/${substance.id}`)
    expect(lastRequest?.method).toBe(HttpMethod.PUT)
    expect(await lastRequest?.json()).toStrictEqual(
      expect.objectContaining({
        showTime: true
      })
    )

    await waitFor((): void => {
      expect(setSelectedSubstance).toHaveBeenCalledWith(validate(updated, SubstanceSchema))
    })
  })

  test("does not update substance when user is null", async (): Promise<void> => {
    renderHome({ user: null })

    const user = await openDatePicker()

    await user.click(await screen.findByRole("checkbox"))

    expect(fetch).not.toHaveBeenCalled()
    expect(setSelectedSubstance).not.toHaveBeenCalled()
  })

  test("does not update substance when date validation fails", async (): Promise<void> => {
    renderHome()

    const user = userEvent.setup()

    await user.click(screen.getByRole("button", { name: "Trigger Invalid Date" }))

    expect(fetch).not.toHaveBeenCalled()
    expect(setSelectedSubstance).not.toHaveBeenCalled()
  })

  test("does not call setSelectedSubstance when fetchClient returns null", async (): Promise<void> => {
    fetchResponse = null

    renderHome()

    const user = await openDatePicker()

    await user.click(await screen.findByRole("checkbox"))

    await waitFor((): void => {
      expect(fetch).toHaveBeenCalledTimes(1)
    })

    expect(setSelectedSubstance).not.toHaveBeenCalled()
  })
})
