import { describe, expect, test } from "bun:test"

import { fakerEN_US as fake } from "@faker-js/faker"
import { default as httpMethods } from "http-methods-constants"
import { type SafeParseResult, safeParse } from "valibot"

import { FetchClientSchema, type IFetchClient } from "../../../src/utils/interfaces/IFetchClient.ts"
import { getSubstance, getUser } from "../Helpers.ts"

describe("IFetchClient", (): void => {
  const fetchClient: IFetchClient = {
    endpoint: fake.word.verb(),
    method: fake.helpers.objectKey(httpMethods),
    user: fake.person.firstName()
  } as IFetchClient

  test("IFetchClient - user", (): void => {
    const f: SafeParseResult<FetchClientSchema> = safeParse(FetchClientSchema, {
      ...fetchClient,
      body: getUser()
    } satisfies IFetchClient)

    expect(f.success).toBeTrue()
  })

  test("IFetchClient - substance", (): void => {
    const f: SafeParseResult<FetchClientSchema> = safeParse(FetchClientSchema, {
      ...fetchClient,
      body: getSubstance()
    } satisfies IFetchClient)

    expect(f.success).toBeTrue()
  })

  test("IFetchClient - fail", (): void => {
    const f: SafeParseResult<FetchClientSchema> = safeParse(FetchClientSchema, {
      ...fetchClient,
      method: "NOP"
    } satisfies IFetchClient)

    expect(f.success).toBeFalse()
    expect(f.issues?.[0].message).toStartWith("Invalid type")
  })
})
