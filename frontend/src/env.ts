import { bool, cleanEnv, type ExactValidator, makeExactValidator } from "envalid"
import { default as ms } from "ms"
import { parse, pipe, toNumber } from "valibot"

import { StringSchema, TimeoutSchema, TitleSchema, UrlSchema } from "./utils/schemas.ts"

const stringValidator: ExactValidator<string> = makeExactValidator<string>((s: string): string =>
  parse(StringSchema, s)
)
const titleValidator: ExactValidator<string> = makeExactValidator<string>((s: string): string => parse(TitleSchema, s))
const timeoutValidator: ExactValidator<number> = makeExactValidator<number>((s: string): number =>
  parse(pipe(StringSchema, toNumber(), TimeoutSchema), s)
)
const urlValidator: ExactValidator<string> = makeExactValidator<string>((s: string): string => parse(UrlSchema, s))

const env = cleanEnv(import.meta.env, {
  SOBER_API_TIMEOUT: timeoutValidator({ default: ms("2s") }),
  SOBER_API_URL: urlValidator({ default: "http://localhost:5560" }),
  SOBER_DEBUG: bool({ default: false, testDefault: true }),
  SOBER_JWT_AUDIENCE: stringValidator({ default: "sober-backend" }),
  VITE_TITLE: titleValidator({ default: "Sᴏʙᴇᴙ Tᴙᴀᴄᴋᴇᴙ" })
})

export { env }
