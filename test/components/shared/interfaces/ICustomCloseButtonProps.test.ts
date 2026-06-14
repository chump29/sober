import { describe, expect, test } from "bun:test"

import { fakerEN_US as fake } from "@faker-js/faker"

import { type ICustomCloseButtonProps } from "../../../../src/components/shared/interfaces/ICustomCloseButtonProps.ts"

describe("ICustomCloseButtonProps", (): void => {
  test("ICustomCloseButtonProps", (): void => {
    expect({
      "data-testid": fake.word.sample()
    } satisfies ICustomCloseButtonProps).toMatchObject({
      "data-testid": expect.any(String)
    } satisfies ICustomCloseButtonProps)
  })
})
