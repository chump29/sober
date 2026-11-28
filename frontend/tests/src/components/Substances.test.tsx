import { beforeEach, describe, expect, mock, test } from "bun:test"

import { createTheme, MantineProvider, Modal } from "@mantine/core"

import { type Optional } from "@postfmly/types"

import { fakerEN_US as fake } from "@faker-js/faker"
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { default as fetchMock } from "jest-fetch-mock"
import { titleCase } from "title-case"
import { match, P } from "ts-pattern"

import { Substances } from "../../../src/components/Substances.tsx"
import { Endpoint, HttpMethod, MAX_SUBSTANCES, validate } from "../../../src/utils/index.ts"
import { defaultSubstance, type ISubstance, SubstanceSchema } from "../../../src/utils/interfaces/ISubstance.ts"
import { type ISubstanceDisplay } from "../../../src/utils/interfaces/ISubstanceDisplay.ts"
import { type ISubstancesProps } from "../../../src/utils/interfaces/ISubstancesProps.ts"
import { getSubstance, toDisplay } from "../utils/helpers.ts"

let substance = getSubstance()
const fetch = fetchMock.enableMocks().mockResponse(
  (req: Request): Response =>
    match<string, Response>(new URL(req.url).pathname)
      .with(P.string.endsWith(Endpoint.AddSubstance), P.string.includes(Endpoint.UpdateSubstance), () =>
        Response.json(substance)
      )
      .with(P.string.includes(Endpoint.DeleteSubstance), () => Response.json(true))
      .otherwise((s: string): never => {
        throw new Error(`Invalid API call: ${s}`)
      })
)

type MockComponent = Record<string, unknown>

const showNotificationMock = mock((): void => undefined)
const hideNotificationMock = mock((): void => undefined)
mock.module(
  "@mantine/notifications",
  (): MockComponent => ({
    hideNotification: hideNotificationMock,
    showNotification: showNotificationMock
  })
)

let isTouch = false
mock.module(
  "@mantine/hooks",
  async (): Promise<MockComponent> => ({
    ...(await import("@mantine/hooks")),
    useMediaQuery: (): boolean => isTouch
  })
)

const theme = createTheme({
  components: {
    Modal: Modal.extend({
      defaultProps: {
        transitionProps: {
          duration: 0
        }
      }
    })
  }
})

const refreshSubstances = mock((): Promise<Optional<ISubstance[]>> => Promise.resolve(undefined))
const setSelectedSubstance = mock((): void => undefined)

const substance1 = getSubstance()
const substance2 = getSubstance()

if (substance1.name === substance2.name) {
  // just in case
  substance2.name += "2"
}

const renderSubstances = (overrides: Partial<ISubstancesProps> = {}): ReturnType<typeof render> => {
  const props = {
    allSubstances: [substance1, substance2],
    isHome: true,
    refreshSubstances,
    selectedSubstance: substance1,
    setSelectedSubstance,
    substances: [toDisplay(substance1), toDisplay(substance2)],
    user: fake.internet.username(),
    ...overrides
  }

  return render(
    <MantineProvider theme={theme}>
      <Substances {...props} />
    </MantineProvider>
  )
}

const reRename = /to rename/u

beforeEach((): void => {
  isTouch = false
})

// biome-ignore lint/nursery/useLowercaseTestTitle: component name
describe("Substances", (): void => {
  test("displays header, segmented control, and rename", (): void => {
    renderSubstances()

    expect(screen.getByText("SUBSTANCES")).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: substance1.name })).toBeChecked()
    expect(screen.getByRole("radio", { name: substance2.name })).not.toBeChecked()
    expect(screen.getByText("Double-click to rename")).toBeInTheDocument()
  })

  test("displays rename on touch device, hides when no substances", (): void => {
    isTouch = true

    const { unmount } = renderSubstances()

    expect(screen.getByText("Hold to rename")).toBeInTheDocument()

    unmount()

    renderSubstances({ allSubstances: [], selectedSubstance: defaultSubstance, substances: [] })

    expect(screen.queryByText(reRename)).toBeNull()
  })

  test("disables Add when max substances, disables Remove when no substances", (): void => {
    const substances = Array.from({ length: MAX_SUBSTANCES }, (): ISubstance => getSubstance())

    const { unmount } = renderSubstances({
      allSubstances: substances,
      selectedSubstance: substances[0],
      substances: substances.map((s: ISubstance): ISubstanceDisplay => toDisplay(s))
    })

    expect(screen.getByRole("button", { name: "Add" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Remove" })).toBeEnabled()

    unmount()

    renderSubstances({ allSubstances: [], selectedSubstance: defaultSubstance, substances: [] })

    expect(screen.getByRole("button", { name: "Add" })).toBeEnabled()
    expect(screen.getByRole("button", { name: "Remove" })).toBeDisabled()
  })

  test("switches selected substance", async (): Promise<void> => {
    const user = userEvent.setup()

    renderSubstances()

    await user.click(screen.getByRole("radio", { name: substance2.name }))

    expect(setSelectedSubstance).toHaveBeenCalledWith(substance2)
  })

  test("adds new substance", async (): Promise<void> => {
    const user = userEvent.setup()

    substance = getSubstance()

    renderSubstances()

    await user.click(screen.getByRole("button", { name: "Add" }))

    const add = within(screen.getByRole("dialog")).getByRole("button", { name: "Add" })

    expect(add).toBeDisabled()

    const name = fake.lorem.word()

    await user.type(screen.getByPlaceholderText("Enter substance name…"), name)

    expect(add).toBeEnabled()

    await user.click(add)

    await waitFor((): void => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(Endpoint.AddSubstance),
        expect.objectContaining({
          body: expect.stringContaining(titleCase(name)),
          method: HttpMethod.POST
        })
      )
    })

    expect(setSelectedSubstance).toHaveBeenCalledWith(validate(substance, SubstanceSchema))
    expect(refreshSubstances).toHaveBeenCalledTimes(1)
    expect(showNotificationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "setDate",
        title: "Set Sober Date"
      })
    )
    expect(screen.queryByPlaceholderText("Enter substance name…")).toBeNull()
  })

  test("adds new substance on Enter", async (): Promise<void> => {
    const user = userEvent.setup()

    substance = getSubstance()

    renderSubstances()

    await user.click(screen.getByRole("button", { name: "Add" }))

    const name = fake.lorem.word()

    await user.type(screen.getByPlaceholderText("Enter substance name…"), `${name}{Enter}`)

    await waitFor((): void => {
      expect(setSelectedSubstance).toHaveBeenCalledWith(validate(substance, SubstanceSchema))
    })
  })

  test("no duplicate substance name", async (): Promise<void> => {
    const user = userEvent.setup()

    renderSubstances()

    await user.click(screen.getByRole("button", { name: "Add" }))

    await user.type(screen.getByPlaceholderText("Enter substance name…"), `  ${substance1.name.toUpperCase()}  `)

    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Add" }))

    expect(await screen.findByText("Substance already added")).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  test("renames selected substance on double-click", async (): Promise<void> => {
    const user = userEvent.setup()

    const name = fake.lorem.word()

    const title = titleCase(name)

    substance = getSubstance({ id: substance1.id, name: title })

    renderSubstances()

    fireEvent.doubleClick(screen.getByRole("radio", { name: substance1.name }))

    expect(screen.getByText("Rename Substance")).toBeInTheDocument()

    const input = screen.getByPlaceholderText("Enter substance name…")

    expect(input).toHaveValue(substance1.name)

    await user.clear(input)

    await user.type(input, name)

    await user.click(screen.getByRole("button", { name: "Rename" }))

    await waitFor((): void => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`${Endpoint.UpdateSubstance}/${substance1.id}`),
        expect.objectContaining({
          body: expect.stringContaining(title),
          method: HttpMethod.PUT
        })
      )
    })

    expect(setSelectedSubstance).toHaveBeenCalledWith(validate(substance, SubstanceSchema))
    expect(refreshSubstances).toHaveBeenCalledTimes(1)
    expect(screen.queryByText("Rename Substance")).toBeNull()
  })

  test("no rename to existing substance name", async (): Promise<void> => {
    const user = userEvent.setup()

    renderSubstances()

    fireEvent.doubleClick(screen.getByRole("radio", { name: substance1.name }))

    const input = screen.getByPlaceholderText("Enter substance name…")

    await user.clear(input)

    await user.type(input, substance2.name.toLowerCase())

    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Rename" }))

    expect(await screen.findByText("Substance already added")).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  test("removes selected substance", async (): Promise<void> => {
    const user = userEvent.setup()

    renderSubstances()

    await user.click(screen.getByRole("button", { name: "Remove" }))

    const dialog = screen.getByRole("dialog")

    expect(within(dialog).getByText("Remove Substance")).toBeInTheDocument()

    await user.click(within(dialog).getByRole("button", { name: "Remove" }))

    expect(hideNotificationMock).toHaveBeenCalledWith("setDate")

    await waitFor((): void => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`${Endpoint.DeleteSubstance}/${substance1.id}`),
        expect.objectContaining({
          method: HttpMethod.DELETE
        })
      )
    })

    expect(setSelectedSubstance).toHaveBeenCalledWith(substance2)
    expect(refreshSubstances).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  test("falls back to defaultSubstance when last substance removed", async (): Promise<void> => {
    const user = userEvent.setup()

    renderSubstances({
      allSubstances: [substance1],
      selectedSubstance: substance1,
      substances: [toDisplay(substance1)]
    })

    await user.click(screen.getByRole("button", { name: "Remove" }))

    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Remove" }))

    await waitFor((): void => {
      expect(setSelectedSubstance).toHaveBeenCalledWith(defaultSubstance)
    })
  })

  test("cancels remove modal without deleting", async (): Promise<void> => {
    const user = userEvent.setup()

    renderSubstances()

    await user.click(screen.getByRole("button", { name: "Remove" }))

    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Cancel" }))

    expect(screen.queryByRole("dialog")).toBeNull()
    expect(fetch).not.toHaveBeenCalled()
  })

  test("closes rename modal when name is unchanged", async (): Promise<void> => {
    const user = userEvent.setup()

    renderSubstances()

    fireEvent.doubleClick(screen.getByRole("radio", { name: substance1.name }))

    await user.click(screen.getByRole("button", { name: "Rename" }))

    expect(fetch).not.toHaveBeenCalled()
    expect(screen.queryByText("Rename Substance")).toBeNull()
  })

  test("shows notification when refreshSubstances fails", async (): Promise<void> => {
    const user = userEvent.setup()

    refreshSubstances.mockRejectedValueOnce(new Error("Refresh error"))

    renderSubstances()

    await user.click(screen.getByRole("button", { name: "Remove" }))
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Remove" }))

    await waitFor((): void => {
      expect(showNotificationMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Refresh Failed"
        })
      )
    })
  })
})
