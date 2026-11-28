import { type JSX } from "react"

import { Paper, Stack, Text, Title } from "@mantine/core"

import { Page } from "../utils/index.ts"
import { type IBannerProps } from "../utils/interfaces/IBannerProps.ts"

// * NOTE: from https://unsplash.com/
const banners = Array.from(
  {
    length: 10 // ! TODO: increase
  },
  (_, i): string => `banner${i + 1}`
)
const banner: string = banners[Math.floor(Math.random() * banners.length)] ?? "banner1"

const quotes: Record<Page, [string, string]> = {
  home: ["Progress, Not Perfection", "One second, one minute, one hour, one day at a time."],
  milestones: ["Progress, a Celebration", "Every milestone is a reminder of how far you've come."],
  settings: ["Progress, Your Way", "Make this space your own."],
  stats: ["Progress, by the Numbers", "See how far you've come and what you've accomplished."]
}

export const Banner = ({ page }: IBannerProps): JSX.Element => {
  const [title, subtitle] = quotes[page] ?? quotes[Page.Home]

  return (
    <Paper
      bgp="center"
      bgsz="cover"
      data-testid="banner"
      mih={145}
      p={{
        base: "lg",
        md: "xl"
      }}
      pos="relative"
      style={{
        backgroundImage: `var(--gradient-quote), url(/banners/${banner}.webp)`,
        overflow: "hidden"
      }}>
      <Stack h="100%" justify="center">
        <Title c="var(--text-primary)" size="clamp(1.5rem, 3vw, 2rem)">
          {title}
        </Title>
        <Text c="var(--text-secondary)" size="sm">
          {subtitle}
        </Text>
      </Stack>
    </Paper>
  )
}
