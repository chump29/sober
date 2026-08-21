import { UnsecuredJWT } from "jose"

import { default as env } from "../../env.config.ts"
import { name } from "../../package.json" with { type: "json" }
import { type Optional } from "./index.ts"

const getJWT = (user: string): string =>
  new UnsecuredJWT()
    .setExpirationTime("30s")
    .setIssuedAt()
    .setSubject(user)
    .setIssuer(name)
    .setAudience(env.VITE_AUDIENCE)
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
