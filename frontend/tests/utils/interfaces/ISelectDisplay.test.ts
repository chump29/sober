import { describe, expect, test } from "bun:test"

import { type ICost } from "../../../src/utils/interfaces/ICost.ts"
import { type ISelectDisplay } from "../../../src/utils/interfaces/ISelectDisplay.ts"
import { getCost } from "../Helpers.ts"
import { ISelectDisplayMatcher } from "../Matchers.ts"

describe("ISelectDisplay", (): void => {
  test("ISelectDisplay", (): void => {
    const c: ICost = getCost()

    const d: ISelectDisplay = {
      label: c.costPer,
      value: c.cost
    } satisfies ISelectDisplay

    expect(d).toMatchObject(ISelectDisplayMatcher)
  })
})
