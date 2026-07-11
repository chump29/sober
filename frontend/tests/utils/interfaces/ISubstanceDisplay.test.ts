import { describe, expect, test } from "bun:test"

import { fakerEN_US as fake } from "@faker-js/faker"

import { type ISubstanceDisplay } from "../../../src/utils/interfaces/ISubstanceDisplay.ts"
import { ISubstanceDisplayMatcher } from "../Matchers.ts"

describe("ISubstanceDisplay", (): void => {
  test("ISubstanceDisplay", (): void => {
    expect({
      id: fake.number.int(),
      label: null, // React.ReactNode
      value: fake.word.sample()
    } satisfies ISubstanceDisplay).toMatchObject(ISubstanceDisplayMatcher)
  })
})
