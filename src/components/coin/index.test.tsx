import { render, screen } from "@testing-library/react"

import Coin from "."

beforeEach((): void => {
  render(<Coin months={18} showCoin={true} years={1} />)
})

describe("Coin", (): void => {
  it("should display coin", () => {
    expect(screen.queryByAltText("18 months"), "Image not found").toBeInTheDocument()
  })
})
