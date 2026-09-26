import { exponentialDistributor, fakerEN_US as fake } from "@faker-js/faker"
import { default as dayjs } from "dayjs"

import { type ICost } from "../../src/utils/interfaces/ICost.ts"
import { type IMonthAndYear } from "../../src/utils/interfaces/IMonthAndYear.ts"
import { type ISubstance } from "../../src/utils/interfaces/ISubstance.ts"
import { type ISubstanceDisplay } from "../../src/utils/interfaces/ISubstanceDisplay.ts"
import { CostType, DATETIME_FORMAT } from "../../src/utils/schemas.ts"

const MONTHS: number = 12

const getMonthAndYear = (): IMonthAndYear => {
  // * NOTE: 66% chance that years will be 0-10
  const years: number = fake.number.int({ distributor: exponentialDistributor({ base: 864.58 }), max: 100 })
  const months: number =
    years === 0 ? fake.number.int({ distributor: exponentialDistributor(), max: 12, min: 1 }) : years * MONTHS

  return {
    m: months,
    y: years
  } satisfies IMonthAndYear
}

const getCost = (): ICost => {
  const cost: number = Number(fake.commerce.price())

  const costPer: string = `Cost per ${fake.helpers.enumValue(CostType)}: $${cost}`

  return {
    cost,
    costPer
  } satisfies ICost
}

const getSubstanceDisplay = (): ISubstanceDisplay => {
  const c: ICost = getCost()

  return {
    cost: c.cost,
    id: fake.number.int({ max: 100, min: 1 }),
    label: null, // React.ReactNode
    value: c.costPer
  } satisfies ISubstanceDisplay
}

const getSubstance = (): ISubstance =>
  ({
    cost: Number(fake.commerce.price()),
    costType: fake.helpers.enumValue(CostType),
    date: dayjs(fake.date.past()).format(DATETIME_FORMAT),
    id: fake.number.int({ max: 1000, min: 1 }),
    name: fake.lorem.word(),
    showCoin: fake.datatype.boolean(),
    showCost: fake.datatype.boolean(),
    showDecimals: fake.datatype.boolean(),
    showTime: fake.datatype.boolean()
  }) satisfies ISubstance

export { getCost, getMonthAndYear, getSubstance, getSubstanceDisplay }
