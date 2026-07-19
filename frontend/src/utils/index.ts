import { error } from "@postfmly/logger"

import { array, type GenericSchema, isValiError, parse, summarize } from "valibot"

import { StringAsBooleanSchema } from "./schemas.ts"

/**
 * Find DOM element
 * @function
 * @param {string} element - element identifier
 * @returns {HTMLElement | null} DOM element, or null
 */
const findElement = (element: string): HTMLElement | null => document.querySelector(element)

/**
 * Format version string
 * @function
 * @param {string | undefined} version - version string
 * @returns {string} v[version], or N/A
 */
const getVersion = (version: string | undefined): string => (version && version.length > 0 ? `v${version}` : "N/A")

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
  if (isValiError(e)) {
    error(summarize(e.issues))
  } else if (e instanceof DOMException && e.name === "TimeoutError") {
    error("Request timed out")
  } else {
    error(e)
  }
}

/**
 * Validate object or array
 * @function
 * @param {T | null} obj object or array
 * @param {S} schema validation schema
 * @returns {R | null} Validated object or array, or null
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
 * @constant
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
const DEBUG: boolean =
  validate<string, StringAsBooleanSchema, boolean>(import.meta.env.VITE_DEBUG, StringAsBooleanSchema) ?? false

export { DEBUG, FetchError, findElement, getVersion, handleError, UpdateType, validate }
