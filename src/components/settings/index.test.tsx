import { render, screen } from "@testing-library/react"

import Settings from "."

beforeEach((): void => {
  render(
    <Settings
      cost={0}
      handleShowSettings={vi.fn()}
      setCost={vi.fn()}
      setShowCoin={vi.fn()}
      setShowCost={vi.fn()}
      showCoin={false}
      showCost={true}
    />
  )
})

describe("Settings", (): void => {
  it("should display settings", (): void => {
    expect(screen.queryByText("Settings"), "Settings not found").toBeInTheDocument()
  })

  it("should display a button for Show AA Coin", (): void => {
    expect(screen.queryByTestId("showCoin"), "Show AA Coin button not found").toBeInTheDocument()
  })

  it("should display a button for Show Cost", (): void => {
    expect(screen.queryByTestId("showCost"), "Show Cost button not found").toBeInTheDocument()
  })

  it("should display a text field for Weekly Cost", async (): Promise<void> => {
    expect(screen.queryByTestId("cost"), "Weekly Cost text field not found").toBeInTheDocument()
  })
})
