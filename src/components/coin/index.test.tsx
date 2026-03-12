import { render, screen } from "@testing-library/react"

import Coin from "."

beforeEach(() => {
  render(<Coin months={18} showCoin={true} years={1} />)
})

describe("Coin", () => {
  it("should display image", () => {
    expect(screen.queryByAltText("18 months"), "Image not found").toBeInTheDocument()
  })
})
