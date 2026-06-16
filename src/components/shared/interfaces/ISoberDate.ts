import { default as dayjs } from "dayjs"
import { type InferInput, object } from "valibot"

import { BooleanSchema, CostSchema, DATE_FORMAT, DateSchema } from "../schemas.ts"

/**
 * Validate an {@link ISoberDate} object
 * @property {number} cost
 * @see {@link CostSchema}
 * @property { undefined | null | string} date
 * @see {@link DateSchema}
 * @property {boolean} showCoin
 * @see {@link BooleanSchema}
 * @property {boolean} showCost
 * @see {@link BooleanSchema}
 */
const SoberDateSchema = object({
  cost: CostSchema,
  date: DateSchema,
  showCoin: BooleanSchema,
  showCost: BooleanSchema
})

type SoberDateSchema = typeof SoberDateSchema

/**
 * Interface for SoberDateSchema
 * @interface ISoberDate
 * @see {@link SoberDateSchema}
 */
type ISoberDate = InferInput<SoberDateSchema>

const defaultSoberDate: ISoberDate = {
  cost: undefined,
  date: dayjs().format(DATE_FORMAT),
  showCoin: true,
  showCost: true
} satisfies ISoberDate

export { defaultSoberDate, type ISoberDate, SoberDateSchema }
