import { render, screen } from "@testing-library/react"

import Coin from "."

beforeEach(() => {
  render(<Coin months={18} years={1} />)
})

describe("Dashboard", () => {
  it("should display image", () => {
    expect(
      screen.queryByAltText("18 months"),
      "Image not found"
    ).toBeInTheDocument()
  })
})
