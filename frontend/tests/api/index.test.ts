import { describe, expect, type jest, spyOn, test } from "bun:test"

import { type Nullable } from "@postfmly/types"

import { fakerEN_US as fake } from "@faker-js/faker"
import { default as httpMethods } from "http-methods-constants"
import { type FetchMock, default as fetchMock } from "jest-fetch-mock"

import { fetchClient } from "../../src/api/index.ts"
import { type IFetchClient } from "../../src/utils/interfaces/IFetchClient.ts"
import { type ISubstance } from "../../src/utils/interfaces/ISubstance.ts"
import { getSubstance } from "../utils/Helpers.ts"

const fetch: FetchMock = fetchMock.enableMocks().mockOnce(() => Response.json(getSubstance()))

const settings: IFetchClient = {
  endpoint: fake.internet.url(),
  method: fake.helpers.arrayElement([httpMethods.GET, httpMethods.POST, httpMethods.PUT, httpMethods.DELETE]),
  user: fake.person.firstName()
} satisfies IFetchClient

const errorSpy: jest.Mock = spyOn(console, "error")

describe("api - index", (): void => {
  test("fetchClient", async (): Promise<void> => {
    const substance: Nullable<ISubstance> = await fetchClient<ISubstance>(settings)

    expect(fetch).toHaveBeenCalled()
    expect(substance).not.toBeNull()
  })

  test("fetchClient - invalid settings", async (): Promise<void> => {
    errorSpy.mockReset()

    expect(await fetchClient({ endpoint: "", method: httpMethods.HEAD } as IFetchClient)).toBeNull()

    const NUM_TIMES: number = 4

    expect(errorSpy).toHaveBeenCalledTimes(NUM_TIMES)
  })
})
