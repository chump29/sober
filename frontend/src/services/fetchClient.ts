import { type Nullable } from "@postfmly/types"

import { type GenericSchema, type InferOutput } from "valibot"

import { env } from "../env.ts"
import { Endpoint, FetchError, HttpStatus, handleError, validate } from "../utils/index.ts"
import { FetchClientSettingsSchema, type IFetchClientSettings } from "../utils/interfaces/IFetchClientSettings.ts"
import { getHeaders } from "../utils/jwt.ts"

/**
 * Fetch data from URL
 * @param settings @see {@link IFetchClientSettings}
 * @param schema Validation schema (defines output type)
 * @returns Validated data or null
 */
export const fetchClient = async <S extends GenericSchema>(
  settings: IFetchClientSettings,
  schema?: S
): Promise<Nullable<InferOutput<S>>> => {
  const s = validate(settings, FetchClientSettingsSchema)
  if (!s) {
    handleError("Invalid fetch settings")

    return null
  }

  const config: RequestInit = {
    body: JSON.stringify(s.body),
    headers: getHeaders(s.user),
    method: s.method,
    signal: AbortSignal.timeout(env.API_TIMEOUT)
  }

  let endpoint = `${env.API_URL}/`
  if (s.endpoint !== Endpoint.Version) {
    endpoint += "api/"
  }
  endpoint += s.endpoint
  if (s.id !== undefined) {
    endpoint += `/${s.id}`
  }

  try {
    const response = await fetch(endpoint, config)
    if (!response.ok) {
      throw new FetchError(response)
    }

    if (response.status === HttpStatus.NoContent || !schema) {
      return null
    }

    const text = (await response.text()).trim()

    if (settings.endpoint === Endpoint.User) {
      return response.status === HttpStatus.Created
    }

    if (text.length === 0) {
      return null
    }

    return validate(JSON.parse(text), schema)
  } catch (e: unknown) {
    handleError(e)

    return null
  }
}
