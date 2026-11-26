import {
  type JSX,
  type KeyboardEvent,
  lazy,
  Suspense,
  use,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react"

import {
  IconChartBar,
  IconHeartHandshake,
  IconHome,
  IconLogout,
  IconSettings,
  IconStar,
  IconUser,
  IconX
} from "@tabler/icons-react"

import {
  AppShell,
  Avatar,
  Box,
  Burger,
  Button,
  Center,
  Divider,
  FocusTrap,
  Group,
  Loader,
  Modal,
  NavLink,
  Paper,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Tooltip
} from "@mantine/core"
import { useField } from "@mantine/form"
import { useDisclosure, useLocalStorage } from "@mantine/hooks"

import { error, info } from "@postfmly/logger"
import { type Nullable, type Optional } from "@postfmly/types"

import { default as pluralize } from "@jarrodek/pluralize"
import { parse as ms } from "@lukeed/ms"
import { default as dayjs } from "dayjs"
import { default as advancedFormat } from "dayjs/plugin/advancedFormat"
import { default as timezone } from "dayjs/plugin/timezone"
import { default as utc } from "dayjs/plugin/utc"
import { dequal as equal } from "dequal/lite"
import { default as useSWR } from "swr/immutable"
import { titleCase } from "title-case"
import { array } from "valibot"

import { version } from "../package.json" with { type: "json" }
import { Banner } from "./components/Banner.tsx"
import { Logo } from "./components/Logo.tsx"
import { Substances } from "./components/Substances.tsx"
import { env } from "./env.ts"
import { Milestones } from "./pages/Milestones.tsx"
import { Settings } from "./pages/Settings.tsx"
import { fetchClient } from "./services/fetchClient.ts"
import { displayStoreActions, useSelectedSubstance } from "./utils/displayStore.ts"
import { Endpoint, HttpMethod, Page, validate } from "./utils/index.ts"
import { type IFetchClientSettings } from "./utils/interfaces/IFetchClientSettings.ts"
import { type INav } from "./utils/interfaces/INav.ts"
import { type IStatePanel } from "./utils/interfaces/IStatePanel.ts"
import { defaultSubstance, type ISubstance, SubstanceSchema } from "./utils/interfaces/ISubstance.ts"
import { type ISubstanceDisplay } from "./utils/interfaces/ISubstanceDisplay.ts"
import { type IUserAvatarProps } from "./utils/interfaces/IUserAvatarProps.ts"
import { BooleanSchema, MAX_LEN_STR, NameSchema, StringSchema } from "./utils/schemas.ts"

dayjs.extend(utc) // * NOTE: required for timezone
dayjs.extend(timezone)
dayjs.extend(advancedFormat) // * NOTE: for Do format option

const Home = lazy(() => import("./pages/Home.tsx").then((m) => ({ default: m.Home })))
const Stats = lazy(() => import("./pages/Stats.tsx").then((m) => ({ default: m.Stats })))

const loading: JSX.Element = (
  <Paper>
    <Center>
      <Loader color="var(--accent-red)" size="sm" type="bars" />
    </Center>
  </Paper>
)

const apiVersion = fetchClient(
  {
    endpoint: Endpoint.version,
    method: HttpMethod.GET
  } satisfies IFetchClientSettings,
  StringSchema
)
  .then((data: Nullable<string>): string => (data ? `v${data}` : "N/A"))
  .catch((): string => "N/A")

const ApiVersion = (): JSX.Element => <>{use(apiVersion)}</>

const navItems: readonly INav<Page>[] = [
  {
    icon: IconHome,
    label: titleCase(Page.home),
    value: Page.home
  },
  {
    icon: IconChartBar,
    label: titleCase(Page.stats),
    value: Page.stats
  },
  {
    icon: IconStar,
    label: titleCase(Page.milestones),
    value: Page.milestones
  },
  {
    icon: IconSettings,
    label: titleCase(Page.settings),
    value: Page.settings
  }
]

const INTERVAL_MS = ms("1s")

const StatePanel = ({ title, description }: IStatePanel): JSX.Element => (
  <Paper>
    <Stack>
      <Text c="var(--accent-red)" fw="bold" size="xl" ta="center">
        {title}
      </Text>
      <Text c="var(--text-muted)" size="sm" ta="center">
        {description}
      </Text>
    </Stack>
  </Paper>
)

const INVALID_USER = "__INVALID_USER__" as const

const UserAvatar = ({ name, ...others }: IUserAvatarProps): JSX.Element => (
  <Avatar color="initials" name={name} size={32} {...others}>
    {name.charAt(0).toUpperCase()}
  </Avatar>
)

export const App = (): JSX.Element => {
  const [page, setPage] = useState<Page>(Page.home)
  const [openedNav, { close: closeNav, toggle: toggleNav }] = useDisclosure(false)

  const [loggingIn, setLoggingIn] = useState(false)

  const [soberUser, setSoberUser, resetSoberUser] = useLocalStorage<Optional<string>>({
    defaultValue: undefined,
    getInitialValueInEffect: false,
    key: "soberUser",
    deserialize: (data: Optional<string>): Optional<string> => {
      if (!data) {
        return // not set
      }

      return validate(data, NameSchema) ?? INVALID_USER
    },
    serialize: (data: Optional<string>): string => (data ? (validate(data, NameSchema) ?? "") : "")
  })

  const validUser = soberUser === INVALID_USER ? undefined : soberUser

  const pendingUserRef = useRef<Optional<string>>(undefined)

  const nameField = useField<string>({
    initialValue: "",
    validateOnChange: true,
    validate: (s: string): Nullable<string> => (s.trim().length > 0 ? null : "Must enter a name")
  })

  const [openedLogin, { open: openLogin, close: closeLogin }] = useDisclosure(false)
  const [openedLogout, { open: openLogout, close: closeLogout }] = useDisclosure(false)

  const selectedSubstance = useSelectedSubstance()

  const {
    getSelectedSubstanceNow,
    getUserNow: getUser,
    setDisplay,
    setSelectedSubstance,
    setUser
  } = displayStoreActions()

  const fetchUser = async (): Promise<void> => {
    const user = getUser()
    if (!user) {
      return
    }

    const isNew = await fetchClient(
      {
        endpoint: Endpoint.user,
        method: HttpMethod.GET,
        user
      } satisfies IFetchClientSettings,
      BooleanSchema
    )

    if (env.DEBUG) {
      info(`User logged in as: ${user} (${isNew ? "new" : "existing"})`)
    }
  }

  const fetchSubstances = async ([, user]: readonly [string, string]): Promise<ISubstance[]> => {
    const data = await fetchClient(
      {
        endpoint: Endpoint.substances,
        method: HttpMethod.GET,
        user
      } satisfies IFetchClientSettings,
      array(SubstanceSchema)
    )
    if (!data) {
      return []
    }

    if (env.DEBUG) {
      info(`Got ${pluralize("substance", data.length, true)} from API`)
    }

    return data
  }

  const {
    data: substances,
    mutate: refreshSubstances,
    isLoading,
    isValidating
  } = useSWR<ISubstance[]>(validUser ? ["substances", validUser] : null, fetchSubstances, {
    onSuccess: (s: ISubstance[]): void => {
      const subs = validate(s, array(SubstanceSchema))
      if (!subs) {
        return
      }

      if (pendingUserRef.current === validUser) {
        return
      }

      if (subs.length === 0) {
        setSelectedSubstance(defaultSubstance)

        return
      }

      const selectedSubstanceNow = getSelectedSubstanceNow()

      const substance = subs.find((sub: ISubstance): boolean => sub.name === selectedSubstanceNow.name) ?? subs[0]

      if (!substance) {
        setSelectedSubstance(defaultSubstance)

        return
      }

      if (equal(substance, selectedSubstanceNow)) {
        if (env.DEBUG) {
          info("Found same substance… skipping")
        }

        return
      }

      setSelectedSubstance(substance)

      if (env.DEBUG) {
        info(`Setting substance to: ${substance.name} on ${substance.date}`)
      }
    }
  })

  const setUserAndRefresh = async (): Promise<void> => {
    const user = nameField.getValue()

    setUser(user)

    pendingUserRef.current = user

    setSelectedSubstance(defaultSubstance)

    try {
      await fetchUser()

      setSoberUser(user)
    } catch (e: unknown) {
      pendingUserRef.current = undefined
      throw e
    }
  }

  const resetUserAndRefresh = (): void => {
    pendingUserRef.current = undefined

    const user = getUser() // capture before reset

    setUser(null)

    setSelectedSubstance(defaultSubstance)

    resetSoberUser()

    setPage(Page.home)

    if (env.DEBUG) {
      info(`${user} logged out`)
    }
  }

  const resetName = (): void => {
    nameField.reset()
  }

  const handleNameConfirm = async (): Promise<void> => {
    if (loggingIn) {
      return
    }

    setLoggingIn(true)

    try {
      await setUserAndRefresh()

      closeLogin()

      setPage(Page.home)
    } catch (e: unknown) {
      error(e)
    } finally {
      setLoggingIn(false)
    }
  }

  const handleNameChangeKeyDown = async (e: KeyboardEvent<HTMLInputElement>): Promise<void> => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      await handleNameConfirm()
    }
  }

  const setUserFromSoberUser = (): void => {
    setUser(validUser ?? null)
  }

  const handleNameCancel = (): void => {
    if (loggingIn) {
      return
    }

    if (openedLogin) {
      closeLogin()
    }

    setUserFromSoberUser()
  }

  const handleLogin = (): void => {
    resetName()

    openLogin()
  }

  const handleLogout = async (): Promise<void> => {
    const user = getUser()
    if (!user) {
      return
    }

    try {
      // * NOTE: remove user from API cache
      await fetchClient({
        endpoint: Endpoint.evict,
        method: HttpMethod.DELETE,
        user
      } satisfies IFetchClientSettings)

      resetUserAndRefresh()

      closeLogout()
    } catch (e: unknown) {
      error(e)
    }
  }

  const substancesDisplay = useMemo(
    (): ISubstanceDisplay[] =>
      substances
        ? substances.map(
            (s: ISubstance): ISubstanceDisplay =>
              ({
                cost: s.cost,
                id: s.id ?? 0,
                label: (
                  <Tooltip label={s.name}>
                    <Text size="sm">{s.name}</Text>
                  </Tooltip>
                ),
                value: s.name
              }) satisfies ISubstanceDisplay
          )
        : [],
    [substances]
  )

  const init = async (): Promise<void> => {
    setUserFromSoberUser()
    if (!getUser()) {
      return
    }

    await fetchUser()
  }

  const initRef = useRef(init)

  useLayoutEffect((): void => {
    initRef.current = init
  })

  useEffect((): (() => void) => {
    let isMounted = true
    let interval: Optional<NodeJS.Timeout>

    ;(async (): Promise<void> => {
      try {
        await initRef.current()

        if (isMounted) {
          interval = setInterval((): void => {
            const { date } = getSelectedSubstanceNow()

            if (date) {
              setDisplay(date)
            }
          }, INTERVAL_MS)
        }
      } catch (e: unknown) {
        if (isMounted) {
          error(e)
        }
      }
    })()

    return (): void => {
      isMounted = false

      if (interval) {
        clearInterval(interval)
      }
    }
  }, [getSelectedSubstanceNow, setDisplay])

  useEffect((): void => {
    if (soberUser === INVALID_USER) {
      resetSoberUser()
    }
  }, [resetSoberUser, soberUser])

  useEffect((): void => {
    if (!validUser || pendingUserRef.current !== validUser || substances === undefined) {
      return
    }

    const subs = validate(substances, array(SubstanceSchema))

    setSelectedSubstance(subs?.[0] ?? defaultSubstance)

    pendingUserRef.current = undefined
  }, [validUser, substances, setSelectedSubstance])

  // biome-ignore lint/correctness/useExhaustiveDependencies: not needed
  useEffect((): void => {
    if (openedLogin) {
      nameField.validate()
    }
  }, [openedLogin])

  return (
    <>
      <Modal
        closeOnClickOutside={!loggingIn}
        closeOnEscape={!loggingIn}
        onClose={handleNameCancel}
        opened={openedLogin}>
        <Stack align="center" gap="xl" p="md">
          <Logo />
          <Tooltip label="Name">
            <TextInput
              {...nameField.getInputProps()}
              data-autofocus={true}
              leftSection={<IconUser size={16} />}
              maxLength={MAX_LEN_STR}
              onKeyDown={handleNameChangeKeyDown}
              placeholder="Enter name…"
              required={true}
              styles={{
                input: {
                  background: "var(--bg-login-input)",
                  borderColor: "var(--border-login-input)"
                }
              }}
            />
          </Tooltip>
          <Tooltip label="Log In">
            <Button
              bd={0}
              bg="var(--gradient-primary)"
              c="var(--text-dark)"
              disabled={loggingIn || nameField.getValue().length === 0}
              fullWidth={true}
              fw="bold"
              loading={loggingIn}
              onClick={handleNameConfirm}
              size="sm"
              styles={{
                root: {
                  boxShadow: "var(--shadow-login-button)"
                }
              }}>
              Log In
            </Button>
          </Tooltip>
        </Stack>
      </Modal>
      <Modal onClose={closeLogout} opened={openedLogout}>
        <FocusTrap.InitialFocus />
        <Stack>
          <Text c="var(--text-primary)" fw="bold" size="xl">
            Log out
          </Text>
          <Text c="var(--accent-red)">Are you sure you want to log out?</Text>
          <Group justify="flex-end" mt="sm">
            <Tooltip label="Cancel">
              <Button
                c="var(--text-primary)"
                leftSection={<IconX size={20} />}
                onClick={closeLogout}
                style={{
                  borderColor: "var(--accent-red)"
                }}
                variant="outline">
                Cancel
              </Button>
            </Tooltip>
            <Tooltip label="Log Out">
              <Button
                bg="var(--gradient-remove)"
                c="var(--text-primary)"
                leftSection={<IconLogout size={20} />}
                onClick={handleLogout}>
                Log Out
              </Button>
            </Tooltip>
          </Group>
        </Stack>
      </Modal>
      <AppShell
        header={{
          height: 60
        }}
        layout="alt"
        navbar={{
          breakpoint: "sm",
          width: 260,
          collapsed: {
            mobile: !openedNav
          }
        }}
        padding={0}>
        <AppShell.Navbar
          bg="var(--gradient-sidebar)"
          p="md"
          style={{
            borderRight: "1px solid var(--border-default)"
          }}>
          <Stack h="100%">
            <Logo />
            <Stack mt="lg">
              {navItems.map((item: INav<Page>): JSX.Element => {
                const Icon = item.icon
                const isActive = page === item.value
                const isHidden = item.value !== Page.home && (!validUser || (substances?.length ?? 0) === 0)

                return (
                  <Tooltip key={item.value} label={item.label}>
                    <NavLink
                      active={isActive}
                      bdrs={12}
                      bg={isActive ? "var(--bg-active)" : "transparent"}
                      c={isActive ? "var(--accent-red)" : "var(--text-secondary)"}
                      data-testid={`nav-${item.value}`}
                      hidden={isHidden}
                      label={item.label}
                      leftSection={<Icon size={24} />}
                      onClick={(): void => {
                        setPage(item.value)

                        closeNav()
                      }}
                      p="12px 14px"
                      styles={{
                        label: {
                          fontWeight: "bold"
                        }
                      }}
                    />
                  </Tooltip>
                )
              })}
            </Stack>
            <Box mt="auto">
              <Divider color="var(--border-default)" mb="md" />
              <Stack align="center" py="xs">
                <IconHeartHandshake color="var(--accent-green)" size={24} />
                <Text c="var(--text-secondary)" size="sm" ta="center">
                  This too shall pass.
                </Text>
              </Stack>
            </Box>
          </Stack>
        </AppShell.Navbar>
        <AppShell.Header
          bg="var(--bg-secondary)"
          px="lg"
          style={{
            borderBottom: "1px solid var(--border-default)"
          }}>
          <Group h="100%" justify="space-between">
            <Group>
              <Burger color="var(--text-primary)" hiddenFrom="sm" onClick={toggleNav} opened={openedNav} size="sm" />
            </Group>
            <Group>
              {validUser ? (
                <Tooltip label="Log Out">
                  <UserAvatar name={validUser} onClick={openLogout} />
                </Tooltip>
              ) : (
                <Tooltip label="Log In">
                  <Avatar color="var(--text-secondary)" data-testid="login" onClick={handleLogin} size={32}>
                    <IconUser size={24} />
                  </Avatar>
                </Tooltip>
              )}
            </Group>
          </Group>
        </AppShell.Header>
        <AppShell.Main bg="var(--bg-primary)" c="var(--text-primary)" mb="md" mih="100vh">
          <Box
            maw={1800}
            mx="auto"
            p={{
              base: "md",
              md: "xl"
            }}>
            <Stack>
              <Banner page={page} />
              {((): JSX.Element => {
                if (!validUser) {
                  return <StatePanel description="Please log in to continue." title="Not Logged In" />
                }

                const sharedProps = {
                  allSubstances: substances,
                  refreshSubstances,
                  selectedSubstance,
                  setSelectedSubstance,
                  substances: substancesDisplay,
                  user: validUser
                }

                switch (page) {
                  case Page.home: {
                    if (isLoading || isValidating) {
                      return loading
                    }

                    if (substances && substances.length > 0) {
                      return (
                        <Suspense fallback={loading}>
                          <Home {...sharedProps} />
                        </Suspense>
                      )
                    }

                    return (
                      <Paper>
                        <Stack>
                          <Substances {...sharedProps} />
                          <StatePanel description="Please add a substance to continue." title="No Substances Found" />
                        </Stack>
                      </Paper>
                    )
                  }
                  case Page.stats:
                    return (
                      <Suspense fallback={loading}>
                        <Stats {...sharedProps} />
                      </Suspense>
                    )
                  case Page.milestones:
                    return <Milestones {...sharedProps} />
                  case Page.settings:
                    return <Settings {...sharedProps} />
                  default:
                    return <StatePanel description={`Page (${page}) not defined.`} title="Unknown Page" />
                }
              })()}
            </Stack>
          </Box>
        </AppShell.Main>
        <AppShell.Footer
          bg="var(--bg-secondary)"
          style={{
            borderTop: "1px solid var(--border-default)"
          }}>
          <Group gap="xs" h="100%" justify="center" wrap="nowrap">
            <Text c="var(--accent-orange)" size="xxs">
              ᓚᗢ
            </Text>
            <Text c="var(--accent-green)" size="xxs">
              〃
            </Text>
            <Text c="var(--accent-blue)" size="xxs">
              <Box c="var(--text-secondary)" component="sup">
                UI
              </Box>{" "}
              v{version}
            </Text>
            <Text c="var(--accent-green)" size="xxs">
              〃
            </Text>
            <Text c="var(--accent-red)" size="xxs">
              &copy; 2026 postfmly
            </Text>
            <Text c="var(--accent-green)" size="xxs">
              〃
            </Text>
            <Text c="var(--accent-blue)" component="div" size="xxs">
              <Box c="var(--text-secondary)" component="sup">
                API
              </Box>{" "}
              <Suspense fallback={<Skeleton display="inline-block" height={10} width={24} />}>
                <ApiVersion />
              </Suspense>
            </Text>
            <Text c="var(--accent-green)" size="xxs">
              〃
            </Text>
            <Text c="var(--accent-orange)" size="xxs">
              𑄝ᓗ
            </Text>
          </Group>
        </AppShell.Footer>
      </AppShell>
    </>
  )
}
