import { error } from "@postfmly/logger"
import { type Nullable } from "@postfmly/types"

import { match, P } from "ts-pattern"
import { type GenericSchema, type InferOutput, isValiError, parse, summarize } from "valibot"

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
    .with(P.when(isValiError), (v) => error(summarize(v.issues)))
    .otherwise(() => error(e))
}

/**
 * Validate object
 * @param object Object
 * @param schema Validation schema
 * @returns Validated object
 * @example validate(["1", "2"], StringArrayToNumberSchema) // returns [1, 2]
 * @example validate("12", StringToNumberSchema) // returns 12
 */
const validate = <S extends GenericSchema>(o: unknown, s: S): Nullable<InferOutput<S>> => {
  if (o === undefined || o === null) {
    return null
  }

  try {
    return parse(s, o)
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
 * @returns Key or empty string
 */
const getKeyByValue = <T extends Record<string, number>>(obj: T, value: number): string =>
  Object.keys(obj).find((key: string): boolean => obj[key] === value) ?? ""

/**
 * HTTP Methods
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods HTTP request methods}
 */
const HttpMethod = {
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
  Created: 201,
  ImATeapot: 418,
  NoContent: 204
} as const

/** Percentage multiplier (0-100) */
const FACTOR = 100

/**
 * Rounds number to two decimal places
 * @param num Number
 * @returns Rounded number
 */
const round = (num: number): number => Math.round((num + Number.EPSILON) * FACTOR) / FACTOR

/**
 * Rounds number down to nearest whole number
 * @param num Number
 * @returns Rounded down number
 */
const roundDown = (num: number): number => Math.floor(num)

const Page = {
  Home: "home",
  Milestones: "milestones",
  Settings: "settings",
  Stats: "stats"
} as const

type Page = (typeof Page)[keyof typeof Page]

/** Endpoints */
const Endpoint = {
  AddSubstance: "substances/add",
  DeleteSubstance: "substances/delete",
  Evict: "user/evict",
  Substances: "substances",
  UpdateSubstance: "substances/update",
  User: "user",
  Version: "version"
} as const

/** Maximum number of substances allowed */
const MAX_SUBSTANCES = 5

/** Metrics */
const Metric = {
  Days: "days",
  Fortnights: "fortnights",
  Hours: "hours",
  Minutes: "minutes",
  Months: "months",
  Seconds: "seconds",
  Weeks: "weeks",
  Years: "years"
} as const

/** Milestones */
const Milestone = {
  Day: "1 Day",
  Fortnight: "1 Fortnight",
  Month: "1 Month",
  Months3: "3 Months",
  Months6: "6 Months",
  Week: "1 Week",
  Year: "1 Year",
  Years2: "2 Years",
  Years5: "5 Years"
} as const

/** Per X */
const Per = {
  Day: "Per Day",
  Fortnight: "Per Fortnight",
  Hour: "Per Hour",
  Minute: "Per Minute",
  Month: "Per Month",
  Second: "Per Second",
  Week: "Per Week",
  Year: "Per Year"
} as const

/**
 * Format currency in USD
 * @example currencyFormatter.format(num)
 */
const currencyFormatter = new Intl.NumberFormat("en-US", { currency: "USD", style: "currency" })

export {
  currencyFormatter,
  Endpoint,
  FACTOR,
  FetchError,
  getKeyByValue,
  HttpMethod,
  HttpStatus,
  handleError,
  MAX_SUBSTANCES,
  Metric,
  Milestone,
  Page,
  Per,
  round,
  roundDown,
  UpdateType,
  validate
}
