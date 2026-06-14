import dayjs from "dayjs"
import { valid } from "semver"
import {
  boolean,
  type CheckIssue,
  check,
  gtValue,
  isoDate,
  nonEmpty,
  nullish,
  number,
  optional,
  pipe,
  string,
  toBoolean,
  transform,
  trim
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
const StringAsBooleanSchema = pipe(string(), nonEmpty(), toBoolean())

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
 * @constant
 * @summary YYYY-MM-DD
 * @type {string}
 * @example 2026-06-13
 */
const DATE_FORMAT: string = "YYYY-MM-DD"

/**
 * Validate date
 * @function
 * @summary undefined | null | non-empty string, valid {@link https://www.iso.org/iso-8601-date-and-time-format.html ISO 8601} date
 * @default undefined
 */
const DateSchema = nullish(
  pipe(
    string(),
    trim(),
    isoDate("Not a valid ISO 8601 date format"),
    check((s: string): boolean => dayjs(s, DATE_FORMAT, true).isValid(), "Not a valid date")
  ),
  undefined
)

type DateSchema = typeof DateSchema

/**
 * Validate cost
 * @function
 * @summary undefined | number, must be greater than 0
 * @default undefined
 */
const CostSchema = optional(pipe(number(), gtValue(0)))

type CostSchema = typeof CostSchema

/**
 * Validate title
 * @function
 * @summary non-empty string
 */
const TitleSchema = pipe(string(), nonEmpty())

type TitleSchema = typeof TitleSchema

export { BooleanSchema, CostSchema, DATE_FORMAT, DateSchema, StringAsBooleanSchema, TitleSchema, VersionSchema }
