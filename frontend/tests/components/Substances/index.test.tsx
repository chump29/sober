import { beforeEach, describe, expect, jest, mock, spyOn, test } from "bun:test"

import { MantineProvider } from "@mantine/core"
import { ModalsProvider } from "@mantine/modals"

import { type Nullable } from "@postfmly/types"

import { fakerEN_US as fake } from "@faker-js/faker"
import { configure, render, screen } from "@testing-library/react"
import { type UserEvent, userEvent } from "@testing-library/user-event"
import { default as httpStatus } from "http-status-codes"
import { type FetchMock, default as fetchMock } from "jest-fetch-mock"
import { default as ms } from "ms"
import { match, P } from "ts-pattern"

import { default as Substances } from "../../../src/components/Substances/index.tsx"
import { type ISubstance } from "../../../src/utils/interfaces/ISubstance.ts"
import { getSubstance, getSubstanceDisplay } from "../../utils/Helpers.ts"
import { SUBSTANCES } from "../../utils/Substances.ts"

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
      .with("/api/substances/add", (): Response => Response.json(substance))
      .with(P.string.startsWith("/api/substances/delete"), (): Response => Response.json(true))
      .with(P.string.startsWith("/api/substances/update"), (): Response => new Response())
      .otherwise(
        (): Response =>
          new Response(null, {
            status: httpStatus.IM_A_TEAPOT
          })
      )
)

const infoSpy: jest.Mock = spyOn(console, "info")

let user: Nullable<UserEvent> = null

let times: number = 0

beforeEach((): void => {
  infoSpy.mockReset()

  user = userEvent.setup()

  substance = getSubstance()

  render(
    <MantineProvider>
      <ModalsProvider>
        <Substances
          allSubstances={[substance]}
          refreshSubstances={jest.fn()}
          selectedSubstance={substance}
          setSelectedSubstance={jest.fn()}
          substances={[getSubstanceDisplay()]}
          user={fake.person.firstName()}
        />
      </ModalsProvider>
    </MantineProvider>
  )
})

describe("Substances - index", (): void => {
  test("segment", async (): Promise<void> => {
    expect(await screen.findByTestId(`segment-${substance?.name}`)).toBeInTheDocument()
  })

  test("add", async (): Promise<void> => {
    await user?.click(await screen.findByTestId("addButton"))

    const nameInput: HTMLInputElement = await screen.findByTestId("substanceName")

    expect(nameInput).toBeVisible()

    // * NOTE: userEvent.type() doesn't like spaces
    const name: string = fake.helpers.arrayElement(SUBSTANCES).replaceAll(" ", "-")

    await user?.type(nameInput, name)

    expect(nameInput).toHaveValue(name)

    await user?.click(await screen.findByTestId("confirmSubstance"))

    expect(infoSpy).toHaveBeenCalledTimes(2)

    expect(fetch).toHaveBeenCalledTimes(++times)

    expect(nameInput).not.toBeVisible()
  })

  test("remove", async (): Promise<void> => {
    await user?.click(await screen.findByTestId("removeButton"))

    await user?.click(await screen.findByTestId("confirmDelete"))

    expect(infoSpy).toHaveBeenCalledTimes(2)

    expect(fetch).toHaveBeenCalledTimes(++times)
  })

  test("edit", async (): Promise<void> => {
    await user?.dblClick(await screen.findByTestId(`segment-${substance?.name}`))

    const nameInput: HTMLInputElement = await screen.findByTestId("substanceName")

    expect(nameInput).toBeVisible()

    await user?.clear(nameInput)

    expect(nameInput).not.toHaveValue()

    // * NOTE: userEvent.type() doesn't like spaces
    const name: string = fake.helpers.arrayElement(SUBSTANCES).replaceAll(" ", "-")

    await user?.type(nameInput, name)

    expect(nameInput).toHaveValue(name)

    await user?.click(await screen.findByTestId("confirmSubstance"))

    expect(fetch).toHaveBeenCalledTimes(++times)

    expect(infoSpy).toHaveBeenCalledTimes(2)

    expect(nameInput).not.toBeVisible()
  })

  test("add - cancel", async (): Promise<void> => {
    await user?.click(await screen.findByTestId("addButton"))

    const nameInput: HTMLInputElement = await screen.findByTestId("substanceName")

    expect(nameInput).toBeVisible()

    await user?.click(await screen.findByTestId("cancelSubstance"))

    expect(fetch).toHaveBeenCalledTimes(times) // not incremented

    expect(nameInput).not.toBeVisible()
  })
})
