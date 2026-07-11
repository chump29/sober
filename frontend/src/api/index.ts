import { default as httpMethods } from "http-methods-constants"
import { default as ms } from "ms"

import { FetchError, handleError, validate } from "../utils/index.ts"
import { FetchClientSchema, type IFetchClient } from "../utils/interfaces/IFetchClient.ts"
import { getHeaders } from "../utils/jwt.ts"
import { TimeoutSchema, UrlSchema } from "../utils/schemas.ts"

const API_URL: string = validate<string, UrlSchema>(import.meta.env.VITE_API_URL, UrlSchema) ?? ""
const API_TIMEOUT: number =
  validate<string, TimeoutSchema, number>(import.meta.env.VITE_API_TIMEOUT, TimeoutSchema) ?? ms("2s")

const fetchClient = async <R>(settings: IFetchClient): Promise<R | null> => {
  const s: IFetchClient | null = validate<IFetchClient, FetchClientSchema>(settings, FetchClientSchema)
  if (!s) {
    handleError("Invalid fetch settings")
    return null
  }

  const config: RequestInit = {
    body: JSON.stringify(s.body),
    headers: getHeaders(s.user),
    method: s.method,
    signal: AbortSignal.timeout(API_TIMEOUT)
  } satisfies RequestInit

  let endpoint: string = `${API_URL}/`
  if (s.endpoint !== "version") {
    endpoint += "api/"
  }
  endpoint += s.endpoint

  return await fetch(endpoint, config)
    .then(async (response: Response): Promise<R | null> => {
      if (!response.ok) {
        throw new FetchError(response)
      }

      if (s.method === httpMethods.HEAD) {
        return false as R // apiUnavailable
      }

      return await response.json()
    })
    .then((data: R | null): R | null => {
      if (data === null) {
        return null
      }

      return data as R
    })
    .catch((e: Error): null => {
      handleError(e)

      return null
    })
}

export { API_TIMEOUT, API_URL, fetchClient }
