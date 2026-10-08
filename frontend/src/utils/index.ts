import { error } from "@postfmly/logger"
import { type Nullable } from "@postfmly/types"

import { match, P } from "ts-pattern"
import { array, type GenericSchema, isValiError, parse, summarize } from "valibot"

/**
 * Find DOM element
 * @param element - Element identifier
 * @returns DOM element, or null
 */
const findElement = (element: string): Nullable<HTMLElement> => document.querySelector(element)

/**
 * Show {@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API Fetch API} error message
 * @param response {@link https://developer.mozilla.org/en-US/docs/Web/API/Response Response} object
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
 * @param e The error object
 */
const handleError = (e: unknown): void => {
  match<unknown, void>(e)
    .with(P.intersection(P.instanceOf(DOMException), { name: "TimeoutError" }), () => error("Request timed out"))
    .with(P.when(isValiError), (v): void => error(summarize(v.issues)))
    .otherwise((): void => error(e))
}

/**
 * Validate object or array
 * @param obj Value, object, or array
 * @param schema Validation schema
 * @returns Value, object, array, or null
 * @example validate<string, StringToNumberSchema, number>("5", StringToNumberSchema) // returns 5
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

/** Update type */
const UpdateType = {
  ShowCoin: "ShowCoin",
  ShowCost: "ShowCost"
} as const

/** Update type */
type UpdateType = (typeof UpdateType)[keyof typeof UpdateType]

/**
 * Get key by value
 * @param obj Const literal
 * @param value Value
 * @returns Key
 */
const getKeyByValue = <T extends Record<string, number>>(obj: T, value: number): string =>
  Object.keys(obj).find((key: string): boolean => obj[key] === value) as string

/** Save type */
const SaveType = {
  COST: 1,
  COST_TYPE: 2,
  SHOW_COIN: 3,
  SHOW_COST: 4,
  SHOW_DECIMALS: 5
} as const

/** Save type */
type SaveType = (typeof SaveType)[keyof typeof SaveType]

/**
 * HTTP Methods
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods HTTP request methods}
 */
const HttpMethods = {
  DELETE: "DELETE",
  GET: "GET",
  HEAD: "HEAD",
  POST: "POST",
  PUT: "PUT"
} as const

/**
 * HTTP Status Codes
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status HTTP status codes}
 */
const HttpStatus = {
  IM_A_TEAPOT: 418,
  NO_CONTENT: 204
} as const

export { FetchError, findElement, getKeyByValue, HttpMethods, HttpStatus, handleError, SaveType, UpdateType, validate }
