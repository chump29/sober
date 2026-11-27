import { beforeEach, describe, expect, test } from "bun:test"

import { fakerEN_US as fake } from "@faker-js/faker"
import { default as fetchMock } from "jest-fetch-mock"
import { match } from "ts-pattern"
import { object, string } from "valibot"

import { fetchClient } from "../../../src/services/fetchClient.ts"
import { Endpoint, HttpMethod, HttpStatus } from "../../../src/utils/index.ts"

// * NOTE: only covers code not under test

const ResponseSchema = object({
  message: string()
})

type ResponseMode = "empty" | "error"

let mode: ResponseMode = "empty"

const fetch = fetchMock.enableMocks().mockResponse(
  (): Response =>
    match<ResponseMode, Response>(mode)
      .with("empty", () => new Response("   "))
      .with("error", () => new Response(null, { status: HttpStatus.ImATeapot, statusText: "Teapot" }))
      .exhaustive()
)

beforeEach((): void => {
  mode = "empty"
})

describe("fetchClient", (): void => {
  test("returns null when settings are invalid", async (): Promise<void> => {
    const result = await fetchClient(
      {
        endpoint: Endpoint.Substances,
        id: -1,
        method: HttpMethod.GET,
        user: fake.person.firstName()
      },
      ResponseSchema
    )

    expect(result).toBeNull()
    expect(fetch).not.toHaveBeenCalled()
  })

  test("returns null when response text is empty", async (): Promise<void> => {
    mode = "empty"

    const result = await fetchClient(
      {
        endpoint: Endpoint.Substances,
        method: HttpMethod.GET,
        user: fake.person.firstName()
      },
      ResponseSchema
    )

    expect(result).toBeNull()
  })

  test("returns null when response is not ok", async (): Promise<void> => {
    mode = "error"

    const result = await fetchClient(
      {
        endpoint: Endpoint.Substances,
        method: HttpMethod.GET,
        user: fake.person.firstName()
      },
      ResponseSchema
    )

    expect(result).toBeNull()
  })
})
