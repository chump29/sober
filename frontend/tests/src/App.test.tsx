// biome-ignore-all lint/style/useComponentExportOnlyModules: mocks

import { beforeEach, describe, expect, mock, test } from "bun:test"

import { act, type JSX } from "react"

import { createTheme, MantineProvider, Modal } from "@mantine/core"

import { type Nullable } from "@postfmly/types"

import { fakerEN_US as fake } from "@faker-js/faker"
import { render, screen } from "@testing-library/react"
import { type UserEvent, userEvent } from "@testing-library/user-event"
import { default as fetchMock } from "jest-fetch-mock"
import { match, P } from "ts-pattern"

import { Endpoint, HttpStatus, Page } from "../../src/utils/index.ts"
import { type IDisplayActions } from "../../src/utils/interfaces/IDisplay.ts"
import { type ISubstance } from "../../src/utils/interfaces/ISubstance.ts"
import { getSubstance } from "./utils/helpers.ts"

const version = fake.system.semver()

let currentUser: Nullable<string>

const substance = getSubstance()
let substances: ISubstance[] = [substance]

const fetch = fetchMock.enableMocks().mockResponse(
  (req: Request): Response =>
    match<string, Response>(new URL(req.url).pathname)
      .with(P.string.endsWith(Endpoint.version), () => Response.json(version))
      .with(P.string.endsWith(Endpoint.user), () => new Response(null, { status: HttpStatus.CREATED }))
      .with(P.string.endsWith(Endpoint.evict), () => new Response())
      .otherwise((s: string): never => {
        throw new Error(`Invalid API call: ${s}`)
      })
)

type MockComponent = Record<string, unknown>

mock.module(
  "swr/immutable",
  (): MockComponent => ({
    default: mock((key: unknown) => ({
      data: key ? substances : undefined,
      isLoading: false,
      isValidating: false,
      mutate: mock()
    }))
  })
)

const setSelectedSubstance = mock((): void => undefined)
const setDisplay = mock((): void => undefined)
const getSelectedSubstanceNow = mock((): ISubstance => substance)
const getUserNow = mock((): Nullable<string> => currentUser)
const setUser = mock((user: Nullable<string>): void => {
  currentUser = user
})
mock.module(
  "../../src/utils/displayStore.ts",
  (): MockComponent => ({
    displayStoreActions: (): IDisplayActions => ({
      setDisplay,
      setSelectedSubstance,
      getSelectedSubstanceNow,
      getUserNow,
      setUser
    }),
    useSelectedSubstance: (): ISubstance => substance
  })
)

const Logo = (): JSX.Element => <div data-testid="logo" />
mock.module(
  "../../src/components/Logo.tsx",
  (): MockComponent => ({
    Logo
  })
)

const Banner = (): JSX.Element => <div data-testid="banner" />
mock.module(
  "../../src/components/Banner.tsx",
  (): MockComponent => ({
    Banner
  })
)

const Substances = (): JSX.Element => <div data-testid="substances" />
mock.module(
  "../../src/components/Substances.tsx",
  (): MockComponent => ({
    Substances
  })
)

const Home = (): JSX.Element => <div data-testid={Page.home} />
mock.module(
  "../../src/pages/Home.tsx",
  (): MockComponent => ({
    Home
  })
)

const Stats = (): JSX.Element => <div data-testid={Page.stats} />
mock.module(
  "../../src/pages/Stats.tsx",
  (): MockComponent => ({
    Stats
  })
)

const Milestones = (): JSX.Element => <div data-testid={Page.milestones} />
mock.module(
  "../../src/pages/Milestones.tsx",
  (): MockComponent => ({
    Milestones
  })
)

const Settings = (): JSX.Element => <div data-testid={Page.settings} />
mock.module(
  "../../src/pages/Settings.tsx",
  (): MockComponent => ({
    Settings
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

const { App }: { App: () => JSX.Element } = await import("../../src/App.tsx") // set up fetch/mocks first

beforeEach(async (): Promise<void> => {
  localStorage.clear()

  currentUser = null

  substances = [substance]

  await act((): Promise<void> => {
    render(
      <MantineProvider theme={theme}>
        <App />
      </MantineProvider>
    )

    return Promise.resolve()
  })
})

// biome-ignore lint/nursery/useLowercaseTestTitle: component name
describe("App", (): void => {
  test("displays API version", async (): Promise<void> => {
    expect(fetch).toHaveBeenNthCalledWith(1, expect.stringContaining(Endpoint.version), expect.anything())

    const v = await screen.findByText(version, { exact: false })

    expect(v).toBeInTheDocument()
  })

  test("displays logo", (): void => {
    expect(screen.getByTestId("logo")).toBeInTheDocument()
  })

  test("displays banner", (): void => {
    expect(screen.getByTestId("banner")).toBeInTheDocument()
  })

  test("substances not displayed", (): void => {
    expect(screen.queryByTestId("substances")).toBeNull()
  })

  test("displays login message", (): void => {
    expect(screen.getByText("Not Logged In")).toBeInTheDocument()
  })

  const openLogin = async (user?: UserEvent): Promise<void> => {
    const u = user ?? userEvent.setup()

    const login = screen.getByTestId("login")

    await u.click(login)
  }

  test("pages not displayed in nav", (): void => {
    expect(screen.getByTestId("nav-stats")).not.toBeVisible()
    expect(screen.getByTestId("nav-milestones")).not.toBeVisible()
    expect(screen.getByTestId("nav-settings")).not.toBeVisible()
  })

  test("opens login", async (): Promise<void> => {
    await openLogin()

    expect(screen.getByPlaceholderText("Enter name…")).toBeInTheDocument()
  })

  test("disables login button", async (): Promise<void> => {
    await openLogin()

    expect(screen.getByRole("button", { name: "Log In" })).toBeDisabled()
  })

  const typeUserName = async (user: UserEvent, name?: string): Promise<void> => {
    await user.type(screen.getByPlaceholderText("Enter name…"), name ?? fake.person.firstName())
  }

  test("enables login button when user name entered", async (): Promise<void> => {
    const user = userEvent.setup()

    await openLogin(user)

    await typeUserName(user)

    expect(screen.getByRole("button", { name: "Log In" })).toBeEnabled()
  })

  interface ILoginOptions {
    name?: string
    user?: UserEvent
  }

  const doLogin = async (options: ILoginOptions = {}): Promise<void> => {
    const user = options.user ?? userEvent.setup()

    await openLogin(user)

    await typeUserName(user, options.name ?? fake.person.firstName())

    await user.click(screen.getByRole("button", { name: "Log In" }))
  }

  test("logs in when a valid user name submitted", async (): Promise<void> => {
    const name = fake.person.firstName()

    await doLogin({ name })

    expect(localStorage.getItem("soberUser")).toBe(name)
    expect(fetch).toHaveBeenLastCalledWith(expect.stringContaining(Endpoint.user), expect.anything())
    expect(screen.queryByPlaceholderText("Enter name…")).toBeNull()
  })

  test("shows nav pages and home when user logged in", async (): Promise<void> => {
    await doLogin()

    expect(screen.getByTestId("nav-stats")).toBeVisible()
    expect(screen.getByTestId("nav-milestones")).toBeVisible()
    expect(screen.getByTestId("nav-settings")).toBeVisible()

    expect(screen.queryByTestId("substances")).toBeNull() // Home handles substances
    expect(await screen.findByTestId(Page.home)).toBeInTheDocument() // lazy loaded
  })

  interface ILogInAndClickOptions {
    element: string
    user?: UserEvent
  }

  const logInAndClick = async (options: ILogInAndClickOptions): Promise<void> => {
    const user = options.user ?? userEvent.setup()

    await doLogin({ user })

    await user.click(screen.getByTestId(options.element))
  }

  test("displays Stats", async (): Promise<void> => {
    await logInAndClick({ element: "nav-stats" })

    expect(await screen.findByTestId(Page.stats)).toBeInTheDocument() // lazy loaded
  })

  test("displays Milestones", async (): Promise<void> => {
    await logInAndClick({ element: "nav-milestones" })

    expect(screen.getByTestId(Page.milestones)).toBeInTheDocument()
  })

  test("displays Settings", async (): Promise<void> => {
    await logInAndClick({ element: "nav-settings" })

    expect(screen.getByTestId(Page.settings)).toBeInTheDocument()
  })

  test("displays Home", async (): Promise<void> => {
    const user = userEvent.setup()

    await logInAndClick({ element: "nav-settings", user })

    expect(screen.getByTestId(Page.settings)).toBeInTheDocument()

    await user.click(screen.getByTestId("nav-home"))

    expect(screen.queryByTestId(Page.settings)).toBeNull()
    expect(await screen.findByTestId(Page.home)).toBeInTheDocument() // lazy loaded
  })

  test("cancels log out", async (): Promise<void> => {
    const user = userEvent.setup()

    const name = fake.person.firstName()

    await doLogin({ name, user })

    await user.click(screen.getByText(name.charAt(0).toUpperCase()))

    expect(screen.getByRole("button", { name: "Log Out" })).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Cancel" }))

    expect(screen.queryByRole("button", { name: "Log Out" })).toBeNull()
    expect(localStorage.getItem("soberUser")).toBe(name)
  })

  test("logs out", async (): Promise<void> => {
    const user = userEvent.setup()

    const name = fake.person.firstName()

    await doLogin({ name, user })

    await user.click(screen.getByText(name.charAt(0).toUpperCase()))

    await user.click(screen.getByRole("button", { name: "Log Out" }))

    expect(fetch).toHaveBeenLastCalledWith(
      expect.stringContaining(Endpoint.evict),
      expect.objectContaining({ method: "DELETE" })
    )

    expect(localStorage.getItem("soberUser")).toBeNull()
    expect(screen.getByText("Not Logged In")).toBeInTheDocument()
  })

  test("logs in when Enter key is pressed", async (): Promise<void> => {
    const user = userEvent.setup()

    const name = fake.person.firstName()

    await openLogin(user)

    await typeUserName(user, `${name}{Enter}`)

    expect(localStorage.getItem("soberUser")).toBe(name)
    expect(screen.queryByPlaceholderText("Enter name…")).toBeNull()
  })

  test("closes login on escape", async (): Promise<void> => {
    const user = userEvent.setup()

    await openLogin(user)

    await typeUserName(user)

    await user.keyboard("{Escape}")

    expect(screen.queryByPlaceholderText("Enter name…")).toBeNull()
    expect(localStorage.getItem("soberUser")).toBeNull()

    await openLogin(user)

    expect(screen.getByPlaceholderText("Enter name…")).toHaveValue("") // verify cleared
  })

  test("displays empty substances when logged in", async (): Promise<void> => {
    substances = []

    await doLogin()

    expect(screen.getByTestId("substances")).toBeInTheDocument()
    expect(screen.getByText("No Substances Found")).toBeInTheDocument()
    expect(screen.getByText("Please add a substance to continue.")).toBeInTheDocument()

    expect(screen.getByTestId("nav-stats")).not.toBeVisible()
    expect(screen.getByTestId("nav-milestones")).not.toBeVisible()
    expect(screen.getByTestId("nav-settings")).not.toBeVisible()
  })
})
