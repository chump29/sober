import { default as dayjs } from "dayjs"
import { default as httpMethods } from "http-methods-constants"
import { default as ms, type StringValue } from "ms"
import { valid } from "semver"
import {
  boolean,
  type CheckIssue,
  check,
  gtValue,
  integer,
  isoDate,
  maxLength,
  minValue,
  nonEmpty,
  number,
  optional,
  pipe,
  regex,
  string,
  toBoolean,
  toNumber,
  transform,
  trim,
  url,
  enum as v_enum,
  words
} from "valibot"

/**
 * Validate against Semantic Versioning Specification
 * @function
 * @summary Non-empty string, valid {@link https://semver.org/ SemVer}
 */
const VersionSchema = pipe(
  string(),
  trim(),
  nonEmpty(),
  transform((s: string): string => s.replaceAll('"', "")),
  check(
    (s: string): boolean => valid(s) !== null,
    (e: CheckIssue<string>): string => `Invalid SemVer: ${e.input}`
  )
)

type VersionSchema = typeof VersionSchema

/**
 * Validate string as boolean
 * @function
 * @summary Non-empty string, valid boolean {@link https://developer.mozilla.org/en-US/docs/Glossary/Truthy value}
 */
const StringAsBooleanSchema = pipe(string(), trim(), nonEmpty(), toBoolean())

type StringAsBooleanSchema = typeof StringAsBooleanSchema

/**
 * Validate boolean
 * @function
 * @summary Valid boolean {@link https://developer.mozilla.org/en-US/docs/Glossary/Truthy value}
 */
const BooleanSchema = boolean()

type BooleanSchema = typeof BooleanSchema

/**
 * Custom date format
 * @constant {string}
 * @summary YYYY-MM-DD
 * @type {string}
 * @example 2026-06-13
 */
const DATE_FORMAT: string = "YYYY-MM-DD"

/**
 * Validate date
 * @function
 * @summary Non-empty string, valid {@link https://www.iso.org/iso-8601-date-and-time-format.html ISO 8601} date format
 */
const DateSchema = pipe(
  string(),
  trim(),
  isoDate("Not a valid ISO 8601 date format"),
  check(
    (s: string): boolean => dayjs(s, DATE_FORMAT, true).isValid(),
    (e: CheckIssue<string>): string => `Invalid date: ${e.input}`
  )
)

type DateSchema = typeof DateSchema

/**
 * Validate URL
 * @function
 * @summary Valid {@link https://datatracker.ietf.org/doc/html/rfc3986 URL}
 */
const UrlSchema = pipe(string(), trim(), nonEmpty(), url())

type UrlSchema = typeof UrlSchema

const MIN_TIMEOUT: number = 200

/**
 * Validate API timeout
 * @function
 * @summary Converts string to milliseconds, min value = {@link MIN_TIMEOUT} ms
 */
const TimeoutSchema = pipe(
  string(),
  trim(),
  nonEmpty(),
  regex(/^\d+\w+$/i),
  transform((s: string): number => ms(s as StringValue)),
  minValue(MIN_TIMEOUT)
)

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
 * @returns {number} number
 */
const CostInputSchema = pipe(string(), trim(), nonEmpty(), toNumber(), minValue(0))

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
const NameSchema = pipe(string(), trim(), nonEmpty(), maxLength(MAX_LEN_STR))

type NameSchema = typeof NameSchema

/**
 * Validate ID
 * @function
 * @summary undefined | integer, > 0
 * @default undefined
 */
const IdSchema = optional(pipe(number(), integer(), gtValue(0)))

type IdSchema = typeof IdSchema

/**
 * Validate title
 * @function
 * @summary Non-empty string, exactly two words, US English locale
 */
const TitleSchema = pipe(string(), trim(), nonEmpty(), words("en-US", 2))

type TitleSchema = typeof TitleSchema

/**
 * Validate string
 * @function
 * @summary Non-empty string
 */
const StringSchema = pipe(string(), trim(), nonEmpty())

type StringSchema = typeof StringSchema

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
  DATE_FORMAT,
  DateSchema,
  IdSchema,
  MAX_LEN_STR,
  MethodSchema,
  NameSchema,
  StringAsBooleanSchema,
  StringSchema,
  TimeoutSchema,
  TitleSchema,
  UrlSchema,
  VersionSchema
}
