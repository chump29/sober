import { type Nullable } from "@postfmly/types"

import { type GenericSchema, type InferOutput } from "valibot"

import { env } from "../env.ts"
import { Endpoint, FetchError, HttpMethod, HttpStatus, handleError, validate } from "../utils/index.ts"
import { FetchClientSettingsSchema, type IFetchClientSettings } from "../utils/interfaces/IFetchClientSettings.ts"
import { getHeaders } from "../utils/jwt.ts"

const slashRegex = /\/+$/u

/**
 * Fetch data from URL
 * @param settings @see {@link IFetchClientSettings}
 * @returns null
 */
export function fetchClient(settings: IFetchClientSettings): Promise<null>

/**
 * Fetch data from URL
 * @param settings @see {@link IFetchClientSettings}
 * @param schema Validation schema (defines output type)
 * @returns Validated data or null
 */
export function fetchClient<S extends GenericSchema>(
  settings: IFetchClientSettings,
  schema: S
): Promise<Nullable<InferOutput<S>>>

export async function fetchClient<S extends GenericSchema>(
  settings: IFetchClientSettings,
  schema?: S
): Promise<Nullable<InferOutput<S>>> {
  const s = validate(settings, FetchClientSettingsSchema)
  if (!s) {
    return null
  }

  const body =
    s.method === HttpMethod.GET || s.body === undefined || s.body === null ? undefined : JSON.stringify(s.body)

  const config: RequestInit = {
    ...(body !== undefined && { body }),
    headers: getHeaders(s.user),
    method: s.method,
    signal: AbortSignal.timeout(env.API_TIMEOUT)
  }

  let endpoint = `${env.API_URL.replace(slashRegex, "")}/`
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

    if (s.endpoint === Endpoint.User) {
      return validate(response.status === HttpStatus.Created, schema)
    }

    const text = (await response.text()).trim()
    if (text.length === 0) {
      return null
    }

    return validate(JSON.parse(text), schema)
  } catch (e: unknown) {
    handleError(e)

    return null
  }
}
