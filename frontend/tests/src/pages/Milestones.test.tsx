// biome-ignore-all lint/style/useComponentExportOnlyModules: mocks

import { beforeEach, describe, expect, mock, test } from "bun:test"

import { type JSX } from "react"

import { MantineProvider } from "@mantine/core"

import { type Nullable } from "@postfmly/types"

import { fakerEN_US as fake } from "@faker-js/faker"
import { render, screen } from "@testing-library/react"
import { default as dayjs } from "dayjs"

import { Milestones } from "../../../src/pages/Milestones.tsx"
import { TIME } from "../../../src/utils/calc.ts"
import { FACTOR, Milestone } from "../../../src/utils/index.ts"
import { type ISubstance } from "../../../src/utils/interfaces/ISubstance.ts"
import { type ISubstancesProps } from "../../../src/utils/interfaces/ISubstancesProps.ts"
import { DATETIME_FORMAT, DATETIME_FORMAT_MILESTONE } from "../../../src/utils/schemas.ts"
import { getSubstance, toDisplay } from "../utils/helpers.ts"

const Substances = (): JSX.Element => <div data-testid="substances" />
mock.module(
  "../../../src/components/Substances.tsx",
  (): Record<string, unknown> => ({
    Substances
  })
)

const TOTAL_MILESTONES = 9

let substance: ISubstance
let refreshSubstances: ReturnType<typeof mock>
let setSelectedSubstance: ReturnType<typeof mock>
let currentUser: Nullable<string>

const renderMilestones = (overrides: Partial<ISubstancesProps> = {}): void => {
  const props = {
    allSubstances: [substance],
    refreshSubstances,
    selectedSubstance: substance,
    setSelectedSubstance,
    substances: [toDisplay(substance)],
    user: currentUser,
    ...overrides
  }

  render(<Milestones {...props} />, { wrapper: MantineProvider })
}

const DAYS_45 = 45

beforeEach((): void => {
  substance = getSubstance({
    date: dayjs().subtract(DAYS_45, "days").format(DATETIME_FORMAT)
  })

  currentUser = fake.person.firstName()
  refreshSubstances = mock((): Promise<undefined> => Promise.resolve(undefined))
  setSelectedSubstance = mock((): undefined => undefined)
})

// biome-ignore lint/nursery/useLowercaseTestTitle: component name
describe("Milestones", (): void => {
  test("displays substances and header", (): void => {
    renderMilestones()

    expect(screen.getByTestId("substances")).toBeInTheDocument()
    expect(screen.getByText("YOUR JOURNEY")).toBeInTheDocument()
    expect(screen.getByText("Every milestone is worth celebrating")).toBeInTheDocument()
  })

  test("displays milestones", (): void => {
    renderMilestones()

    for (const m of Object.values(Milestone)) {
      expect(screen.getByText(m)).toBeInTheDocument()
    }
  })

  test("displays no MilestoneItems", (): void => {
    const startDate = dayjs().subtract(1, "hour")

    renderMilestones({
      selectedSubstance: {
        ...substance,
        date: startDate.format(DATETIME_FORMAT)
      }
    })

    expect(screen.getByText("0%")).toBeInTheDocument()
    expect(screen.getAllByText("Upcoming")).toHaveLength(TOTAL_MILESTONES)
    expect(screen.queryByText("Completed")).toBeNull()
    expect(screen.getByText(`Target ${startDate.add(1, "day").format(DATETIME_FORMAT_MILESTONE)}`)).toBeInTheDocument()
  })

  test("displays partial milestones", (): void => {
    // * NOTE: 45 days ago: 1 Day, 1 Week, 1 Fortnight, 1 Month (4 of 9)
    const startDate = dayjs().subtract(DAYS_45, "days")
    const completedCount = 4
    const expectedPct = Math.trunc((completedCount / TOTAL_MILESTONES) * FACTOR)

    renderMilestones({
      selectedSubstance: {
        ...substance,
        date: startDate.format(DATETIME_FORMAT)
      }
    })

    expect(screen.getByText(`${expectedPct}%`)).toBeInTheDocument()
    expect(screen.getAllByText("Completed")).toHaveLength(completedCount)
    expect(screen.getAllByText("Upcoming")).toHaveLength(TOTAL_MILESTONES - completedCount)
    expect(screen.getByText(`Reached ${startDate.add(1, "day").format(DATETIME_FORMAT_MILESTONE)}`)).toBeInTheDocument()
    expect(
      screen.getByText(`Reached ${startDate.add(TIME.DAYS_PER_FORTNIGHT, "days").format(DATETIME_FORMAT_MILESTONE)}`)
    ).toBeInTheDocument()
  })

  test("displays completed milestones", (): void => {
    const SIX_YEARS = 6
    const sixYearsAgo = dayjs().subtract(SIX_YEARS, "years")

    renderMilestones({
      selectedSubstance: {
        ...substance,
        date: sixYearsAgo.format(DATETIME_FORMAT)
      }
    })

    expect(screen.getByText("100%")).toBeInTheDocument()
    expect(screen.getAllByText("Completed")).toHaveLength(TOTAL_MILESTONES)
    expect(screen.queryByText("Upcoming")).toBeNull()
  })

  test("clamps date", (): void => {
    // * NOTE: 1/31/26 + 1 month should be 2/28/26 (not 30 days, 3/3/26)
    const jan31 = dayjs("2026-01-31T12:00:00.000") // local

    renderMilestones({
      selectedSubstance: {
        ...substance,
        date: jan31.format(DATETIME_FORMAT)
      }
    })

    expect(screen.getByText("Reached Feb 28, 2026")).toBeInTheDocument()
  })
})
