import { describe, expect, test } from "bun:test"

import { MantineProvider } from "@mantine/core"

import { render, screen } from "@testing-library/react"

import { Logo } from "../../../src/components/Logo.tsx"
import { env } from "../../../src/env.ts"

// biome-ignore lint/nursery/useLowercaseTestTitle: component name
describe("Logo", (): void => {
  test("displays logo and title", (): void => {
    const [firstWord, secondWord] = env.TITLE.split(" ", 2)

    render(<Logo />, { wrapper: MantineProvider })

    expect(screen.getByRole("img")).toHaveAttribute("src", "/sober.webp")

    if (!(firstWord && secondWord)) {
      throw new Error("Invalid title")
    }

    expect(screen.getByText(firstWord)).toBeInTheDocument()
    expect(screen.getByText(secondWord)).toBeInTheDocument()
  })
})
