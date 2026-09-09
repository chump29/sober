import { bool, cleanEnv, type ExactValidator, makeExactValidator } from "envalid"
import { default as ms } from "ms"
import { parse } from "valibot"

import { ExpireTimeSchema, StringSchema, TimeoutSchema, TitleSchema, UrlSchema } from "./utils/schemas.ts"

const timeoutValidator: ExactValidator<number> = makeExactValidator<number>((s: string): number =>
  parse(TimeoutSchema, s)
)
const stringValidator: ExactValidator<string> = makeExactValidator<string>((s: string): string =>
  parse(StringSchema, s)
)
const expireTimeValidator: ExactValidator<string | number | Date> = makeExactValidator<string | number | Date>(
  (s: string): string | number | Date => parse(ExpireTimeSchema, s)
)
const urlValidator: ExactValidator<string> = makeExactValidator<string>((s: string): string => parse(UrlSchema, s))
const titleValidator: ExactValidator<string> = makeExactValidator<string>((s: string): string => parse(TitleSchema, s))

const env = cleanEnv(import.meta.env, {
  SOBER_API_TIMEOUT: timeoutValidator({ default: ms("2s") }),
  SOBER_DEBUG: bool({ default: false }),
  SOBER_JWT_AUDIENCE: stringValidator({ default: "sober-backend" }),
  SOBER_JWT_EXPIRE_TIME: expireTimeValidator({ default: "30s" }),
  VITE_API_URL: urlValidator({ default: "" }),
  VITE_TITLE: titleValidator({ default: "Sᴏʙᴇᴙ Tᴙᴀᴄᴋᴇᴙ" })
})

type IEnv = typeof env

export { env, type IEnv }
