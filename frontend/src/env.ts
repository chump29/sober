import { error, printVars } from "@postfmly/logger"

import { parse as ms } from "@lukeed/ms"
import { bool, cleanEnv, makeExactValidator, str, url } from "envalid"
import { type InferOutput, parse } from "valibot"

import { ExpireTimeSchema, TimeoutSchema } from "./utils/schemas.ts"

type ExpireTime = InferOutput<typeof ExpireTimeSchema>

const timeoutValidator = makeExactValidator((s: string): number => parse(TimeoutSchema, Number(s)))
const expireTimeValidator = makeExactValidator((s: string): ExpireTime => parse(ExpireTimeSchema, s))

const originalEnv = cleanEnv(import.meta.env, {
  API_TIMEOUT: timeoutValidator({ default: ms("2s") }),
  JWT_AUDIENCE: str({ default: "sober-backend" }),
  JWT_EXPIRE_TIME: expireTimeValidator({ default: "30s" }),
  TEST_FULL: bool({ default: false }),
  VITE_API_URL: url({ default: "" }),
  VITE_DEBUG: bool({ default: false, testDefault: true }),
  VITE_TITLE: str({ default: "Sᴏʙᴇᴙ Tᴙᴀᴄᴋᴇᴙ" })
})

type OriginalEnv = typeof originalEnv
type Env = Omit<OriginalEnv, "VITE_API_URL" | "VITE_DEBUG" | "VITE_TITLE"> & {
  readonly API_URL: string
  readonly DEBUG: boolean
  readonly TITLE: string
}

const { VITE_API_URL, VITE_DEBUG, VITE_TITLE, ...original }: OriginalEnv = originalEnv

const env: Env = Object.freeze({
  ...original,
  API_URL: VITE_API_URL,
  DEBUG: VITE_DEBUG,
  TITLE: VITE_TITLE
})

if (import.meta.main) {
  printVars(env).catch(error)
}

export { env }
