// biome-ignore-all lint/nursery/useLowercaseTestTitle: using env names

import { describe, expect, test } from "bun:test"

import { expectTypeOf } from "expect-type"
import { type InferOutput } from "valibot"

import { env } from "../../src/env.ts"
import { type ExpireTimeSchema } from "../../src/utils/schemas.ts"

describe("env", (): void => {
  test("API_TIMEOUT", (): void => {
    expect(env.API_TIMEOUT).toBeNumber()

    expect(env.API_TIMEOUT).toBeGreaterThan(0)
  })

  test("API_URL", (): void => {
    expect(env.API_URL).toBeString()

    expect(env.API_URL).toHaveLength(0)
  })

  test("DEBUG", (): void => {
    expect(env.DEBUG).toBeBoolean()

    expect(env.DEBUG).toBeTrue()
  })

  test("JWT_AUDIENCE", (): void => {
    expect(env.JWT_AUDIENCE).toBeString()

    expect(env.JWT_AUDIENCE.length).toBeGreaterThan(0)
  })

  test("JWT_EXPIRE_TIME", (): void => {
    expectTypeOf(env.JWT_EXPIRE_TIME).toEqualTypeOf<InferOutput<typeof ExpireTimeSchema>>()
  })

  test("TEST_FULL", (): void => {
    expect(env.TEST_FULL).toBeBoolean()
  })

  test("TITLE", (): void => {
    expect(env.TITLE).toBeString()

    expect(env.TITLE.length).toBeGreaterThan(0)
  })
})
