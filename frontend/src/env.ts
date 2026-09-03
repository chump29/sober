import { cleanEnv, type ExactValidator, makeExactValidator } from "envalid"
import { default as ms } from "ms"
import { parse } from "valibot"

import { BooleanSchema, StringSchema, TimeoutSchema, TitleSchema, UrlSchema } from "./utils/schemas.ts"

const stringValidator: ExactValidator<string> = makeExactValidator<string>((s: string): string =>
  parse(StringSchema, s)
)
const timeoutValidator: ExactValidator<number> = makeExactValidator<number>((s: string): number =>
  parse(TimeoutSchema, s)
)
const booleanValidator: ExactValidator<boolean> = makeExactValidator<boolean>((s: string): boolean =>
  parse(BooleanSchema, s)
)
const urlValidator: ExactValidator<string> = makeExactValidator<string>((s: string): string => parse(UrlSchema, s))
const titleValidator: ExactValidator<string> = makeExactValidator<string>((s: string): string => parse(TitleSchema, s))

const env = cleanEnv(import.meta.env, {
  SOBER_API_TIMEOUT: timeoutValidator({ default: ms("2s") }),
  SOBER_DEBUG: booleanValidator({ default: false, testDefault: true }),
  SOBER_JWT_AUDIENCE: stringValidator({ default: "sober-backend" }),
  VITE_API_URL: urlValidator({ default: "" }),
  VITE_TITLE: titleValidator({ default: "Sᴏʙᴇᴙ Tᴙᴀᴄᴋᴇᴙ" })
})

export { env }
