import dayjs from "dayjs"
import { valid } from "semver"
import {
  boolean,
  type CheckIssue,
  check,
  isoDate,
  minValue,
  nonEmpty,
  nullish,
  number,
  pipe,
  string,
  toBoolean,
  transform,
  trim,
  unknown
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
    (s: string): boolean => (valid(s) ? true : false),
    (e: CheckIssue<string>): string => `Invalid SemVer: ${e.input}`
  )
)

type VersionSchema = typeof VersionSchema

/**
 * Validate boolean
 * @function
 * @summary valid boolean {@link https://developer.mozilla.org/en-US/docs/Glossary/Truthy value}
 */
const BooleanSchema = pipe(unknown(), toBoolean())

type BooleanSchema = typeof BooleanSchema

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
    check((s: string): boolean => dayjs(s, "YYYY-MM-DD", true).isValid(), "Not a valid date")
  ),
  undefined
)

type DateSchema = typeof DateSchema

/**
 * Validate toggle
 * @function
 * @summary true | false
 */
const ToggleSchema = boolean()

type ToggleSchema = typeof ToggleSchema

/**
 * Validate cost
 * @function
 * @summary positive number
 */
const CostSchema = pipe(
  number(),
  minValue(0),
  transform((n: number): number => (n > 0 ? +n.toFixed(2) : n))
)

type CostSchema = typeof CostSchema

export { BooleanSchema, CostSchema, DateSchema, ToggleSchema, VersionSchema }
