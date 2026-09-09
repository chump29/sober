import { describe, expect, test } from "bun:test"

import { fakerEN_US as fake } from "@faker-js/faker"
import { type SafeParseResult, safeParse } from "valibot"

import { HttpMethods } from "../../../src/utils/index.ts"
import { FetchClientSchema, type IFetchClient } from "../../../src/utils/interfaces/IFetchClient.ts"
import { getSubstance } from "../Helpers.ts"

describe("IFetchClient", (): void => {
  const fetchClient: IFetchClient = {
    endpoint: fake.word.verb(),
    method: fake.helpers.objectKey(HttpMethods),
    user: fake.person.firstName()
  } as IFetchClient

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
      endpoint: ""
    } as IFetchClient)

    expect(f.success).toBeFalse()
    expect(f.issues?.[0].message).toContain("!0")
  })
})
