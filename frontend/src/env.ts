import { bool, cleanEnv, type ExactValidator, makeExactValidator, str, url } from "envalid"
import { default as ms } from "ms"
import { parse } from "valibot"

import { ExpireTimeSchema, TimeoutSchema, TitleSchema } from "./utils/schemas.ts"

const timeoutValidator: ExactValidator<number> = makeExactValidator<number>((s: string): number =>
  parse(TimeoutSchema, s)
)
const expireTimeValidator: ExactValidator<string | number | Date> = makeExactValidator<string | number | Date>(
  (s: string): string | number | Date => parse(ExpireTimeSchema, s)
)
const titleValidator: ExactValidator<string> = makeExactValidator<string>((s: string): string => parse(TitleSchema, s))

const env = cleanEnv(import.meta.env, {
  SOBER_API_TIMEOUT: timeoutValidator({ default: ms("2s") }),
  SOBER_DEBUG: bool({ default: false }),
  SOBER_JWT_AUDIENCE: str({ default: "sober-backend" }),
  SOBER_JWT_EXPIRE_TIME: expireTimeValidator({ default: "30s" }),
  VITE_API_URL: url({ default: "" }),
  VITE_TITLE: titleValidator({ default: "Sᴏʙᴇᴙ Tᴙᴀᴄᴋᴇᴙ" })
})

export { env }
