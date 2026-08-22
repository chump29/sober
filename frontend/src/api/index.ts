import { type Nullable, type Optional } from "@postfmly/types"

import { default as ms } from "ms"

import { default as env } from "../../env.config.ts"
import { FetchError, handleError, validate } from "../utils/index.ts"
import { FetchClientSchema, type IFetchClient } from "../utils/interfaces/IFetchClient.ts"
import { getHeaders } from "../utils/jwt.ts"
import { TimeoutSchema, UrlSchema } from "../utils/schemas.ts"

const API_URL: string = validate<string, UrlSchema>(env.VITE_API_URL, UrlSchema) as string
const API_TIMEOUT: number = validate<Optional<number>, TimeoutSchema>(env.VITE_API_TIMEOUT, TimeoutSchema) ?? ms("2s")

const fetchClient = async <R = null>(settings: IFetchClient): Promise<Nullable<R>> => {
  const s: Nullable<IFetchClient> = validate<IFetchClient, FetchClientSchema>(settings, FetchClientSchema)
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
    .then(async (response: Response): Promise<Nullable<R>> => {
      if (!response.ok) {
        throw new FetchError(response)
      }

      const text: string = await response.text()
      return text.length > 0 ? JSON.parse(text) : null
    })
    .then((data: Nullable<R>): Nullable<R> => {
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
