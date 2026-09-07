import { describe, expect, test } from "bun:test"

import { expectTypeOf } from "expect-type"

import { env } from "../src/env.ts"
import { type IEnv } from "../src/utils/interfaces/IEnv.ts"

const {
  SOBER_API_TIMEOUT: API_TIMEOUT,
  SOBER_DEBUG: DEBUG,
  SOBER_JWT_AUDIENCE: AUDIENCE,
  SOBER_JWT_EXPIRE_TIME: EXPIRE_TIME,
  VITE_API_URL: API_URL,
  VITE_TITLE: TITLE
}: IEnv = env

describe("env", (): void => {
  test("SOBER_API_TIMEOUT", (): void => {
    expectTypeOf(API_TIMEOUT).toEqualTypeOf<number>()

    expect(API_TIMEOUT).toBeGreaterThan(0)
  })

  test("SOBER_DEBUG", (): void => {
    expectTypeOf(DEBUG).toEqualTypeOf<boolean>()

    expect(DEBUG).toBeTrue()
  })

  test("SOBER_JWT_AUDIENCE", (): void => {
    expectTypeOf(AUDIENCE).toEqualTypeOf<string>()

    expect(AUDIENCE.length).toBeGreaterThan(0)
  })

  test("SOBER_JWT_EXPIRE_TIME", (): void => {
    expectTypeOf(EXPIRE_TIME).toEqualTypeOf<string | number | Date>()

    expect((EXPIRE_TIME as string).length).toBeGreaterThan(0)
  })

  test("VITE_API_URL", (): void => {
    expectTypeOf(API_URL).toEqualTypeOf<string>()

    expect(API_URL.length).toEqual(0)
  })

  test("VITE_TITLE", (): void => {
    expectTypeOf(TITLE).toEqualTypeOf<string>()

    expect(TITLE.length).toBeGreaterThan(0)
  })
})
