import { describe, expect, spyOn, test } from "bun:test"

import { fakerEN_US as fake } from "@faker-js/faker"
import { expectTypeOf } from "expect-type"
import { ValiError } from "valibot"

import { DEBUG, FetchError, findElement, getVersion, handleError, UpdateType, validate } from "../../src/utils/index.ts"
import { StringSchema } from "../../src/utils/schemas.ts"

describe("index", (): void => {
  test("findElement", (): void => {
    document.body.innerHTML = '<div id="test">TEST</div>'

    const div: HTMLElement | null = findElement("#test")

    expect(div).not.toBeNull()
    expect(div?.textContent).toBe("TEST")
  })

  test("findElement - fail", (): void => {
    expect(findElement("#nop")).toBeNull()
  })

  test("getVersion", (): void => {
    const version: string = fake.system.semver()

    expect(getVersion(version)).toBe(`v${version}`)
  })

  test("getVersion - fail", (): void => {
    expect(getVersion(undefined)).toBe("N/A")
  })

  test("FetchError", (): void => {
    expect(() => new FetchError(new Response())).toThrowError(FetchError)
  })

  test("handleError - valibot", (): void => {
    // biome-ignore lint/suspicious/noEmptyBlockStatements: silence console.error()
    const error = spyOn(console, "error").mockImplementation(() => {})

    handleError(
      new ValiError([
        {
          expected: "test",
          input: "test",
          kind: "validation",
          message: "test",
          received: "test",
          type: "test"
        }
      ])
    )

    expect(error).toHaveBeenCalled()
  })

  test("handleError - timeout", (): void => {
    // biome-ignore lint/suspicious/noEmptyBlockStatements: silence console.error()
    const error = spyOn(console, "error").mockImplementation(() => {})

    handleError(new DOMException("", "TimeoutError"))

    expect(error).toHaveBeenCalled()
  })

  test("handleError - error", (): void => {
    // biome-ignore lint/suspicious/noEmptyBlockStatements: silence console.error()
    const error = spyOn(console, "error").mockImplementation(() => {})

    handleError("test")

    expect(error).toHaveBeenCalled()
  })

  test("validate", (): void => {
    const s: string | null = validate<string, StringSchema>("test", StringSchema)

    expect(s).not.toBeNull()
    expect(s).toBe("test")
  })

  test("validate - array", (): void => {
    const arr: string[] = [
      "test"
    ]

    const s: string[] | null = validate<string[], StringSchema>(arr, StringSchema)

    expect(s).not.toBeNull()
    expect(s).toEqual(arr)
  })

  test("validate - null", (): void => {
    const s: string | null = validate<string, StringSchema>(null, StringSchema)

    expect(s).toBeNull()
  })

  test("validate - fail", (): void => {
    const s: string | null = validate<string, StringSchema>(" ", StringSchema)

    expect(s).toBeNull()
  })

  test("UpdateType", (): void => {
    expectTypeOf(fake.helpers.objectValue(UpdateType)).toEqualTypeOf<UpdateType>()
  })

  test("DEBUG", (): void => {
    expect(DEBUG).toBeTrue() // * NOTE: set in .env.test
  })
})
