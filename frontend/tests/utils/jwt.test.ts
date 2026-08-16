import { describe, expect, test } from "bun:test"

import { fakerEN_US as fake } from "@faker-js/faker"
import { default as dayjs } from "dayjs"
import { UnsecuredJWT } from "jose"

import { name } from "../../package.json" with { type: "json" }
import { getHeaders } from "../../src/utils/jwt.ts"

describe("jwt", (): void => {
  test("getHeaders", (): void => {
    const user: string = fake.person.firstName()

    const headers: Headers | undefined = getHeaders(user)

    expect(headers).not.toBeUndefined()

    const jwt: string = headers?.get("Authorization")?.split(" ")[1] as string

    const { payload } = UnsecuredJWT.decode(jwt)

    const exp: number = Math.abs(dayjs().diff(dayjs.unix(payload.exp ?? 0), "seconds"))
    const EXPIRE_TIME: number = 30

    expect(exp).toBeLessThanOrEqual(EXPIRE_TIME)
    expect(payload.sub).toBe(user)
    expect(payload.iss).toBe(name)
    expect(payload.aud).toBe(import.meta.env.VITE_AUDIENCE)
  })

  test("getHeaders - fail", (): void => {
    const headers: Headers | undefined = getHeaders("")

    expect(headers).toBeUndefined()
  })
})
