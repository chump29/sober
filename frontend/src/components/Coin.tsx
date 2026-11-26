import { type JSX, memo } from "react"

import { IconCoins, IconX } from "@tabler/icons-react"

import { Box, Button, Group, Modal, Stack, Text, Tooltip } from "@mantine/core"

import { default as pluralize } from "@jarrodek/pluralize"
import { default as dayjs } from "dayjs"
import { default as duration } from "dayjs/plugin/duration"
import { default as romans } from "romans"

import { type ICoinProps } from "../utils/interfaces/ICoinProps.ts"

dayjs.extend(duration)

const AACoin = ({ numeral }: { numeral: string }): JSX.Element => (
  <Box
    bg="var(--gradient-coin)"
    h={260}
    mx="auto"
    pos="relative"
    style={{
      border: "5px solid var(--border-coin)",
      borderRadius: "50%",
      boxShadow: "var(--shadow-coin)"
    }}
    w={260}>
    <Box
      bg="var(--gradient-coin-burst)"
      inset={10}
      pos="absolute"
      style={{
        border: "2px solid var(--border-coin-burst)",
        borderRadius: "50%"
      }}
    />
    <Box
      inset={27}
      pos="absolute"
      style={{
        border: "2px solid var(--border-coin-ring)",
        borderRadius: "50%",
        boxShadow: "var(--shadow-coin-ring)"
      }}
    />
    <svg aria-labelledby="branchesTitle" height="100%" role="img" viewBox="0 0 260 260" width="100%">
      <title>Branches</title>
      <defs>
        <linearGradient id="a" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#fff4c5" />
          <stop offset="45%" stopColor="#c18b32" />
          <stop offset="100%" stopColor="#76501d" />
        </linearGradient>
        <g id="b">
          <path d="M0 0c-8-5-13-19 0-27C13-19 8-5 0 0Z" fill="url(#a)" stroke="#946a28" strokeWidth="1" />
          <path d="M0-2v-22" opacity=".8" stroke="#f9e4a6" strokeWidth=".8" />
        </g>
      </defs>
      <path d="M105 190c-33-25-48-75-9-111" fill="none" stroke="url(#a)" strokeLinecap="round" strokeWidth="3" />
      <path d="M155 190c33-25 48-75 9-111" fill="none" stroke="url(#a)" strokeLinecap="round" strokeWidth="3" />
      <use href="#b" transform="rotate(-55 207.823 -2.905)" />
      <use href="#b" transform="rotate(-65 153.087 12.567)" />
      <use href="#b" transform="rotate(-75 113.845 14.887)" />
      <use href="#b" transform="rotate(255 74.832 18.842)" />
      <use href="#b" transform="rotate(230 63.22 16.783)" />
      <use href="#b" transform="rotate(55 -77.823 246.823)" />
      <use href="#b" transform="rotate(65 -23.087 216.626)" />
      <use href="#b" transform="rotate(75 16.155 184.306)" />
      <use href="#b" transform="rotate(105 55.168 118.594)" />
      <use href="#b" transform="rotate(130 66.78 77.403)" />
      <path d="m130 187 5 8-5 7-5-7Z" fill="url(#a)" stroke="#946a28" strokeWidth="1" />
    </svg>
    <Box
      left="50%"
      pos="absolute"
      style={{
        textShadow: "var(--shadow-coin-branches)",
        transform: "translate(-50%, -50%)",
        zIndex: 2
      }}
      ta="center"
      top="50%">
      <Text
        c="var(--text-coin)"
        fw={900}
        fz={48}
        style={{
          fontFamily: "Georgia, serif",
          letterSpacing: 2,
          textShadow: "var(--shadow-coin-text)"
        }}>
        {numeral}
      </Text>
      <Text c="var(--text-coin-title)" fw={800} fz={9} style={{ letterSpacing: 2 }}>
        RECOVERY
      </Text>
    </Box>
  </Box>
)

export const Coin = memo(({ closeCoin, months, openCoin, openedCoin, years }: ICoinProps): JSX.Element => {
  const { label, value } =
    years > 0
      ? { label: pluralize("Year", years, true), value: years }
      : { label: pluralize("Month", months, true), value: months }

  let numeral: string
  try {
    numeral = romans.romanize(value).toString() // * NOTE: 4,000 years max limit
  } catch {
    numeral = ""
  }

  return (
    <>
      {Boolean(openedCoin) && (
        <Modal onClose={closeCoin} opened={openedCoin}>
          <Stack align="center">
            <Group justify="flex-end" w="100%">
              <Tooltip label="Close">
                <Button data-testid="close" onClick={closeCoin} p="xs" variant="transparent">
                  <IconX size={20} />
                </Button>
              </Tooltip>
            </Group>
            <Text c="var(--text-primary)" fw="bolder" size="xxl" ta="center">
              AA Milestone Coin
            </Text>
            <AACoin numeral={numeral} />
            <Stack align="center">
              <Text c="var(--accent-orange)" fw="bolder" size="xxl" ta="center">
                {label}
              </Text>
              <Stack align="center" c="var(--text-secondary)" maw={320}>
                <Text ta="center">Your commitment, strength, and perseverance brought you here.</Text>
                <Text c="dimmed" fs="italic" size="sm" ta="center">
                  Keep moving forward, <b>one day at a time</b>.
                </Text>
              </Stack>
              <Box
                bg="var(--border-default)"
                h={1}
                style={{
                  opacity: 0.7
                }}
                w="100%"
              />
              <Text c="var(--text-muted)" maw={320} size="xxs" ta="center">
                This is a personal recovery-tracking feature created by Sober Tracker. It is not affiliated with or
                endorsed by Alcoholics Anonymous and is not an official AA medallion or award.
              </Text>
            </Stack>
          </Stack>
        </Modal>
      )}
      <Group justify="center">
        <Tooltip label="Show AA Coin">
          <Button
            bg="var(--gradient-primary)"
            c="var(--text-dark)"
            leftSection={
              <Box
                bdrs={999}
                bg="var(--bg-aa)"
                c="var(--text-secondary)"
                display="flex"
                h={32}
                style={{
                  alignItems: "center",
                  flexShrink: 0,
                  justifyContent: "center"
                }}
                visibleFrom="sm"
                w={32}>
                <IconCoins size={20} />
              </Box>
            }
            onClick={openCoin}
            size="lg"
            w="min(100%, 270px)">
            Show AA Coin
          </Button>
        </Tooltip>
      </Group>
    </>
  )
})
