import { render, screen } from "@testing-library/react"

import Cost from "."

beforeEach((): void => {
  render(<Cost cost={14} days={10} showCost={true} />)
})

describe("Cost", (): void => {
  it("should display cost", (): void => {
    expect(screen.queryByText("$20.00"), "Cost not found").toBeInTheDocument()
  })
})
