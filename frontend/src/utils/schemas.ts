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
  nullable,
  number,
  optional,
  pipe,
  regex,
  string,
  toBoolean,
  transform,
  trim,
  url,
  enum as v_enum,
  words
} from "valibot"

/**
 * Validate against Semantic Versioning Specification
 * @function
 * @summary non-empty string, valid {@link https://semver.org/ SemVer}
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
 * @summary non-empty string, valid boolean {@link https://developer.mozilla.org/en-US/docs/Glossary/Truthy value}
 */
const StringAsBooleanSchema = pipe(string(), trim(), nonEmpty(), toBoolean())

type StringAsBooleanSchema = typeof StringAsBooleanSchema

/**
 * Validate boolean
 * @function
 * @summary valid boolean {@link https://developer.mozilla.org/en-US/docs/Glossary/Truthy value}
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
 * @summary non-empty string, valid {@link https://www.iso.org/iso-8601-date-and-time-format.html ISO 8601} date format
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
 * @summary valid {@link https://datatracker.ietf.org/doc/html/rfc3986 URL}
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
 * @summary null | valid number, must be > 0
 */
const CostSchema = nullable(pipe(number(), gtValue(0)))

type CostSchema = typeof CostSchema

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
 * @summary non-empty string, max length = {@link MAX_LEN_STR}
 */
const NameSchema = pipe(string(), trim(), nonEmpty(), maxLength(MAX_LEN_STR))

type NameSchema = typeof NameSchema

/**
 * Validate ID
 * @function
 * @summary integer, > 0
 */
const IdSchema = optional(pipe(number(), integer(), gtValue(0)))

type IdSchema = typeof IdSchema

/**
 * Validate title
 * @function
 * @summary non-empty string, exactly two words, US English locale
 */
const TitleSchema = pipe(string(), trim(), nonEmpty(), words("en-US", 2))

type TitleSchema = typeof TitleSchema

/**
 * Validate string
 * @function
 * @summary non-empty string
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

export {
  BooleanSchema,
  CostSchema,
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
