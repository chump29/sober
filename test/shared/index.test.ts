import { describe, expect, test } from "bun:test"

import { fakerEN_US as fake } from "@faker-js/faker"

import { findElement, getVersion } from "../../src/components/shared/index.tsx"

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
})
