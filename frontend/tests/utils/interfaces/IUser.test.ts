import { describe, expect, test } from "bun:test"

import { safeParse } from "valibot"

import { type IUser, UserSchema } from "../../../src/utils/interfaces/IUser.ts"
import { getUser } from "../Helpers.ts"

describe("IUser", (): void => {
  const user: IUser = getUser()

  test("IUser", (): void => {
    expect(safeParse(UserSchema, user).success).toBeTrue()
  })
})
