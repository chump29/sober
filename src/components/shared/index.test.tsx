import { type Mock } from "vitest"

import { error, info, toComma } from "./index"

describe("toComma", (): void => {
  it("should display comma", (): void => {
    expect(toComma("1000"), "Comma not found").toBe("1,000")
  })
})

const errorSpy: Mock = vi.spyOn(console, "error")
const infoSpy: Mock = vi.spyOn(console, "info")

const TEST: string = "TEST"

describe("error", (): void => {
  it("should not log anything", (): void => {
    error()
    expect(errorSpy, "Tried to write error to console").not.toHaveBeenCalled()
  })

  it("should log an error", (): void => {
    error(TEST)
    expect(errorSpy, "Could not write error to console").toHaveBeenCalledTimes(2)
  })
})

describe("info", (): void => {
  it("should not log anything", (): void => {
    info()
    expect(infoSpy, "Tried to write info to console").not.toHaveBeenCalled()
  })

  it("should log info", (): void => {
    info(TEST)
    expect(infoSpy, "Could not write info to console").toHaveBeenCalledTimes(2)
  })
})
