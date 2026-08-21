import { beforeEach, describe, expect, type jest, mock, spyOn, test } from "bun:test"
import { sleep } from "bun"

import { MantineProvider } from "@mantine/core"
import { ModalsProvider } from "@mantine/modals"
import { Notifications } from "@mantine/notifications"

import { fakerEN_US as fake } from "@faker-js/faker"
import { act, configure, render, screen, waitFor } from "@testing-library/react"
import { default as ExtractNumbers } from "extract-numbers"
import { default as httpStatus } from "http-status-codes"
import { type FetchMock, default as fetchMock } from "jest-fetch-mock"
import { default as ms } from "ms"
import { match } from "ts-pattern"

import Display from "../../../src/components/Display/index.tsx"
import { type Nullable } from "../../../src/utils/index.ts"
import { type ISubstance } from "../../../src/utils/interfaces/ISubstance.ts"
import { CostType } from "../../../src/utils/schemas.ts"
import { getSubstance } from "../../utils/Helpers.ts"

configure({
  asyncUtilTimeout: ms("3s")
})

mock.module("@mantine/hooks", (): unknown => ({
  useReducedMotion: () => true
}))

let substance: Nullable<ISubstance> = null

const fetch: FetchMock = fetchMock.enableMocks().mockResponse(
  (req: Request): Response =>
    match<string, Response>(new URL(req.url).pathname)
      .returnType<Response>()
      .with("/api/substances", (): Response => Response.json([substance]))
      .with("/api/user", (): Response => new Response())
      .otherwise(
        (): Response =>
          new Response(null, {
            status: httpStatus.IM_A_TEAPOT
          })
      )
)

const infoSpy: jest.Mock = spyOn(console, "info")

const extract: ExtractNumbers = new ExtractNumbers({ removeCommas: true, string: false })

beforeEach(async (): Promise<void> => {
  infoSpy.mockReset()

  substance = getSubstance()
  substance.costType = CostType.Day
  substance.showCoin = true
  substance.showCost = true

  localStorage.setItem("soberUser", fake.person.firstName())

  await act(async (): Promise<void> => {
    await waitFor((): void => {
      render(
        <MantineProvider>
          <ModalsProvider>
            <Notifications />
            <Display />
          </ModalsProvider>
        </MantineProvider>
      )
    })
  })
})

describe("Display - index", (): void => {
  test("init", (): void => {
    const NUM_TIMES: number = 4

    act((): void => {
      expect(fetch).toHaveBeenCalledTimes(NUM_TIMES)
    })
  })

  test("elements", async (): Promise<void> => {
    expect(await screen.findByTestId("loggedIn")).toBeInTheDocument()

    expect(await screen.findByTestId("settings")).toBeInTheDocument()

    expect(await screen.findByTestId("datePicker")).toBeInTheDocument()

    expect(await screen.findByTestId("counter")).toBeInTheDocument()

    expect(await screen.findByTestId("cost")).toBeInTheDocument()

    expect(await screen.findByTestId("coinButton")).toBeInTheDocument()
  })

  test("increment", async (): Promise<void> => {
    const counter: HTMLDivElement = await screen.findByTestId("seconds")

    expect(counter).toBeInTheDocument()

    const numBefore: number[] = extract.extractNumbers(counter.textContent) as number[]
    expect(numBefore).toHaveLength(1)

    await waitFor(async (): Promise<void> => {
      await sleep(ms("2s"))
    })

    const numAfter: number[] = extract.extractNumbers(counter.textContent) as number[]
    expect(numAfter).toHaveLength(1)

    expect(numBefore[0]).toBeLessThan(numAfter[0] as number)
  })
})
