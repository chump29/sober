import { default as dayjs } from "dayjs"
import { type InferInput, object } from "valibot"

import {
  BooleanSchema,
  CostSchema,
  CostType,
  CostTypeSchema,
  DATETIME_FORMAT,
  DateTimeSchema,
  IdSchema,
  NameSchema,
  StatsType,
  StatsTypeSchema
} from "../schemas.ts"

/** Validate an {@link ISubstance} object */
const SubstanceSchema = object({
  cost: CostSchema,
  costType: CostTypeSchema,
  date: DateTimeSchema,
  id: IdSchema,
  name: NameSchema,
  showCoin: BooleanSchema,
  showCost: BooleanSchema,
  showDecimals: BooleanSchema,
  showTime: BooleanSchema,
  statsType: StatsTypeSchema
})

/**
 * SubstanceSchema type
 * @see {@link SubstanceSchema}
 */
type SubstanceSchema = typeof SubstanceSchema

/**
 * Interface for SubstanceSchema
 * @see {@link SubstanceSchema}
 */
type ISubstance = InferInput<SubstanceSchema>

/**
 * Default SubstanceSchema values
 * @see {@link ISubstance}
 */
const defaultSubstance: ISubstance = {
  cost: 0,
  costType: CostType.Day,
  date: dayjs().format(DATETIME_FORMAT),
  id: undefined,
  name: "",
  showCoin: false,
  showCost: false,
  showDecimals: true,
  showTime: true,
  statsType: StatsType.None
}

export { defaultSubstance, type ISubstance, SubstanceSchema }
