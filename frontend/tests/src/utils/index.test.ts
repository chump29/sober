import { describe, expect, test } from "bun:test"

import { null_ } from "valibot"

import { validate } from "../../../src/utils/index.ts"

// * NOTE: only covers code not under test

describe("index", (): void => {
  test("validate - null", (): void => {
    expect(validate(null, null_())).toBeNull()
  })
})
