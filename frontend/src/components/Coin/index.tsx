import { type JSX } from "react"

import { Box, Image, Modal, Stack, Text } from "@mantine/core"

import { default as pluralize } from "@jarrodek/pluralize"
import { romanize } from "romans"
import { titleCase } from "title-case"
import { match, P } from "ts-pattern"

import { type IMonthAndYear } from "../../utils/interfaces/IMonthAndYear.ts"

const Coin = ({
  closeCoin,
  openedCoin,
  m,
  y
}: {
  closeCoin: () => void
  openedCoin: boolean
  m: number
  y: number
}): JSX.Element => {
  const getSize = (len: number): string => {
    const BASELINE: number = 28

    const fontSizes: Record<number, number> = {
      1: 30,
      2: 28,
      3: 24
    } as const

    return `${fontSizes[len] ?? BASELINE - len * 2}px`
  }

  const txt: string = match<IMonthAndYear, string>({ m, y } satisfies IMonthAndYear)
    .with({ m: P.number.gt(0), y: 0 }, (my: IMonthAndYear): string => titleCase(pluralize("month", my.m, true)))
    .with({ y: P.number.gt(0) }, (my: IMonthAndYear): string => titleCase(pluralize("year", my.y, true)))
    .otherwise((): string => "No milestones to show yet.")

  const showCoin: boolean = m > 0

  const romanNumerals: string = showCoin ? romanize(y > 0 ? y : m) : ""

  return (
    <>
      {/* biome-ignore lint/correctness/useUniqueElementIds: needed for CSS */}
      <Modal
        centered={true}
        id="coin"
        onClose={closeCoin}
        opened={openedCoin}
        size="auto"
        styles={{
          title: {
            fontSize: "20px",
            fontWeight: "bold"
          }
        }}
        title="AA Coin">
        <Stack ta="center">
          <Text c="var(--color-blue)" data-testid="txt" fw="bold" size="xl">
            {txt}
          </Text>
          {showCoin ? (
            <>
              <Image data-testid="img" src="coin.png" title={txt} />
              <Box
                left="50%"
                pos="absolute"
                style={{
                  transform: "translate(-53%, -50%)",
                  whiteSpace: "nowrap"
                }}
                top={210}>
                <Text
                  c="black"
                  data-testid="romanNumerals"
                  fw="bold"
                  style={{
                    fontSize: getSize(romanNumerals.length)
                  }}>
                  {romanNumerals}
                </Text>
              </Box>
            </>
          ) : null}
        </Stack>
      </Modal>
    </>
  )
}

export { Coin }
