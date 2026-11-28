import { beforeEach, describe, expect, test } from "bun:test"

import { fakerEN_US as fake } from "@faker-js/faker"
import { default as fetchMock } from "jest-fetch-mock"
import { match } from "ts-pattern"
import { object, string } from "valibot"

import { fetchClient } from "../../../src/services/fetchClient.ts"
import { Endpoint, HttpMethod, HttpStatus } from "../../../src/utils/index.ts"
import { BooleanSchema } from "../../../src/utils/schemas.ts"

const ResponseSchema = object({
  message: string()
})

type ResponseMode = "created" | "empty" | "error" | "json" | "noContent"

let mode: ResponseMode = "empty"

const fetch = fetchMock.enableMocks().mockResponse(
  (): Response =>
    match<ResponseMode, Response>(mode)
      .with("created", () => new Response(null, { status: HttpStatus.Created }))
      .with("empty", () => new Response(" "))
      .with("error", () => new Response(null, { status: HttpStatus.ImATeapot, statusText: "Teapot" }))
      .with("json", () => Response.json({ message: "ok" }))
      .with("noContent", () => new Response(null, { status: HttpStatus.NoContent }))
      .exhaustive()
)

const deleteRegex = /\/api\/substances\/delete\/1$/u

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

  test("returns null on NoContent response", async (): Promise<void> => {
    mode = "noContent"

    const result = await fetchClient(
      {
        endpoint: Endpoint.DeleteSubstance,
        id: 1,
        method: HttpMethod.DELETE,
        user: fake.person.firstName()
      },
      ResponseSchema
    )

    expect(result).toBeNull()
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(deleteRegex), expect.anything())
  })

  test("returns true when user endpoint returns Created", async (): Promise<void> => {
    mode = "created"

    const result = await fetchClient(
      {
        endpoint: Endpoint.User,
        method: HttpMethod.GET,
        user: fake.person.firstName()
      },
      BooleanSchema
    )

    expect(result).toBe(true)
  })

  test("parses and validates JSON response", async (): Promise<void> => {
    mode = "json"

    const result = await fetchClient(
      {
        endpoint: Endpoint.Version,
        method: HttpMethod.GET
      },
      ResponseSchema
    )

    expect(result).toStrictEqual({ message: "ok" })
  })
})
