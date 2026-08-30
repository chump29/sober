import { describe, expect, test } from "bun:test"

import { type Optional } from "@postfmly/types"

import { fakerEN_US as fake } from "@faker-js/faker"
import { default as dayjs } from "dayjs"
import { UnsecuredJWT } from "jose"

import { env } from "../../env.ts"
import { name } from "../../package.json" with { type: "json" }
import { getHeaders } from "../../src/utils/jwt.ts"

// biome-ignore lint/nursery/useExplicitType: inferred
const { VITE_AUDIENCE } = env

describe("jwt", (): void => {
  test("getHeaders", (): void => {
    const user: string = fake.person.firstName()

    const headers: Optional<Headers> = getHeaders(user)

    expect(headers).not.toBeUndefined()

    const jwt: string = headers?.get("Authorization")?.split(" ")[1] as string

    const { payload } = UnsecuredJWT.decode(jwt)

    const exp: number = Math.abs(dayjs().diff(dayjs.unix(payload.exp ?? 0), "seconds"))
    const EXPIRE_TIME: number = 30

    expect(exp).toBeLessThanOrEqual(EXPIRE_TIME)
    expect(payload.sub).toBe(user)
    expect(payload.iss).toBe(name)
    expect(payload.aud).toBe(VITE_AUDIENCE)
  })

  test("getHeaders - fail", (): void => {
    const headers: Optional<Headers> = getHeaders("")

    expect(headers).toBeUndefined()
  })
})
