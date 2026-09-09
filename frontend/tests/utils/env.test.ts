import { describe, expect, test } from "bun:test"

import { expectTypeOf } from "expect-type"
import { default as ms } from "ms"

import { env, type IEnv } from "../../src/env.ts"

const { SOBER_API_TIMEOUT, SOBER_DEBUG, SOBER_JWT_AUDIENCE, SOBER_JWT_EXPIRE_TIME, VITE_API_URL, VITE_TITLE }: IEnv =
  env

describe("env", (): void => {
  test("SOBER_API_TIMEOUT", (): void => {
    expectTypeOf(SOBER_API_TIMEOUT).toEqualTypeOf<number>()

    expect(SOBER_API_TIMEOUT).toBe(ms("2s"))
  })

  test("SOBER_DEBUG", (): void => {
    expectTypeOf(SOBER_DEBUG).toEqualTypeOf<boolean>()

    expect(SOBER_DEBUG).toBeTrue()
  })

  test("SOBER_JWT_AUDIENCE", (): void => {
    expectTypeOf(SOBER_JWT_AUDIENCE).toEqualTypeOf<string>()

    expect(SOBER_JWT_AUDIENCE).toBe("sober-backend")
  })

  test("SOBER_JWT_EXPIRE_TIME", (): void => {
    expectTypeOf(SOBER_JWT_EXPIRE_TIME).toEqualTypeOf<string | number | Date>()

    expect(SOBER_JWT_EXPIRE_TIME as string).toBe("30s")
  })

  test("VITE_API_URL", (): void => {
    expectTypeOf(VITE_API_URL).toEqualTypeOf<string>()

    expect(VITE_API_URL).toBe("")
  })

  test("VITE_TITLE", (): void => {
    expectTypeOf(VITE_TITLE).toEqualTypeOf<string>()

    expect(VITE_TITLE).toBe("Sᴏʙᴇᴙ Tᴙᴀᴄᴋᴇᴙ")
  })
})
