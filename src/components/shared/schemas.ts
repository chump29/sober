import {
  type CheckIssue,
  check,
  nonEmpty,
  pipe,
  string,
  toBoolean,
  transform,
  trim,
  unknown,
} from "valibot"
import { valid } from "semver"


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

export { VersionSchema, BooleanSchema}