// biome-ignore-all lint/style/useComponentExportOnlyModules: mocks

import { beforeEach, describe, expect, mock, test } from "bun:test"

import { type JSX } from "react"

import { MantineProvider } from "@mantine/core"

import { type Nullable, type Optional } from "@postfmly/types"

import { fakerEN_US as fake } from "@faker-js/faker"
import { render, screen } from "@testing-library/react"
import { default as dayjs } from "dayjs"

import { Stats } from "../../../src/pages/Stats.tsx"
import { TIME } from "../../../src/utils/calc.ts"
import { currencyFormatter, Per } from "../../../src/utils/index.ts"
import { defaultValues, type IDisplayStats } from "../../../src/utils/interfaces/IDisplay.ts"
import { type ISavings } from "../../../src/utils/interfaces/ISavings.ts"
import { type IChart } from "../../../src/utils/interfaces/IStats.ts"
import { type ISubstance } from "../../../src/utils/interfaces/ISubstance.ts"
import { type ISubstancesProps } from "../../../src/utils/interfaces/ISubstancesProps.ts"
import { CostType, DATETIME_FORMAT, DATETIME_FORMAT_SHORT, StatsType } from "../../../src/utils/schemas.ts"
import { getSubstance, toDisplay } from "../utils/helpers.ts"

type MockComponent = Record<string, unknown>

const Substances = (): JSX.Element => <div data-testid="substances" />
mock.module(
  "../../../src/components/Substances.tsx",
  (): MockComponent => ({
    Substances
  })
)

interface ILineChartMockProps {
  data: IChart[]
  valueFormatter?: (value: number) => string
  xAxisProps?: {
    height?: number
    interval?: number
    tick?: {
      angle?: number
      textAnchor?: string
    }
  }
  yAxisProps?: {
    tickFormatter?: (value: number) => string
  }
}
const lineChartMock = mock((_: ILineChartMockProps): null => null)
const LineChart = (props: ILineChartMockProps): JSX.Element => {
  lineChartMock(props)

  return <div data-testid="line-chart" />
}
const getLastChartProps = (): Optional<ILineChartMockProps> => lineChartMock.mock.calls.at(-1)?.[0]
mock.module(
  "@mantine/charts",
  (): MockComponent => ({
    LineChart
  })
)

let isMobile = false
mock.module(
  "@mantine/hooks",
  async (): Promise<MockComponent> => ({
    ...(await import("@mantine/hooks")),
    useMediaQuery: (): boolean => isMobile
  })
)

const getNum = (): number => fake.number.int({ max: 100, min: 10 })

const getDecimal = (hasDecimals: boolean): number =>
  fake.number.float({ fractionDigits: hasDecimals ? 2 : 0, max: 100, min: 10 })

// * NOTE: arbitrary
const getStats = (hasDecimals: boolean): IDisplayStats => ({
  days: getNum(),
  fortnights: getNum(),
  hours: getNum(),
  minutes: getNum(),
  months: getDecimal(hasDecimals),
  seconds: getNum(),
  weeks: getDecimal(hasDecimals),
  years: getDecimal(hasDecimals)
})

let statsMock: IDisplayStats = defaultValues

const getAmount = (): number => Number(fake.finance.amount({ max: 100, min: 5 }))

// * NOTE: arbitrary
const getSavings = (): ISavings => ({
  day: getAmount(),
  month: getAmount(),
  months2: getAmount(),
  months3: getAmount(),
  months6: getAmount(),
  next: getAmount(),
  today: getAmount(),
  week: getAmount(),
  year: getAmount()
})

let savingsMock: ISavings = getSavings()

mock.module(
  "../../../src/utils/calc.ts",
  (): MockComponent => ({
    TIME,
    calculateSavings: (): ISavings => savingsMock,
    calculateStats: (): IDisplayStats => statsMock
  })
)

let substance: ISubstance
let refreshSubstances: ReturnType<typeof mock>
let setSelectedSubstance: ReturnType<typeof mock>
let currentUser: Nullable<string>

const renderStats = (overrides: Partial<ISubstancesProps> = {}): void => {
  const props = {
    allSubstances: [substance],
    refreshSubstances,
    selectedSubstance: substance,
    setSelectedSubstance,
    substances: [toDisplay(substance)],
    user: currentUser,
    ...overrides
  }

  render(<Stats {...props} />, { wrapper: MantineProvider })
}

const rePercent = /%/u

beforeEach((): void => {
  isMobile = false

  substance = {
    ...getSubstance({
      cost: getAmount(),
      costType: CostType.Day,
      date: dayjs()
        .subtract(fake.number.int({ max: Math.floor(TIME.DAYS_PER_YEAR), min: 1 }), "days")
        .format(DATETIME_FORMAT)
    }),
    showCoin: true,
    showCost: true,
    showDecimals: fake.datatype.boolean(),
    showTime: true,
    statsType: StatsType.Alcohol // ! TODO: Test StatsType.Smoking & StatsType.None
  }

  statsMock = getStats(substance.showDecimals)

  savingsMock = getSavings()

  currentUser = fake.person.firstName()
  refreshSubstances = mock((): Promise<undefined> => Promise.resolve(undefined))
  setSelectedSubstance = mock((): undefined => undefined)
})

// biome-ignore lint/nursery/useLowercaseTestTitle: component name
describe("Stats", (): void => {
  test("displays stat cards", (): void => {
    renderStats()

    expect(screen.getByTestId("substances")).toBeInTheDocument()
    expect(screen.getByText("DAYS SOBER")).toBeInTheDocument()
    expect(screen.getByText("MONEY SAVED")).toBeInTheDocument()
    expect(screen.getByText("POTENTIAL HEALTH GAIN")).toBeInTheDocument()
    expect(screen.getByText(`Since ${dayjs(substance.date).format(DATETIME_FORMAT_SHORT)}`)).toBeInTheDocument()
    expect(screen.getByText(`Based on $${savingsMock.day.toFixed(2)} per day`)).toBeInTheDocument()
  })

  test("hides savings when showCost is false", (): void => {
    renderStats({
      selectedSubstance: {
        ...substance,
        showCost: false
      }
    })

    expect(screen.queryByText("MONEY SAVED")).toBeNull()
    expect(screen.queryByText("SAVINGS BREAKDOWN")).toBeNull()
    expect(screen.queryByTestId("line-chart")).toBeNull()
  })

  test("hides savings when cost is 0", (): void => {
    renderStats({
      selectedSubstance: {
        ...substance,
        cost: 0,
        showCost: true
      }
    })

    expect(screen.getByText("MONEY SAVED")).toBeInTheDocument()
    expect(screen.queryByText("SAVINGS BREAKDOWN")).toBeNull()
    expect(screen.queryByTestId("line-chart")).toBeNull()
  })

  test("displays healing in progress", (): void => {
    statsMock = {
      ...statsMock,
      days: 0
    }
    savingsMock = {
      ...savingsMock,
      today: 0
    }

    renderStats()

    expect(screen.getByText("Healing in progress…")).toBeInTheDocument()
    expect(
      screen.queryByText(
        "Illustrative population-level estimates, not measured individual recovery or a clinical prediction."
      )
    ).toBeNull()
  })

  test("displays bars", (): void => {
    statsMock = {
      ...statsMock,
      days: fake.number.int({ max: Math.floor(TIME.DAYS_PER_YEAR), min: 65 })
    }
    // * NOTE: >= 65 days ensures all four bars are > 10%

    renderStats()

    expect(screen.getByText("Sleep & Metabolic Gain")).toBeInTheDocument()
    expect(screen.getByText("Organ & Blood Pressure Gain")).toBeInTheDocument()
    expect(screen.getByText("Long Term Risk Reduction")).toBeInTheDocument()
    expect(screen.getByText("Overall Physiological Recovery")).toBeInTheDocument()
    expect(
      screen.getByText(
        "Illustrative population-level estimates, not measured individual recovery or a clinical prediction."
      )
    ).toBeInTheDocument()

    const LEN = 4

    expect(screen.getAllByText(rePercent)).toHaveLength(LEN)
  })

  test("hides bars", (): void => {
    statsMock = {
      ...statsMock,
      days: 1
    }

    renderStats()

    expect(screen.queryByText(rePercent)).toBeNull()
  })

  test("displays savings breakdown", (): void => {
    const amount = fake.number.int({ max: 140, min: 50 })

    savingsMock = {
      ...savingsMock,
      day: amount
    }

    renderStats()

    expect(screen.getByText("SAVINGS BREAKDOWN")).toBeInTheDocument()
    expect(screen.getByText("Estimated savings based on your selected frequency and amount")).toBeInTheDocument()

    for (const label of Object.values(Per)) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }

    const DECIMALS_8 = 8
    const DECIMALS_6 = 6

    expect(screen.getByText(`$${(amount / TIME.SECONDS_PER_DAY).toFixed(DECIMALS_8)}`)).toBeInTheDocument()
    expect(screen.getByText(`$${(amount / TIME.MINUTES_PER_DAY).toFixed(DECIMALS_6)}`)).toBeInTheDocument()
    expect(screen.getByText(`$${amount.toFixed(2)}`)).toBeInTheDocument()
  })

  test("displays chart", (): void => {
    statsMock = {
      ...statsMock,
      days: TIME.DAYS_30
    }
    // * NOTE: the "30 Days" milestone is replaced by "Today (30 Days)"

    renderStats()

    expect(screen.getByTestId("line-chart")).toBeInTheDocument()

    const chartProps = getLastChartProps()

    expect(chartProps?.data.some((d: IChart): boolean => d.label === "30 Days")).toBe(false)
    expect(chartProps?.data.some((d: IChart): boolean => d.label === "Today (30 Days)")).toBe(true)
    expect(chartProps?.data.some((d: IChart): boolean => d.label === "1 Year From Now")).toBe(true)

    expect(chartProps).toBeDefined()
    if (!chartProps) {
      throw new Error("Expected chartProps to be defined")
    }

    const daysOrder = chartProps.data.map((d: IChart): number => d.days)
    expect(daysOrder).toStrictEqual([...daysOrder].sort((a: number, b: number): number => a - b))

    const thousand = fake.number.int({ max: 2000, min: 1000 })
    const hundred = fake.number.int({ max: 200, min: 100 })

    const ANGLE = -45

    expect(chartProps?.valueFormatter?.(thousand)).toBe(currencyFormatter.format(thousand))
    expect(chartProps?.yAxisProps?.tickFormatter?.(0)).toHaveLength(0)
    expect(chartProps?.yAxisProps?.tickFormatter?.(hundred)).toBe(currencyFormatter.format(hundred))
    expect(chartProps?.xAxisProps?.interval).toBe(0)
    expect(chartProps?.xAxisProps?.tick?.angle).toBe(ANGLE)
  })

  test("show chart - mobile", (): void => {
    isMobile = true

    renderStats()

    const chartProps = getLastChartProps()

    expect(chartProps?.data.some((d: IChart): boolean => d.label === "Today")).toBe(true)
    expect(chartProps?.data.some((d: IChart): boolean => d.label === "+1 Year")).toBe(true)
    expect(chartProps?.xAxisProps?.interval).toBe(1)
    expect(chartProps?.xAxisProps?.tick?.angle).toBe(0)
  })
})
