import { default as dayjs } from "dayjs"
import { type InferInput, object } from "valibot"

import { CostSchema, DATE_FORMAT, DateSchema, IdSchema, NameSchema } from "../schemas.ts"

/**
 * Validate an {@link ISubstance} object
 * @constant
 * @property {null | number} cost
 * @see {@link CostSchema}
 * @property {string} date
 * @see {@link DateSchema}
 * @property {number} id
 * @see {@link IdSchema}
 * @property {string} name
 * @see {@link NameSchema}
 * @returns {ISubstance} {@link ISubstance} object
 */
const SubstanceSchema = object({
  cost: CostSchema,
  date: DateSchema,
  id: IdSchema,
  name: NameSchema
})

type SubstanceSchema = typeof SubstanceSchema

/**
 * Interface for SubstanceSchema
 * @interface
 * @see {@link SubstanceSchema}
 */
type ISubstance = InferInput<SubstanceSchema>

const defaultSubstance = {
  cost: 0,
  date: dayjs().format(DATE_FORMAT)
} as ISubstance

export { defaultSubstance, type ISubstance, SubstanceSchema }
