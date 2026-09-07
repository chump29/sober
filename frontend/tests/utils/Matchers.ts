import { expect } from "bun:test"

import { type ICoin } from "../../src/utils/interfaces/ICoin.ts"
import { type ICost } from "../../src/utils/interfaces/ICost.ts"
import { type IDisplay } from "../../src/utils/interfaces/IDisplay.ts"
import { type IEnv } from "../../src/utils/interfaces/IEnv.ts"
import { type ISelectDisplay } from "../../src/utils/interfaces/ISelectDisplay.ts"
import { type ISubstance } from "../../src/utils/interfaces/ISubstance.ts"
import { type ISubstanceDisplay } from "../../src/utils/interfaces/ISubstanceDisplay.ts"

const ICoinMatcher: ICoin = {
  image: expect.any(String),
  text: expect.any(String)
} satisfies ICoin

const ICostMatcher: ICost = {
  cost: expect.any(Number),
  costPer: expect.any(String)
} satisfies ICost

const IDisplayMatcher: IDisplay = {
  days: expect.any(String),
  daysInt: expect.any(Number),
  hours: expect.any(String),
  minutes: expect.any(String),
  months: expect.any(String),
  monthsFloat: expect.any(Number),
  seconds: expect.any(String),
  weeks: expect.any(String),
  weeksFloat: expect.any(Number),
  years: expect.any(String),
  yearsFloat: expect.any(Number)
} as IDisplay

const ISelectDisplayMatcher: ISelectDisplay = {
  label: expect.any(String),
  value: expect.any(Number)
}

const ISubstanceMatcher: ISubstance = {
  cost: expect.any(Number),
  costType: expect.any(Number),
  date: expect.any(String),
  id: undefined,
  name: expect.any(String),
  showCoin: expect.any(Boolean),
  showCost: expect.any(Boolean),
  showDecimals: expect.any(Boolean),
  showTime: expect.any(Boolean)
} satisfies ISubstance

const ISubstanceDisplayMatcher: ISubstanceDisplay = {
  cost: expect.any(Number),
  id: expect.any(Number),
  label: null, // React.ReactNode
  value: expect.any(String)
} satisfies ISubstanceDisplay

const IEnvMatcher: IEnv = {
  SOBER_API_TIMEOUT: expect.any(Number),
  SOBER_DEBUG: expect.any(Boolean),
  SOBER_JWT_AUDIENCE: expect.any(String),
  SOBER_JWT_EXPIRE_TIME: expect.any(String), // string|number|Date
  VITE_API_URL: expect.any(String),
  VITE_TITLE: expect.any(String)
}

export {
  ICoinMatcher,
  ICostMatcher,
  IDisplayMatcher,
  IEnvMatcher,
  ISelectDisplayMatcher,
  ISubstanceDisplayMatcher,
  ISubstanceMatcher
}
