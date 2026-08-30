import { bool, cleanEnv, type ExactValidator, makeExactValidator } from "envalid"
import { default as ms } from "ms"
import { parse, pipe, toNumber } from "valibot"

import { StringSchema, TimeoutSchema, TitleSchema, UrlSchema } from "./src/utils/schemas.ts"

const stringValidator: ExactValidator<string> = makeExactValidator<string>((s: string): string =>
  parse(StringSchema, s)
)
const titleValidator: ExactValidator<string> = makeExactValidator<string>((s: string): string => parse(TitleSchema, s))
const timeoutValidator: ExactValidator<number> = makeExactValidator<number>((s: string): number =>
  parse(pipe(StringSchema, toNumber(), TimeoutSchema), s)
)
const urlValidator: ExactValidator<string> = makeExactValidator<string>((s: string): string => parse(UrlSchema, s))

const env = cleanEnv(import.meta.env, {
  VITE_API_TIMEOUT: timeoutValidator({ default: ms("2s") }),
  VITE_API_URL: urlValidator({ default: "", testDefault: "http://localhost:5560" }),
  VITE_AUDIENCE: stringValidator({ default: "sober-backend" }),
  VITE_DEBUG: bool({ default: false, testDefault: true }),
  VITE_TITLE: titleValidator({ default: "Sᴏʙᴇᴙ Tᴙᴀᴄᴋᴇᴙ" })
})

export { env }
