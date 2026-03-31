import { render, screen } from "@testing-library/react"
import "vitest-localstorage-mock"

import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"

import Dashboard from "."

beforeAll((): void => {
  localStorage.setItem("soberDate", "2025-10-11")
})

afterAll((): void => {
  localStorage.removeItem("soberDate")
})

beforeEach((): void => {
  render(
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dashboard />
    </LocalizationProvider>
  )
})

describe("Dashboard", (): void => {
  it("should display label", (): void => {
    expect(screen.queryByText("Sober since:"), "Label not found").toBeInTheDocument()
  })

  it("should display date dropdown", async (): Promise<void> => {
    expect(screen.queryByTestId("CalendarIcon"), "Date dropdown not found").toBeInTheDocument()
  })

  it("should display stats", (): void => {
    expect(screen.queryByText(/seconds/), "Stats not found").toBeInTheDocument()
  })

  it("should display settings icon", (): void => {
    expect(screen.queryByTestId("SettingsIcon"), "Settings icon not found").toBeInTheDocument()
  })
})
