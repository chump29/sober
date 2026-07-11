import { describe, expect, test } from "bun:test"

import { type SafeParseResult, safeParse } from "valibot"

import { type IUser, UserSchema } from "../../../src/utils/interfaces/IUser.ts"
import { getUser } from "../Helpers.ts"

describe("IUser", (): void => {
  const user: IUser = getUser()

  test("IUser", (): void => {
    expect(safeParse(UserSchema, user).success).toBeTrue()
  })

  test("IUser - fail", (): void => {
    user.cost = 0

    const u: SafeParseResult<UserSchema> = safeParse(UserSchema, user)

    expect(u.success).toBeFalse()
    expect(u.issues?.[0].message).toContain(">0")
  })
})
