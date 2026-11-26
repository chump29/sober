// cSpell: ignore SSSZ
import { parse as ms } from "@lukeed/ms"
import { default as dayjs } from "dayjs"
import { default as utc } from "dayjs/plugin/utc"
import { createRegExp, digit, letter, oneOrMore } from "magic-regexp"
import {
  boolean,
  type CheckIssue,
  check,
  date,
  decimal,
  enum_,
  gtValue,
  integer,
  isoTimestamp,
  maxLength,
  maxValue,
  minValue,
  nonEmpty,
  number,
  optional,
  pipe,
  regex,
  string,
  toNumber,
  transform,
  trim,
  union,
  url,
  words
} from "valibot"

import { Endpoint, HttpMethod } from "./index.ts"

dayjs.extend(utc)

/**
 * Validate string
 * @summary Non-empty string
 */
const StringSchema = pipe(string(), trim(), nonEmpty())

type StringSchema = typeof StringSchema

/**
 * Validate boolean
 * @summary Valid boolean {@link https://developer.mozilla.org/en-US/docs/Glossary/Truthy value}
 */
const BooleanSchema = boolean()

type BooleanSchema = typeof BooleanSchema

/**
 * Custom datetime format
 * @summary YYYY-MM-DDTHH:mm:ss.SSSZ
 * @example 2026-08-22T04:20:45.720-05:00
 */
const DATETIME_FORMAT = "YYYY-MM-DDTHH:mm:ss.SSSZ"

/**
 * Validate datetime
 * @summary Non-empty string, valid {@link https://www.iso.org/iso-8601-date-and-time-format.html ISO 8601} datetime format
 * @returns UTC datetime
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
 * @summary YYYY, MMMM Do, YYYY
 * @example Saturday, August 22nd, 2026
 */
const DATETIME_FORMAT_SHORT_OUTPUT = "dddd, MMMM Do, YYYY"

/**
 * Datetime output format
 * @summary YYYY, MMMM Do, YYYY @ h:mm A
 * @example Saturday, August 22nd, 2026 @ 4:20 AM
 */
const DATETIME_FORMAT_OUTPUT = `${DATETIME_FORMAT_SHORT_OUTPUT} @ h:mm A`

/**
 * Datetime short format
 * @summary MM/DD/YY
 * @example 09/22/26
 */
const DATETIME_FORMAT_SHORT = "MM/DD/YY"

/**
 * Datetime milestone format
 * @summary MMM D, YYYY
 * @example Aug 22, 2026
 */
const DATETIME_FORMAT_MILESTONE = "MMM D, YYYY"

/**
 * Validate URL
 * @summary Non-empty string, valid {@link https://datatracker.ietf.org/doc/html/rfc3986 URL}
 */
const UrlSchema = pipe(StringSchema, url())

type UrlSchema = typeof UrlSchema

const MIN_TIMEOUT = ms(".2s")
const MAX_TIMEOUT = ms("60s")

/**
 * Validate API timeout
 * @summary Integer, min value = {@link MIN_TIMEOUT}, max value = {@link MAX_TIMEOUT}, in ms
 */
const TimeoutSchema = pipe(number(), integer(), minValue(MIN_TIMEOUT), maxValue(MAX_TIMEOUT))

type TimeoutSchema = typeof TimeoutSchema

/**
 * Validate cost
 * @summary number, >= 0
 */
const CostSchema = pipe(number(), minValue(0))

type CostSchema = typeof CostSchema

/**
 * Validate cost input
 * @summary Non-empty decimal string, >= 0
 * @returns Number
 */
const CostInputSchema = pipe(StringSchema, decimal(), toNumber(), minValue(0))

type CostInputSchema = typeof CostInputSchema

/**
 * Maximum length
 * @default 64
 */
const MAX_LEN_STR = 64

/**
 * Validate substance name
 * @summary Non-empty string, max length = {@link MAX_LEN_STR}
 */
const NameSchema = pipe(StringSchema, maxLength(MAX_LEN_STR))

type NameSchema = typeof NameSchema

/**
 * Validate ID
 * @summary Optional<number>, > 0
 * @default undefined
 * @returns Integer
 */
const IdSchema = optional(pipe(number(), integer(), gtValue(0)))

type IdSchema = typeof IdSchema

/**
 * Validate title
 * @summary Non-empty string, exactly two words, US English locale
 * @returns Array of two strings
 */
const TitleSchema = pipe(StringSchema, words("en-US", 2))

type TitleSchema = typeof TitleSchema

/**
 * Validate HTTP method
 * @summary Valid HTTP method
 */
const MethodSchema = enum_(HttpMethod)

type MethodSchema = typeof MethodSchema

/** Cost type */
const CostType = {
  Day: 1,
  Month: 3,
  Week: 2,
  Year: 4
} as const

/** Cost type */
type CostType = (typeof CostType)[keyof typeof CostType]

/**
 * Validate CostType
 * @summary Valid {@link CostType}
 */
const CostTypeSchema = enum_(CostType)

type CostTypeSchema = typeof CostTypeSchema

const EXP_MIN_LEN = 1
const EXP_MAX_LEN = 7

/**
 * Validate JWT expiration time
 * @summary Non-empty string | Unix timestamp (seconds) | Date
 * @see {@link https://github.com/panva/jose/blob/main/docs/jwt/sign/classes/SignJWT.md#setexpirationtime setExpirationTime}
 */
const ExpireTimeSchema = union([
  pipe(
    StringSchema,
    regex(
      createRegExp(
        oneOrMore(digit).at.lineStart(),
        letter.lowercase.times.between(EXP_MIN_LEN, EXP_MAX_LEN).at.lineEnd()
      )
    )
  ),
  pipe(number(), integer(), gtValue(dayjs().unix())),
  pipe(date(), minValue(dayjs().toDate()))
])

type ExpireTimeSchema = typeof TitleSchema

/**
 * Validate Endpoint
 * @summary Valid {@link Endpoints}
 */
const EndpointSchema = enum_(Endpoint)

type EndpointSchema = typeof EndpointSchema

export {
  BooleanSchema,
  CostInputSchema,
  CostSchema,
  CostType,
  CostTypeSchema,
  DATETIME_FORMAT,
  DATETIME_FORMAT_MILESTONE,
  DATETIME_FORMAT_OUTPUT,
  DATETIME_FORMAT_SHORT,
  DATETIME_FORMAT_SHORT_OUTPUT,
  DateTimeSchema,
  EndpointSchema,
  ExpireTimeSchema,
  IdSchema,
  MAX_LEN_STR,
  MethodSchema,
  NameSchema,
  StringSchema,
  TimeoutSchema,
  TitleSchema,
  UrlSchema
}
