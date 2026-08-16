import { type InferInput, object, optional } from "valibot"

import { MethodSchema, StringSchema } from "../schemas.ts"
import { SubstanceSchema } from "./ISubstance.ts"

/**
 * Validate an {@link IFetchClient} object
 * @constant {FetchClientSchema}
 * @property {ISubstance | undefined} [body]
 * @see {@link SubstanceSchema}
 * @property {string} endpoint
 * @see {@link StringSchema}
 * @property {string} method
 * @see {@link MethodSchema}
 * @property {string | undefined} [user]
 * @see {@link StringSchema}
 */
const FetchClientSchema = object({
  body: optional(SubstanceSchema),
  endpoint: StringSchema,
  method: MethodSchema,
  user: optional(StringSchema)
})

type FetchClientSchema = typeof FetchClientSchema

/**
 * Interface for FetchClientSchema
 * @interface
 * @see {@link FetchClientSchema}
 */
type IFetchClient = InferInput<FetchClientSchema>

export { FetchClientSchema, type IFetchClient }
