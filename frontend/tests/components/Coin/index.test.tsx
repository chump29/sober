import { describe, expect, jest, mock, test } from "bun:test"

import { MantineProvider } from "@mantine/core"
import { ModalsProvider } from "@mantine/modals"

import { configure, type RenderResult, render, screen } from "@testing-library/react"
import { default as ms } from "ms"

import { Coin } from "../../../src/components/Coin/index.tsx"
import { getMonthAndYear } from "../../utils/Helpers.ts"

configure({
  asyncUtilTimeout: ms("3s")
})

mock.module("@mantine/hooks", (): unknown => ({
  useReducedMotion: () => true
}))

const renderCoin = (m: number, y: number): RenderResult =>
  render(
    <MantineProvider>
      <ModalsProvider>
        <Coin closeCoin={jest.fn()} m={m} openedCoin={true} y={y} />
      </ModalsProvider>
    </MantineProvider>
  )

describe("Coin - index", (): void => {
  test("txt", async (): Promise<void> => {
    const { m, y } = getMonthAndYear()
    renderCoin(m, y)

    const txt: HTMLParagraphElement = await screen.findByTestId("txt")

    expect(txt).toBeInTheDocument()
    expect(txt.textContent.length).toBeGreaterThan(0)
  })

  test("img", async (): Promise<void> => {
    const { m, y } = getMonthAndYear()
    renderCoin(m, y)

    const img: HTMLImageElement = await screen.findByTestId("img")

    expect(img).toBeInTheDocument()
  })

  test("romanNumerals", async (): Promise<void> => {
    const { m, y } = getMonthAndYear()
    renderCoin(m, y)

    const romanNumerals: HTMLParagraphElement = await screen.findByTestId("romanNumerals")

    expect(romanNumerals).toBeInTheDocument()
    expect(romanNumerals.textContent.length).toBeGreaterThan(0)
  })

  test("txt - all 0", async (): Promise<void> => {
    renderCoin(0, 0)

    const txt: HTMLParagraphElement = await screen.findByTestId("txt")

    expect(txt.textContent).toBe("No milestones to show yet.")
  })
})
