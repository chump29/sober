import { type Nullable } from "@postfmly/types"

import { env } from "../env.ts"
import { FetchError, handleError, validate } from "../utils/index.ts"
import { FetchClientSchema, type IFetchClient } from "../utils/interfaces/IFetchClient.ts"
import { getHeaders } from "../utils/jwt.ts"

// biome-ignore lint/nursery/useExplicitType: inferred
const { SOBER_API_TIMEOUT: API_TIMEOUT, VITE_API_URL: API_URL } = env

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

export { fetchClient }
