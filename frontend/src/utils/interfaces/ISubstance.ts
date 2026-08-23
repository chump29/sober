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
  NameSchema
} from "../schemas.ts"

/**
 * Validate an {@link ISubstance} object
 * @constant {SubstanceSchema}
 * @property {number} cost
 * @see {@link CostSchema}
 * @property {CostType} costType
 * @see {@link CostTypeSchema}
 * @property {string} date
 * @see {@link DateTimeSchema}
 * @property {Optional<number>} id
 * @see {@link IdSchema}
 * @property {string} name
 * @see {@link NameSchema}
 * @property {boolean} showCoin
 * @see {@link BooleanSchema}
 * @property {boolean} showCost
 * @see {@link BooleanSchema}
 * @property {boolean} showDecimals
 * @see {@link BooleanSchema}
 * @property {boolean} showTime
 * @see {@link BooleanSchema}
 */
const SubstanceSchema = object({
  cost: CostSchema,
  costType: CostTypeSchema,
  date: DateTimeSchema,
  id: IdSchema,
  name: NameSchema,
  showCoin: BooleanSchema,
  showCost: BooleanSchema,
  showDecimals: BooleanSchema,
  showTime: BooleanSchema
})

/**
 * SubstanceSchema type
 * @type {SubstanceSchema}
 * @see {@link SubstanceSchema}
 */
type SubstanceSchema = typeof SubstanceSchema

/**
 * Interface for SubstanceSchema
 * @interface
 * @see {@link SubstanceSchema}
 */
type ISubstance = InferInput<SubstanceSchema>

/**
 * Default SubstanceSchema values
 * @constant {ISubstance}
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
  showTime: true
} satisfies ISubstance

export { defaultSubstance, type ISubstance, SubstanceSchema }
