import { beforeEach, describe, expect, mock, test } from "bun:test"

import { fakerEN_US as fake } from "@faker-js/faker"
import { MantineProvider } from "@mantine/core"
import { ModalsProvider } from "@mantine/modals"
import { act, configure, render, screen } from "@testing-library/react"
import { default as httpStatus } from "http-status-codes"
import { default as fetchMock } from "jest-fetch-mock"
import { default as ms } from "ms"

import Display from "../../../src/components/Display/index.tsx"
import { getSubstance, getUser } from "../../utils/Helpers.ts"

configure({
  asyncUtilTimeout: ms("3s")
})

mock.module("@mantine/hooks", (): unknown => ({
  useReducedMotion: () => true
}))

fetchMock.enableMocks().mockResponse(async (req: Request): Promise<Response> => {
  const endpoint: string = new URL(req.url).pathname

  // TODO: causes act() warning
  if (endpoint === "/api/user") {
    return await act((): Response => Response.json(getUser()))
  }

  if (endpoint === "/api/substances") {
    return await act(
      (): Response =>
        Response.json([
          getSubstance()
        ])
    )
  }

  return new Response(null, {
    status: httpStatus.IM_A_TEAPOT
  })
})

beforeEach((): void => {
  localStorage.setItem("soberUser", fake.person.firstName())

  render(
    <MantineProvider>
      <ModalsProvider>
        <Display />
      </ModalsProvider>
    </MantineProvider>
  )
})

describe("index", (): void => {
  test("should show user logged in", async (): Promise<void> => {
    expect(await screen.findByTestId("loggedIn"), "Logged in user not found").toBeInTheDocument()
  })

  test("should show settings icon", async (): Promise<void> => {
    expect(await screen.findByTestId("settings"), "Settings icon not found").toBeInTheDocument()
  })

  test("should show date picker", async (): Promise<void> => {
    expect(await screen.findByTestId("datepicker"), "Date picker not found").toBeInTheDocument()
  })
})
