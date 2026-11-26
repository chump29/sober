import { describe, expect, mock, test } from "bun:test"

import { createTheme, MantineProvider, Modal } from "@mantine/core"

import { fireEvent, render, screen } from "@testing-library/react"

import { Coin } from "../../../src/components/Coin.tsx"
import { type ICoinProps } from "../../../src/utils/interfaces/ICoinProps.ts"

const theme = createTheme({
  components: {
    Modal: Modal.extend({
      defaultProps: {
        transitionProps: {
          duration: 0
        }
      }
    })
  }
})

const renderCoin = (overrides: Partial<ICoinProps> = {}): void => {
  const props = {
    closeCoin: mock((): void => undefined),
    months: 0,
    openCoin: mock((): void => undefined),
    openedCoin: false,
    years: 0,
    ...overrides
  }

  render(
    <MantineProvider theme={theme}>
      <Coin {...props} />
    </MantineProvider>
  )
}

const reShowCoin = /show aa coin/iu

// biome-ignore lint/nursery/useLowercaseTestTitle: component name
describe("Coin", (): void => {
  test("displays button and calls openCoin when clicked", (): void => {
    const openCoin = mock((): void => undefined)

    renderCoin({ openCoin })

    expect(screen.queryByText("AA Milestone Coin")).not.toBeInTheDocument()

    const openButton = screen.getByRole("button", { name: reShowCoin })

    fireEvent.click(openButton)

    expect(openCoin).toHaveBeenCalledTimes(1)
  })

  const ONE_MONTH = 1
  const SIX_MONTHS = 6
  const ONE_YEAR = 1
  const LONGEST = 3888
  const ERROR = 4000

  test.each<[string, number, number, string, string]>([
    ["one month", ONE_MONTH, 0, "1 Month", "I"],
    ["six months", SIX_MONTHS, 0, "6 Months", "VI"],
    ["one year", 0, ONE_YEAR, "1 Year", "I"],
    ["longest", 0, LONGEST, "3,888 Years", "MMMDCCCLXXXVIII"], // cSpell: ignore MMMDCCCLXXXVIII
    ["invalid (> 3999)", 0, ERROR, "4,000 Years", ""]
  ])(
    "displays coin for %s",
    // biome-ignore lint/complexity/useMaxParams: using five parameters
    (_case: string, months: number, years: number, expectedLabel: string, expectedNumeral: string): void => {
      renderCoin({ months, openedCoin: true, years })

      expect(screen.getByText("AA Milestone Coin")).toBeInTheDocument()
      expect(screen.getByText(expectedLabel)).toBeInTheDocument()

      const recovery = screen.getByText("RECOVERY")
      expect(recovery).toBeInTheDocument()

      if (expectedNumeral.length === 0) {
        // biome-ignore lint/suspicious/noConditionalExpect: verify error
        expect(recovery.previousElementSibling).toHaveTextContent("")

        return
      }

      expect(screen.getByText(expectedNumeral)).toBeInTheDocument()
    }
  )

  test("calls closeCoin", (): void => {
    const closeCoin = mock((): void => undefined)

    renderCoin({ closeCoin, openedCoin: true })

    const close = screen.getByTestId("close")

    fireEvent.click(close)

    expect(closeCoin).toHaveBeenCalledTimes(1)
  })
})
