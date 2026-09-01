import { beforeEach, describe, expect, jest, mock, test } from "bun:test"

import { MantineProvider } from "@mantine/core"
import { ModalsProvider } from "@mantine/modals"

import { type Nullable } from "@postfmly/types"

import { fakerEN_US as fake } from "@faker-js/faker"
import { configure, render, screen, waitFor } from "@testing-library/react"
import { type UserEvent, userEvent } from "@testing-library/user-event"
import { default as httpStatus } from "http-status-codes"
import { type FetchMock, default as fetchMock } from "jest-fetch-mock"
import { default as ms } from "ms"
import { match, P } from "ts-pattern"

import { Settings } from "../../../src/components/Settings/index.tsx"
import { getKeyByValue } from "../../../src/utils/index.ts"
import { type ISubstance } from "../../../src/utils/interfaces/ISubstance.ts"
import { CostType } from "../../../src/utils/schemas.ts"
import { getSubstance } from "../../utils/Helpers.ts"

configure({
  asyncUtilTimeout: ms("3s")
})

mock.module("@mantine/hooks", (): unknown => ({
  useReducedMotion: () => true
}))

const fetch: FetchMock = fetchMock.enableMocks().mockResponse(
  (req: Request): Response =>
    match<string, Response>(new URL(req.url).pathname)
      .returnType<Response>()
      .with(P.string.startsWith("/api/substances/update"), (): Response => new Response())
      .otherwise(
        (): Response =>
          new Response(null, {
            status: httpStatus.IM_A_TEAPOT
          })
      )
)

let user: Nullable<UserEvent> = null

let substance: Nullable<ISubstance> = null

let times: number = 0

beforeEach(async (): Promise<void> => {
  user = userEvent.setup()

  await waitFor((): void => {
    substance = getSubstance()
    substance.showCoin = true
    substance.showCost = true
    substance.showDecimals = true

    render(
      <MantineProvider>
        <ModalsProvider>
          <Settings
            closeSettings={jest.fn()}
            openedSettings={true}
            refreshSubstances={jest.fn()}
            substances={[substance]}
            user={fake.person.firstName()}
          />
        </ModalsProvider>
      </MantineProvider>
    )
  })
})

describe("Settings - index", (): void => {
  test("stack", async (): Promise<void> => {
    expect(await screen.findByTestId(`stack-${substance?.name}`)).toBeInTheDocument()

    const showDecimals: HTMLInputElement = await screen.findByTestId("showDecimals")
    expect(showDecimals).toBeInTheDocument()
    expect(showDecimals).toBeChecked()

    const showCoin: HTMLInputElement = await screen.findByTestId("showCoin")
    expect(showCoin).toBeInTheDocument()
    expect(showCoin).toBeChecked()

    const showCost: HTMLInputElement = await screen.findByTestId("showCost")
    expect(showCost).toBeInTheDocument()
    expect(showCost).toBeChecked()

    const costType: HTMLSelectElement = await screen.findByTestId("costType")
    expect(costType).toBeInTheDocument()
    expect(costType).toHaveValue(getKeyByValue(CostType, substance?.costType ?? 0))

    const cost: HTMLInputElement = await screen.findByTestId("cost")
    expect(cost).toBeInTheDocument()
    expect(cost).toHaveValue(String(substance?.cost.toFixed(2) ?? 0))
  })

  test("showDecimals", async (): Promise<void> => {
    const showDecimals: HTMLInputElement = await screen.findByTestId("showDecimals")

    await user?.click(showDecimals)

    expect(fetch).toHaveBeenCalledTimes(++times)
  })

  test("showCoin", async (): Promise<void> => {
    const showCoin: HTMLInputElement = await screen.findByTestId("showCoin")

    await user?.click(showCoin)

    expect(fetch).toHaveBeenCalledTimes(++times)
  })

  test("showCost", async (): Promise<void> => {
    const showCost: HTMLInputElement = await screen.findByTestId("showCost")

    await user?.click(showCost)

    expect(fetch).toHaveBeenCalledTimes(++times)
  })
})
