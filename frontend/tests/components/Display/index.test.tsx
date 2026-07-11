/*import { beforeAll, beforeEach, describe, expect, test } from "bun:test"

import { error } from "@postfmly/logger"

import { fakerEN_US as fake } from "@faker-js/faker"
import { MantineProvider } from "@mantine/core"
import { ModalsProvider } from "@mantine/modals"
import { act, configure, render, screen, waitFor } from "@testing-library/react"
import { type UserEvent, default as userEvent } from "@testing-library/user-event"
import { default as dayjs } from "dayjs"
import { default as ms } from "ms"
import { type SafeParseResult, safeParse, summarize } from "valibot"

import { default as Display } from "../../../src/components/Display/index.tsx"
import { type ISoberDate, SoberDateSchema } from "../../../src/utils/interfaces/ISoberUser.ts"
import { DATE_FORMAT } from "../../../src/utils/schemas.ts"

configure({
  asyncUtilTimeout: ms("3s")
})

const soberDate: ISoberDate = {
  cost: Number(fake.commerce.price()),
  date: dayjs(
    fake.date.past({
      refDate: dayjs().subtract(2, "years").toDate(),
      years: 2
    })
  ).format(DATE_FORMAT),
  showCoin: true,
  showCost: true
} satisfies ISoberDate

const getSoberDate = (): ISoberDate => {
  const sd: SafeParseResult<SoberDateSchema> = safeParse(
    SoberDateSchema,
    JSON.parse(localStorage.getItem("soberDate") ?? "{}")
  )
  if (!sd.success) {
    error("Could not parse sober date")
    throw new Error(summarize(sd.issues))
  }
  return sd.output
}

beforeAll((): void => {
  localStorage.setItem("soberDate", JSON.stringify(soberDate))
  console.info(`📅 Sober date: ${getSoberDate().date}`)
})

beforeEach(async (): Promise<void> => {
  await waitFor((): void => {
    act((): void => {
      render(
        <MantineProvider>
          <ModalsProvider>
            <Display />
          </ModalsProvider>
        </MantineProvider>
      )
    })
  })
})

describe("index", (): void => {
  test("display settings", (): void => {
    expect(screen.getByTestId("testSettings")).toBeInTheDocument()
  })

  test("display sober date", (): void => {
    expect(screen.getByTestId("testSoberDate")).toBeInTheDocument()
  })

  test("display counters", (): void => {
    expect(screen.getByTestId("testCounters")).toBeInTheDocument()
  })

  test("display cost", (): void => {
    expect(screen.getByTestId("testCounters")).toBeInTheDocument()
  })

  test("display coin button", async (): Promise<void> => {
    await waitFor((): void => {
      expect(screen.getByTestId("testCoin")).toBeInTheDocument()
    })
  })

  test("change settings", async (): Promise<void> => {
    const user: UserEvent = userEvent.setup()

    expect(screen.getByTestId("testSettingsModal")).not.toHaveTextContent("Settings")

    await waitFor(async (): Promise<void> => {
      await user.click(screen.getByTestId("testSettings"))
      console.info("💥 Settings button clicked")
    })

    expect(screen.getByTestId("testSettingsModal")).toHaveTextContent("Settings")

    await waitFor(async (): Promise<void> => {
      await user.click(screen.getByTestId("testShowCoin"))
      console.info("💥 ShowCoin button clicked")

      await user.click(screen.getByTestId("testShowCost"))
      console.info("💥 ShowCost button clicked")

      await user.click(screen.getByTestId("testCloseSettings"))
      console.info("💥 CloseSettings button clicked")
    })

    await waitFor((): void => {
      expect(screen.getByTestId("testSettingsModal")).not.toHaveTextContent("Settings")
    })

    const sd: ISoberDate = getSoberDate()

    expect(sd.showCoin).toBeFalse()
    expect(sd.showCost).toBeFalse()

    const testCoin: HTMLElement | null = screen.queryByTestId("testCoin")
    expect(testCoin).toBeNull()

    const testCost: HTMLElement | null = screen.queryByTestId("testCost")
    expect(testCost).toBeNull()
  })
})*/
console.info("TODO")
