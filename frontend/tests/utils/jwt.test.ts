import { describe, expect, test } from "bun:test"

import { fakerEN_US as fake } from "@faker-js/faker"
import { UnsecuredJWT } from "jose"

import { getHeaders } from "../../src/utils/jwt.ts"

describe("jwt", (): void => {
  test("getHeaders", (): void => {
    const name: string = fake.person.firstName()

    const headers: Headers | undefined = getHeaders(name)

    expect(headers).not.toBeUndefined()

    const jwt: string = headers?.get("Authorization")?.split(" ")[1] as string

    expect(UnsecuredJWT.decode(jwt).payload.sub).toBe(name)
  })

  test("getHeaders - fail", (): void => {
    const headers: Headers | undefined = getHeaders("")

    expect(headers).toBeUndefined()
  })
})
