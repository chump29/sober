import { fakerEN_US as fake } from "@faker-js/faker"
import { default as dayjs } from "dayjs"

import { type ISubstance } from "../../../src/utils/interfaces/ISubstance.ts"
import { type ISubstanceDisplay } from "../../../src/utils/interfaces/ISubstanceDisplay.ts"
import { CostType, DATETIME_FORMAT } from "../../../src/utils/schemas.ts"

export const getSubstance = (options: Partial<Pick<ISubstance, "cost" | "costType" | "date">> = {}): ISubstance => ({
  cost: options.cost ?? Number(fake.commerce.price()),
  costType: options.costType ?? fake.helpers.enumValue(CostType),
  date: options.date ?? dayjs(fake.date.past()).format(DATETIME_FORMAT),
  id: fake.number.int({ max: 100, min: 1 }),
  name: fake.lorem.word(),
  showCoin: fake.datatype.boolean(),
  showCost: fake.datatype.boolean(),
  showDecimals: fake.datatype.boolean(),
  showTime: fake.datatype.boolean()
})

export const toDisplay = (substance: ISubstance): ISubstanceDisplay => ({
  cost: substance.cost,
  id: substance.id ?? 0,
  label: substance.name,
  value: substance.name
})
