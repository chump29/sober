import { expect } from "bun:test"

import { type ICost } from "../../src/utils/interfaces/ICost.ts"
import { type IDisplay } from "../../src/utils/interfaces/IDisplay.ts"
import { type IMonthAndYear } from "../../src/utils/interfaces/IMonthAndYear.ts"
import { type ISelectDisplay } from "../../src/utils/interfaces/ISelectDisplay.ts"
import { type ISubstance } from "../../src/utils/interfaces/ISubstance.ts"
import { type ISubstanceDisplay } from "../../src/utils/interfaces/ISubstanceDisplay.ts"

const IMonthAndYearMatcher: IMonthAndYear = {
  m: expect.any(Number),
  y: expect.any(Number)
} satisfies IMonthAndYear

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

export {
  ICostMatcher,
  IDisplayMatcher,
  IMonthAndYearMatcher,
  ISelectDisplayMatcher,
  ISubstanceDisplayMatcher,
  ISubstanceMatcher
}
