import { fakerEN_US as fake } from "@faker-js/faker"
import { default as dayjs } from "dayjs"
import { titleCase } from "title-case"

import { type ISubstance } from "../../../src/utils/interfaces/ISubstance.ts"
import { type ISubstanceDisplay } from "../../../src/utils/interfaces/ISubstanceDisplay.ts"
import { CostType, DATETIME_FORMAT, StatsType } from "../../../src/utils/schemas.ts"

let nextId = 1

export const getSubstance = (options: Partial<ISubstance> = {}): ISubstance => ({
  cost: options.cost ?? Number(fake.commerce.price()),
  costType: options.costType ?? fake.helpers.enumValue(CostType),
  date: options.date ?? dayjs(fake.date.past()).format(DATETIME_FORMAT),
  id: options.id ?? nextId++,
  name: options.name ?? titleCase(fake.lorem.word()),
  showCoin: options.showCoin ?? fake.datatype.boolean(),
  showCost: options.showCost ?? fake.datatype.boolean(),
  showDecimals: options.showDecimals ?? fake.datatype.boolean(),
  showTime: options.showTime ?? fake.datatype.boolean(),
  statsType: options.statsType ?? fake.helpers.enumValue(StatsType)
})

export const toDisplay = (substance: ISubstance): ISubstanceDisplay => ({
  cost: substance.cost,
  id: substance.id ?? 0,
  label: substance.name,
  value: substance.name
})
