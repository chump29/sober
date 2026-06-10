import { type InferInput, object } from "valibot"

import { CostSchema, DateSchema, ToggleSchema } from "./schemas.ts"

/**
 * Validate an {@link ISoberDate} object
 * @property {number} cost
 * @see {@link CostSchema}
 * @property {string} date
 * @see {@link DateSchema}
 * @property {boolean} showCoin
 * @see {@link ToggleSchema}
 * @property {boolean} showCost
 * @see {@link ToggleSchema}
 */
const SoberDateSchema = object({
  cost: CostSchema,
  date: DateSchema,
  showCoin: ToggleSchema,
  showCost: ToggleSchema
})

type SoberDateSchema = typeof SoberDateSchema

/**
 * Interface for SoberDateSchema
 * @interface ISoberDate
 * @see {@link SoberDateSchema SoberDateSchema}
 */
type ISoberDate = InferInput<typeof SoberDateSchema>

export { type ISoberDate, SoberDateSchema }
