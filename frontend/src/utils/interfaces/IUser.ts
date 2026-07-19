import { type InferInput, object } from "valibot"

import { BooleanSchema } from "../schemas.ts"

/**
 * Validate an {@link IUser} object
 * @constant
 * @property {boolean} showCoin
 * @see {@link BooleanSchema}
 * @property {boolean} showCost
 * @see {@link BooleanSchema}
 * @returns {IUser} {@link IUser} object
 */
const UserSchema = object({
  showCoin: BooleanSchema,
  showCost: BooleanSchema
})

type UserSchema = typeof UserSchema

/**
 * Interface for UserSchema
 * @interface
 * @see {@link UserSchema}
 */
type IUser = InferInput<UserSchema>

export { type IUser, UserSchema }
