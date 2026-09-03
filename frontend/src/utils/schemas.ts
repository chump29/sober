// cSpell: ignore SSSZ

import { default as dayjs } from "dayjs"
import { default as utc } from "dayjs/plugin/utc"
import { default as httpMethods } from "http-methods-constants"
import {
  boolean,
  type CheckIssue,
  check,
  gtValue,
  integer,
  isoTimestamp,
  maxLength,
  minValue,
  nonEmpty,
  number,
  optional,
  pipe,
  string,
  toBoolean,
  toNumber,
  transform,
  trim,
  url,
  enum as v_enum,
  words
} from "valibot"

dayjs.extend(utc)

/**
 * Validate string
 * @function
 * @summary Non-empty string
 */
const StringSchema = pipe(string(), trim(), nonEmpty())

type StringSchema = typeof StringSchema

/**
 * Validate boolean
 * @function
 * @summary Valid boolean {@link https://developer.mozilla.org/en-US/docs/Glossary/Truthy value}
 */
const BooleanSchema = boolean()

type BooleanSchema = typeof BooleanSchema

/**
 * Validate string as boolean
 * @function
 * @summary Non-empty string
 * @returns {boolean} Valid boolean {@link https://developer.mozilla.org/en-US/docs/Glossary/Truthy value}
 */
const StringAsBooleanSchema = pipe(StringSchema, toBoolean())

type StringAsBooleanSchema = typeof StringAsBooleanSchema

/**
 * Custom datetime format
 * @constant {string}
 * @summary YYYY-MM-DDTHH:mm:ss.SSSZ
 * @type {string}
 * @example 2026-08-22T04:20:45.720-05:00
 */
const DATETIME_FORMAT: string = "YYYY-MM-DDTHH:mm:ss.SSSZ"

/**
 * Validate datetime
 * @function
 * @summary Non-empty string, valid {@link https://www.iso.org/iso-8601-date-and-time-format.html ISO 8601} datetime format
 * @returns {string} UTC datetime
 */
const DateTimeSchema = pipe(
  StringSchema,
  isoTimestamp("Not a valid ISO 8601 datetime format"),
  check(
    (s: string): boolean => dayjs(s, DATETIME_FORMAT, true).isValid(),
    (e: CheckIssue<string>): string => `Invalid date: ${e.input}`
  ),
  transform((d: string): string => dayjs(d).utc().format())
)

type DateTimeSchema = typeof DateTimeSchema

/**
 * Datetime short output format
 * @constant {string}
 * @summary YYYY, MMMM Do, YYYY
 * @example Saturday, August 22nd, 2026
 */
const DATETIME_FORMAT_SHORT_OUTPUT: string = "dddd, MMMM Do, YYYY"

/**
 * Datetime output format
 * @constant {string}
 * @summary YYYY, MMMM Do, YYYY @ h:mm A
 * @example Saturday, August 22nd, 2026 @ 4:20 AM
 */
const DATETIME_FORMAT_OUTPUT: string = `${DATETIME_FORMAT_SHORT_OUTPUT} @ h:mm A`

/**
 * Validate URL
 * @function
 * @summary Non-empty string, valid {@link https://datatracker.ietf.org/doc/html/rfc3986 URL}
 */
const UrlSchema = pipe(StringSchema, url())

type UrlSchema = typeof UrlSchema

const MIN_TIMEOUT: number = 200

/**
 * Validate API timeout
 * @function
 * @summary string, min value = {@link MIN_TIMEOUT} ms
 * @returns {number} Integer
 */
const TimeoutSchema = pipe(StringSchema, toNumber(), integer(), minValue(MIN_TIMEOUT))

type TimeoutSchema = typeof TimeoutSchema

/**
 * Validate cost
 * @function
 * @summary number, >= 0
 */
const CostSchema = pipe(number(), minValue(0))

type CostSchema = typeof CostSchema

/**
 * Validate cost input
 * @function
 * @summary Non-empty string, >= 0
 * @returns {number} Number
 */
const CostInputSchema = pipe(StringSchema, toNumber(), minValue(0))

type CostInputSchema = typeof CostInputSchema

/**
 * Maximum user length
 * @constant {number}
 * @type {number}
 * @default 64
 */
const MAX_LEN_STR: number = 64

/**
 * Validate substance name
 * @function
 * @summary Non-empty string, max length = {@link MAX_LEN_STR}
 */
const NameSchema = pipe(StringSchema, maxLength(MAX_LEN_STR))

type NameSchema = typeof NameSchema

/**
 * Validate ID
 * @function
 * @summary Optional<number>, > 0
 * @default undefined
 * @returns {number} Integer
 */
const IdSchema = optional(pipe(number(), integer(), gtValue(0)))

type IdSchema = typeof IdSchema

/**
 * Validate title
 * @function
 * @summary Non-empty string, exactly two words, US English locale
 */
const TitleSchema = pipe(StringSchema, words("en-US", 2))

type TitleSchema = typeof TitleSchema

/**
 * Validate HTTP method
 * @function
 * @summary Valid HTTP method
 */
const MethodSchema = v_enum(httpMethods)

type MethodSchema = typeof MethodSchema

/**
 * Cost type
 * @constant {CostType}
 */
const CostType = {
  Day: 1,
  Month: 3,
  Week: 2,
  Year: 4
} as const

/**
 * Cost type
 * @type {CostType}
 */
type CostType = (typeof CostType)[keyof typeof CostType]

/**
 * Validate CostType
 * @function
 * @summary Valid {@link CostType}
 */
const CostTypeSchema = v_enum(CostType)

type CostTypeSchema = typeof CostTypeSchema

export {
  BooleanSchema,
  CostInputSchema,
  CostSchema,
  CostType,
  CostTypeSchema,
  DATETIME_FORMAT,
  DATETIME_FORMAT_OUTPUT,
  DATETIME_FORMAT_SHORT_OUTPUT,
  DateTimeSchema,
  IdSchema,
  MAX_LEN_STR,
  MethodSchema,
  NameSchema,
  StringAsBooleanSchema,
  StringSchema,
  TimeoutSchema,
  TitleSchema,
  UrlSchema
}
