import { error } from "@postfmly/logger"
import { type Nullable, type Optional } from "@postfmly/types"

import { match } from "ts-pattern"
import { array, type GenericSchema, isValiError, parse, summarize, type ValiError } from "valibot"

import { env } from "../../env.ts"
import { BooleanSchema } from "./schemas.ts"

// biome-ignore lint/nursery/useExplicitType: inferred
const { _DEBUG } = env

/**
 * Find DOM element
 * @function
 * @param {string} element - Element identifier
 * @returns {Nullable<HTMLElement>} DOM element, or null
 */
const findElement = (element: string): Nullable<HTMLElement> => document.querySelector(element)

/**
 * Format version string
 * @function
 * @param {Optional<string>} version - Version string
 * @returns {string} v[version], or N/A
 */
const getVersion = (version: Optional<string>): string => (version && version.length > 0 ? `v${version}` : "N/A")

/**
 * Show {@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API Fetch API} error message
 * @class
 * @extends Error
 * @param {Response} response {@link https://developer.mozilla.org/en-US/docs/Web/API/Response Response} object
 */
class FetchError extends Error {
  constructor(response: Response) {
    super(`❌ Error: ${response.status} - ${response.statusText}`)

    this.name = "FetchError"

    Object.setPrototypeOf(this, FetchError.prototype)
  }
}

/**
 * Show custom error message
 * @function
 * @param {unknown} e The error object
 */
const handleError = (e: unknown): void => {
  // biome-ignore format: don't expand braces
  match<object, void>({
    isTimeoutError: e instanceof DOMException && e.name === "TimeoutError",
    isValiError: isValiError(e)
  })
  .returnType<void>()
  .with({ isTimeoutError: true }, () => error("Request timed out"))
  .with({ isValiError: true }, (): void => error(summarize((e as ValiError<GenericSchema>).issues)))
  .otherwise((): void => error(e))
}

/**
 * Validate object or array
 * @function
 * @param {T | null} obj Value, object, or array
 * @param {S} schema Validation schema
 * @returns {T | R | null} Value, object, array, or null
 */
const validate = <T, S extends GenericSchema, R = T>(obj: T | null, schema: S): R | null => {
  if (obj === undefined || obj === null) {
    return null
  }

  try {
    if (Array.isArray(obj)) {
      return parse(array(schema), obj) as R
    }

    return parse(schema, obj) as R
  } catch (e: unknown) {
    handleError(e)

    return null
  }
}

/**
 * Update type
 * @constant {UpdateType}
 */
const UpdateType = {
  ShowCoin: "ShowCoin",
  ShowCost: "ShowCost"
} as const

/**
 * Update type
 * @type {UpdateType}
 */
type UpdateType = (typeof UpdateType)[keyof typeof UpdateType]

/**
 * Debug mode
 * @constant {boolean}
 * @default false
 */
const DEBUG: boolean = validate<boolean, BooleanSchema>(_DEBUG, BooleanSchema) ?? false

/**
 * Get key by value
 * @function
 * @param {T} obj Const literal
 * @param {number} value Value
 * @returns {string} Key
 */
const getKeyByValue = <T extends Record<string, number>>(obj: T, value: number): string =>
  Object.keys(obj).find((key: string): boolean => obj[key] === value) as string

/**
 * Save type
 * @constant {SaveType}
 */
const SaveType = {
  COST: 1,
  COST_TYPE: 2,
  SHOW_COIN: 3,
  SHOW_COST: 4,
  SHOW_DECIMALS: 5
} as const

/**
 * Save type
 * @type {SaveType}
 */
type SaveType = (typeof SaveType)[keyof typeof SaveType]

export { DEBUG, FetchError, findElement, getKeyByValue, getVersion, handleError, SaveType, UpdateType, validate }
