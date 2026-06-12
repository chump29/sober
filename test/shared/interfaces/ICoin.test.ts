import { describe, expect, test } from "bun:test"

import { fakerEN_US as fake } from "@faker-js/faker"

import { type ICoin } from "../../../src/components/shared/interfaces/ICoin.ts"

describe("ICoin", (): void => {
  test("ICoin", (): void => {
    expect({
      image: fake.image.url(),
      text: fake.word.sample()
    } satisfies ICoin).toMatchObject({
      image: expect.any(String),
      text: expect.any(String)
    } satisfies ICoin)
  })
})
