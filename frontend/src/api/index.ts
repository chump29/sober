import { type Nullable } from "@postfmly/types"

import { default as httpStatus } from "http-status-codes"

import { env, type IEnv } from "../env.ts"
import { FetchError, handleError, validate } from "../utils/index.ts"
import { FetchClientSchema, type IFetchClient } from "../utils/interfaces/IFetchClient.ts"
import { getHeaders } from "../utils/jwt.ts"

const { SOBER_API_TIMEOUT: API_TIMEOUT, VITE_API_URL: API_URL }: IEnv = env

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

  try {
    const response: Response = await fetch(endpoint, config)
    if (!response.ok) {
      throw new FetchError(response)
    }

    if (response.status === httpStatus.NO_CONTENT) {
      return null
    }

    const text: string = (await response.text()).trim()

    return text.length > 0 ? (JSON.parse(text) as R) : null
  } catch (e: unknown) {
    handleError(e)

    return null
  }
}

export { fetchClient }
