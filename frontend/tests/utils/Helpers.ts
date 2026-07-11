import { fakerEN_US as fake } from "@faker-js/faker"
import { Big } from "big.js"
import { default as dayjs } from "dayjs"

import { type ICoin } from "../../src/utils/interfaces/ICoin.ts"
import { type ICost } from "../../src/utils/interfaces/ICost.ts"
import { type ISubstance } from "../../src/utils/interfaces/ISubstance.ts"
import { type IUser } from "../../src/utils/interfaces/IUser.ts"
import { DATE_FORMAT } from "../../src/utils/schemas.ts"

const getCoin = (): ICoin =>
  ({
    image: fake.image.url(),
    text: fake.word.words(2)
  }) satisfies ICoin

const getCost = (): ICost => {
  const cost: number = Number(fake.commerce.price())

  const DaysPerWeek: number = 7

  const costPerDay: number = cost / DaysPerWeek

  return {
    cost,
    costPerDay: new Big(costPerDay).toFixed(2, 0)
  } satisfies ICost
}

const getSubstance = (): ISubstance =>
  ({
    date: dayjs(fake.date.soon()).format(DATE_FORMAT),
    id: fake.number.int({
      max: 1000,
      min: 1
    }),
    name: fake.word.noun()
  }) satisfies ISubstance

const getUser = (): IUser =>
  ({
    cost: Number(fake.commerce.price()),
    showCoin: fake.datatype.boolean(),
    showCost: fake.datatype.boolean()
  }) satisfies IUser

export { getCoin, getCost, getSubstance, getUser }
