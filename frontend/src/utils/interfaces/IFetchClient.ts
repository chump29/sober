import { type InferInput, object, optional, union } from "valibot"

import { MethodSchema, StringSchema } from "../schemas.ts"
import { SubstanceSchema } from "./ISubstance.ts"
import { UserSchema } from "./IUser.ts"

/**
 * Validate an {@link IFetchClient} object
 * @constant
 * @property {IUser | ISubstance} [body]
 * @see {@link BodySchema}
 * @property {string} endpoint
 * @see {@link StringSchema}
 * @property {string} method
 * @see {@link MethodSchema}
 * @property {string} [user]
 * @see {@link StringSchema}
 */
const FetchClientSchema = object({
  body: optional(
    union([
      UserSchema,
      SubstanceSchema
    ])
  ),
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
