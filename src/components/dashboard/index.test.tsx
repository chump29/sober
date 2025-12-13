import { render, screen } from "@testing-library/react"

import Dashboard from "."

beforeEach(() => {
  render(<Dashboard />)
})

describe("Dashboard", () => {
  it("should display label", () => {
    expect(
      screen.queryByText("Sober since:"),
      "Label not found"
    ).toBeInTheDocument()
  })

  it("should display date dropdown", () => {
    expect(
      screen.queryByTestId("date"),
      "Date dropdown not found"
    ).toBeInTheDocument()
  })

  it("should display stats", () => {
    expect(screen.queryByText(/seconds/), "Stats not found").toBeInTheDocument()
  })
})
