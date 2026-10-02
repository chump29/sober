import { describe, expect, test } from "bun:test"

import { expectTypeOf } from "expect-type"

import { env } from "../src/env.ts"

describe("env", (): void => {
  test("SOBER_API_TIMEOUT", (): void => {
    expectTypeOf(env.SOBER_API_TIMEOUT).toEqualTypeOf<number>()

    expect(env.SOBER_API_TIMEOUT).toBeGreaterThan(0)
  })

  test("SOBER_DEBUG", (): void => {
    expectTypeOf(env.SOBER_DEBUG).toEqualTypeOf<boolean>()

    expect(env.SOBER_DEBUG).toBeTrue()
  })

  test("SOBER_JWT_AUDIENCE", (): void => {
    expectTypeOf(env.SOBER_JWT_AUDIENCE).toEqualTypeOf<string>()

    expect(env.SOBER_JWT_AUDIENCE.length).toBeGreaterThan(0)
  })

  test("SOBER_JWT_EXPIRE_TIME", (): void => {
    expectTypeOf(env.SOBER_JWT_EXPIRE_TIME).toEqualTypeOf<string | number | Date>()

    expect((env.SOBER_JWT_EXPIRE_TIME as string).length).toBeGreaterThan(0)
  })

  test("VITE_API_URL", (): void => {
    expectTypeOf(env.VITE_API_URL).toEqualTypeOf<string>()

    expect(env.VITE_API_URL).toHaveLength(0)
  })

  test("VITE_TITLE", (): void => {
    expectTypeOf(env.VITE_TITLE).toEqualTypeOf<string>()

    expect(env.VITE_TITLE.length).toBeGreaterThan(0)
  })
})
