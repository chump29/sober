import { describe, expect, test } from "bun:test"

import { MantineProvider } from "@mantine/core"

import { render, screen } from "@testing-library/react"

import { Banner } from "../../../src/components/Banner.tsx"
import { Page } from "../../../src/utils/index.ts"

const pages: readonly [Page, string, string][] = [
  [Page.home, "Progress, Not Perfection", "One second, one minute, one hour, one day at a time."],
  [Page.milestones, "Progress, a Celebration", "Every milestone is a reminder of how far you've come."],
  [Page.settings, "Progress, Your Way", "Make this space your own."],
  [Page.stats, "Progress, by the Numbers", "See how far you've come and what you've accomplished."]
]

const reBanner = /\/banners\/banner(?:[1-9]|10)\.webp/u

// biome-ignore lint/nursery/useLowercaseTestTitle: component name
describe("Banner", (): void => {
  test.each(pages)("renders for %s", (page: Page, title: string, subtitle: string): void => {
    render(<Banner page={page} />, { wrapper: MantineProvider })

    expect(screen.getByRole("heading", { name: title })).toBeInTheDocument()
    expect(screen.getByText(subtitle)).toBeInTheDocument()

    const banner = screen.getByTestId("banner")
    expect(banner).toHaveStyle({
      backgroundImage: expect.stringMatching(reBanner)
    })
  })
})
