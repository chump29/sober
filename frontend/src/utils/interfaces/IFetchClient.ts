import { type InferInput, object, optional } from "valibot"

import { MethodSchema, StringSchema } from "../schemas.ts"
import { SubstanceSchema } from "./ISubstance.ts"

/** Validate an {@link IFetchClient} object */
const FetchClientSchema = object({
  body: optional(SubstanceSchema),
  endpoint: StringSchema,
  method: MethodSchema,
  user: optional(StringSchema)
})

type FetchClientSchema = typeof FetchClientSchema

/**
 * Interface for FetchClientSchema
 * @see {@link FetchClientSchema}
 */
type IFetchClient = InferInput<FetchClientSchema>

export { FetchClientSchema, type IFetchClient }
