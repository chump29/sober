import { default as dayjs } from "dayjs"
import { type InferInput, object } from "valibot"

import { DATE_FORMAT, DateSchema, IdSchema, NameSchema } from "../schemas.ts"

/**
 * Validate an {@link ISubstance} object
 * @constant
 * @property {string} date
 * @see {@link DateSchema}
 * @property {number} id
 * @see {@link IdSchema}
 * @property {string} name
 * @see {@link NameSchema}
 * @returns {ISubstance} {@link ISubstance} object
 */
const SubstanceSchema = object({
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
  date: dayjs().format(DATE_FORMAT)
} as ISubstance

export { defaultSubstance, type ISubstance, SubstanceSchema }
