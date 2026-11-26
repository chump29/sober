import { type InferInput, object, optional } from "valibot"

import { EndpointSchema, IdSchema, MethodSchema, StringSchema, TimeoutSchema } from "../schemas.ts"
import { SubstanceSchema } from "./ISubstance.ts"

/** Validate an {@link IFetchClientSettings} object */
const FetchClientSettingsSchema = object({
  body: optional(SubstanceSchema),
  endpoint: EndpointSchema,
  id: optional(IdSchema),
  method: MethodSchema,
  timeout: optional(TimeoutSchema),
  user: optional(StringSchema)
})

type FetchClientSettingsSchema = typeof FetchClientSettingsSchema

/**
 * Interface for FetchClientSettingsSchema
 * @see {@link FetchClientSettingsSchema}
 */
type IFetchClientSettings = InferInput<FetchClientSettingsSchema>

export { FetchClientSettingsSchema, type IFetchClientSettings }
