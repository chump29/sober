import { UnsecuredJWT } from "jose"

const getJWT = (user: string): string =>
  new UnsecuredJWT().setExpirationTime("30s").setIssuedAt().setSubject(user).encode()

/**
 * Get request headers
 * @function
 * @summary Includes unsecured JWT
 * @param {string} user User
 * @returns {Headers} Request {@link https://developer.mozilla.org/en-US/docs/Web/API/Headers headers}
 */
const getHeaders = (user: string | undefined): Headers | undefined => {
  if (!user || user.length === 0) {
    return
  }

  return new Headers({
    Authorization: `Bearer ${getJWT(user)}`,
    "Content-Type": "application/json"
  } satisfies HeadersInit)
}

export { getHeaders }
