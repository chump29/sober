import { defineEnv } from "envin"
import { fallback } from "valibot"

import { StringAsBooleanSchema, StringSchema, TimeoutSchema, TitleSchema, UrlSchema } from "./src/utils/schemas.ts"

export default defineEnv({
  env: import.meta.env,
  client: {
    VITE_AUDIENCE: fallback(StringSchema, "")
  },
  server: {
    VITE_TITLE: fallback(TitleSchema, "")
  },
  shared: {
    VITE_API_TIMEOUT: TimeoutSchema,
    VITE_API_URL: UrlSchema,
    VITE_DEBUG: fallback(StringAsBooleanSchema, false)
  }
})
