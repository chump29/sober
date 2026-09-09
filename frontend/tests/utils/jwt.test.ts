import { default as assert } from "node:assert/strict"

import { describe, expect, test } from "bun:test"

import { type Optional } from "@postfmly/types"

import { fakerEN_US as fake } from "@faker-js/faker"
import { default as dayjs } from "dayjs"
import { default as ExtractNumbers } from "extract-numbers"
import { UnsecuredJWT } from "jose"

import { name } from "../../package.json" with { type: "json" }
import { env, type IEnv } from "../../src/env.ts"
import { getHeaders } from "../../src/utils/jwt.ts"

const { SOBER_JWT_AUDIENCE: AUDIENCE, SOBER_JWT_EXPIRE_TIME: EXPIRE_TIME }: IEnv = env

describe("jwt", (): void => {
  test("getHeaders", (): void => {
    const user: string = fake.person.firstName()

    const headers: Optional<Headers> = getHeaders(user)

    expect(headers).not.toBeUndefined()

    const jwt: string = headers?.get("Authorization")?.split(" ")[1] as string

    const { payload } = UnsecuredJWT.decode(jwt)

    const exp: number = Math.abs(dayjs().diff(dayjs.unix(payload.exp ?? 0), "seconds"))

    const extract: ExtractNumbers = new ExtractNumbers({ removeCommas: true, string: false })
    const expires: number[] = extract.extractNumbers(EXPIRE_TIME as string) as number[]
    assert(expires[0])

    expect(exp).toBeLessThanOrEqual(expires[0])
    expect(payload.sub).toBe(user)
    expect(payload.iss).toBe(name)
    expect(payload.aud).toBe(AUDIENCE)
  })

  test("getHeaders - fail", (): void => {
    const headers: Optional<Headers> = getHeaders("")

    expect(headers).toBeUndefined()
  })
})
