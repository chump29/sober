// biome-ignore-all lint/style/useComponentExportOnlyModules: mocks

import { beforeEach, describe, expect, mock, test } from "bun:test"

import { act, type JSX } from "react"

import { MantineProvider } from "@mantine/core"

import { type Nullable } from "@postfmly/types"

import { fakerEN_US as fake } from "@faker-js/faker"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { type UserEvent, userEvent } from "@testing-library/user-event"
import { default as fetchMock } from "jest-fetch-mock"
import { match, P } from "ts-pattern"

import { Endpoint, getKeyByValue, HttpMethod, HttpStatus, validate } from "../../../src/utils/index.ts"
import { type ISubstance, SubstanceSchema } from "../../../src/utils/interfaces/ISubstance.ts"
import { type ISubstancesProps } from "../../../src/utils/interfaces/ISubstancesProps.ts"
import { CostType, StatsType } from "../../../src/utils/schemas.ts"
import { getSubstance, toDisplay } from "../utils/helpers.ts"

const Substances = (): JSX.Element => <div data-testid="substances" />
mock.module(
  "../../../src/components/Substances.tsx",
  (): Record<string, unknown> => ({
    Substances
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

const { Settings }: { Settings: (props: ISubstancesProps) => JSX.Element } = await import(
  "../../../src/pages/Settings.tsx"
) // set up mocks first

const renderSettings = async (overrides: Partial<ISubstancesProps> = {}): Promise<void> => {
  const props = {
    allSubstances: [substance],
    refreshSubstances,
    selectedSubstance: substance,
    setSelectedSubstance,
    substances: [toDisplay(substance)],
    user: currentUser,
    ...overrides
  }

  await act((): Promise<void> => {
    render(<Settings {...props} />, { wrapper: MantineProvider })

    return Promise.resolve()
  })
}

const reCostPer = /Cost Per/u
const reShowCoin = /Show Coin/u
const reShowDecimals = /Show Decimals/u
const reShowCost = /Show Cost/u

beforeEach((): void => {
  substance = getSubstance({
    cost: Number(fake.finance.amount({ dec: 2, max: 100, min: 10 })),
    costType: CostType.Day,
    showCoin: true,
    showCost: true,
    showDecimals: true,
    statsType: StatsType.None
  })

  fetchResponse = substance
  lastRequest = null

  currentUser = fake.person.firstName()
  refreshSubstances = mock((): Promise<undefined> => Promise.resolve(undefined))
  setSelectedSubstance = mock((): undefined => undefined)
})

// biome-ignore lint/nursery/useLowercaseTestTitle: component name
describe("Settings", (): void => {
  test("displays substances and header", async (): Promise<void> => {
    await renderSettings()

    expect(screen.getByTestId("substances")).toBeInTheDocument()
    expect(screen.getByText("SETTINGS")).toBeInTheDocument()
    expect(screen.getByText("Customize these settings to your preference")).toBeInTheDocument()
  })

  // * NOTE: StatsType.Smoking has same logic
  test("changes statsType to Alcohol", async (): Promise<void> => {
    const updated = {
      ...substance
    }

    fetchResponse = updated

    await renderSettings()

    const user: UserEvent = userEvent.setup()

    await user.click(screen.getByLabelText("Stats Type", { selector: "input:not([type='hidden'])" }))

    await user.click(await screen.findByText(getKeyByValue(StatsType, StatsType.Alcohol)))

    await waitFor((): void => {
      expect(fetch).toHaveBeenCalledTimes(1)
    })

    expect(await lastRequest?.json()).toStrictEqual(
      expect.objectContaining({
        statsType: StatsType.Alcohol
      })
    )

    await waitFor((): void => {
      expect(setSelectedSubstance).toHaveBeenCalledWith(validate(updated, SubstanceSchema))
      expect(refreshSubstances).toHaveBeenCalledTimes(1)
    })
  })

  test("toggles showCoin", async (): Promise<void> => {
    const updated = {
      ...substance,
      showCoin: false
    }

    fetchResponse = updated

    await renderSettings()

    const user = userEvent.setup()

    const toggle = screen.getByLabelText(reShowCoin)

    expect(toggle).toBeChecked()

    await user.click(toggle)

    await waitFor((): void => {
      expect(fetch).toHaveBeenCalledTimes(1)
    })

    expect(lastRequest?.url).toContain(`/api/${Endpoint.UpdateSubstance}/${substance.id}`)
    expect(lastRequest?.method).toBe(HttpMethod.PUT)
    expect(await lastRequest?.json()).toStrictEqual(
      expect.objectContaining({
        showCoin: false
      })
    )

    await waitFor((): void => {
      expect(setSelectedSubstance).toHaveBeenCalledWith(validate(updated, SubstanceSchema))
      expect(refreshSubstances).toHaveBeenCalledTimes(1)
    })
  })

  test("toggles showDecimals", async (): Promise<void> => {
    const updated = {
      ...substance,
      showDecimals: false
    }

    fetchResponse = updated

    await renderSettings()

    const user = userEvent.setup()

    const toggle = screen.getByLabelText(reShowDecimals)

    expect(toggle).toBeChecked()

    await user.click(toggle)

    await waitFor((): void => {
      expect(fetch).toHaveBeenCalledTimes(1)
    })

    expect(await lastRequest?.json()).toStrictEqual(
      expect.objectContaining({
        showDecimals: false
      })
    )

    await waitFor((): void => {
      expect(setSelectedSubstance).toHaveBeenCalledWith(validate(updated, SubstanceSchema))
      expect(refreshSubstances).toHaveBeenCalledTimes(1)
    })
  })

  test("toggles showCost", async (): Promise<void> => {
    const updated = {
      ...substance,
      showCost: false
    }

    fetchResponse = updated

    await renderSettings()

    const user = userEvent.setup()

    const toggle = screen.getByLabelText(reShowCost)

    expect(toggle).toBeChecked()

    await user.click(toggle)

    await waitFor((): void => {
      expect(fetch).toHaveBeenCalledTimes(1)
    })

    expect(await lastRequest?.json()).toStrictEqual(
      expect.objectContaining({
        showCost: false
      })
    )

    await waitFor((): void => {
      expect(setSelectedSubstance).toHaveBeenCalledWith(validate(updated, SubstanceSchema))
      expect(refreshSubstances).toHaveBeenCalledTimes(1)
    })
  })

  test("hides cost", async (): Promise<void> => {
    await renderSettings({ selectedSubstance: getSubstance({ showCost: false }) })

    expect(screen.queryByLabelText(reCostPer)).toBeNull()
    expect(screen.queryByLabelText("Cost Frequency")).toBeNull()
  })

  test("shows cost error", async (): Promise<void> => {
    await renderSettings({ selectedSubstance: getSubstance({ cost: 0, costType: substance.costType, showCost: true }) })

    expect(screen.getByText("Cost must be greater than zero")).toBeInTheDocument()

    fireEvent.blur(
      screen.getByRole("textbox", {
        name: `Cost Per ${getKeyByValue(CostType, substance.costType)}`
      })
    )

    expect(fetch).not.toHaveBeenCalled()
    expect(refreshSubstances).not.toHaveBeenCalled()
  })

  test("changes cost", async (): Promise<void> => {
    const newCost = Number(fake.finance.amount({ dec: 2, max: 200, min: 101 }))

    const updated = {
      ...substance,
      cost: newCost
    }

    fetchResponse = updated

    await renderSettings()

    const input = screen.getByRole("textbox", {
      name: `Cost Per ${getKeyByValue(CostType, substance.costType)}`
    })

    fireEvent.change(input, { target: { value: String(newCost) } })

    fireEvent.blur(input)

    await waitFor((): void => {
      expect(fetch).toHaveBeenCalledTimes(1)
    })

    expect(await lastRequest?.json()).toStrictEqual(
      expect.objectContaining({
        cost: newCost
      })
    )

    await waitFor((): void => {
      expect(setSelectedSubstance).toHaveBeenCalledWith(validate(updated, SubstanceSchema))
      expect(refreshSubstances).toHaveBeenCalledTimes(1)
    })
  })

  test("clears cost", async (): Promise<void> => {
    await renderSettings()

    const input = screen.getByRole("textbox", {
      name: `Cost Per ${getKeyByValue(CostType, substance.costType)}`
    })

    fireEvent.change(input, { target: { value: "" } })

    expect(screen.getByText("Cost must be greater than zero")).toBeInTheDocument()

    fireEvent.blur(input)

    expect(fetch).not.toHaveBeenCalled()
    expect(setSelectedSubstance).not.toHaveBeenCalled()
    expect(refreshSubstances).not.toHaveBeenCalled()
  })

  test("updates costType", async (): Promise<void> => {
    const updated = {
      ...substance,
      costType: CostType.Month
    }

    fetchResponse = updated

    await renderSettings()

    const user: UserEvent = userEvent.setup()

    await user.click(screen.getByLabelText("Cost Frequency", { selector: "input:not([type='hidden'])" }))

    await user.click(await screen.findByText("Month"))

    await waitFor((): void => {
      expect(fetch).toHaveBeenCalledTimes(1)
    })

    expect(await lastRequest?.json()).toStrictEqual(
      expect.objectContaining({
        costType: CostType.Month
      })
    )

    await waitFor((): void => {
      expect(setSelectedSubstance).toHaveBeenCalledWith(validate(updated, SubstanceSchema))
      expect(refreshSubstances).toHaveBeenCalledTimes(1)
    })
  })

  test("does not update substance when user is null", async (): Promise<void> => {
    await renderSettings({ user: null })

    const user = userEvent.setup()

    await user.click(screen.getByLabelText(reShowCoin))

    expect(fetch).not.toHaveBeenCalled()
    expect(setSelectedSubstance).not.toHaveBeenCalled()
    expect(refreshSubstances).not.toHaveBeenCalled()
  })

  test("does not call setSelectedSubstance when fetchClient returns null", async (): Promise<void> => {
    fetchResponse = null

    await renderSettings()

    const user = userEvent.setup()

    await user.click(screen.getByLabelText(reShowCoin))

    await waitFor((): void => {
      expect(fetch).toHaveBeenCalledTimes(1)
    })

    expect(setSelectedSubstance).not.toHaveBeenCalled()
    expect(refreshSubstances).not.toHaveBeenCalled()
  })

  test("syncs cost", (): void => {
    const props = {
      allSubstances: [substance],
      refreshSubstances,
      selectedSubstance: substance,
      setSelectedSubstance,
      substances: [toDisplay(substance)],
      user: currentUser
    }

    const { rerender } = render(<Settings {...props} />, { wrapper: MantineProvider })

    const updatedCost = substance.cost + fake.number.int({ max: 100, min: 1 })

    rerender(
      <Settings
        {...props}
        selectedSubstance={{
          ...substance,
          cost: updatedCost
        }}
      />
    )

    expect(
      screen.getByRole("textbox", {
        name: `Cost Per ${getKeyByValue(CostType, substance.costType)}`
      })
    ).toHaveValue(`$ ${updatedCost.toFixed(2)}`)
  })
})
