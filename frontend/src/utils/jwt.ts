import { type Optional } from "@postfmly/types"

import { UnsecuredJWT } from "jose"

import { env } from "../../env.ts"
import { name } from "../../package.json" with { type: "json" }

// biome-ignore lint/nursery/useExplicitType: inferred
const { VITE_AUDIENCE } = env

const getJWT = (user: string): string =>
  new UnsecuredJWT()
    .setExpirationTime("30s")
    .setIssuedAt()
    .setSubject(user)
    .setIssuer(name)
    .setAudience(VITE_AUDIENCE)
    .encode()

/**
 * Get request headers
 * @function
 * @summary Includes unsecured JWT
 * @param {string} user User
 * @returns {Headers} Request {@link https://developer.mozilla.org/en-US/docs/Web/API/Headers headers}
 */
const getHeaders = (user: Optional<string>): Optional<Headers> => {
  if (!user || user.length === 0) {
    return
  }

  return new Headers({
    Authorization: `Bearer ${getJWT(user)}`,
    "Content-Type": "application/json"
  } satisfies HeadersInit)
}

export { getHeaders }
