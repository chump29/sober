import { expect } from "bun:test"

import { type ICoin } from "../../src/utils/interfaces/ICoin.ts"
import { type ICost } from "../../src/utils/interfaces/ICost.ts"
import { type ISubstance } from "../../src/utils/interfaces/ISubstance.ts"
import { type ISubstanceDisplay } from "../../src/utils/interfaces/ISubstanceDisplay.ts"
import { type IUser } from "../../src/utils/interfaces/IUser.ts"

const ICoinMatcher: ICoin = {
  image: expect.any(String),
  text: expect.any(String)
} satisfies ICoin

const ICostMatcher: ICost = {
  cost: expect.any(Number),
  costPerDay: expect.any(String)
} satisfies ICost

const ISubstanceMatcher: ISubstance = {
  date: expect.any(String),
  id: expect.any(Number),
  name: expect.any(String)
} satisfies ISubstance

const ISubstanceDisplayMatcher: ISubstanceDisplay = {
  id: expect.any(Number),
  label: null, // React.ReactNode
  value: expect.any(String)
} satisfies ISubstanceDisplay

const IUserMatcher: IUser = {
  cost: expect.any(Number),
  showCoin: expect.any(Boolean),
  showCost: expect.any(Boolean)
} satisfies IUser

export { ICoinMatcher, ICostMatcher, ISubstanceDisplayMatcher, ISubstanceMatcher, IUserMatcher }
