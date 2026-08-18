import { type ChangeEvent, type EffectCallback, type JSX, type KeyboardEvent, useEffect } from "react"

import {
  ActionIcon,
  Anchor,
  Box,
  Button,
  Center,
  EmptyState,
  Group,
  Image,
  Modal,
  NumberFormatter,
  Stack,
  Text,
  TextInput,
  Tooltip
} from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"
import { useField } from "@mantine/form"
import { useDisclosure, useLocalStorage } from "@mantine/hooks"

import { info } from "@postfmly/logger"

import { default as pluralize } from "@jarrodek/pluralize"
import { Big } from "big.js"
import { default as dayjs } from "dayjs"
import { default as advancedFormat } from "dayjs/plugin/advancedFormat"
import { default as timezone } from "dayjs/plugin/timezone"
import { default as utc } from "dayjs/plugin/utc"
import { fastIsEqual } from "fast-is-equal"
import { default as httpMethods } from "http-methods-constants"
import { default as ms } from "ms"
import {
  TbCalendar as IconCalendar,
  TbCheck as IconCheck,
  TbKey as IconKey,
  TbSettings as IconSettings,
  TbX as IconX
} from "react-icons/tb"
import { default as useSWR } from "swr/immutable"
import { titleCase } from "title-case"
import { match, P } from "ts-pattern"

import { fetchClient } from "../../api/index.ts"
import {
  displayStoreActions,
  getCoin,
  getCost,
  getDays,
  getHours,
  getMinutes,
  getMonths,
  getSeconds,
  getWeeks,
  getYears
} from "../../utils/displayStore.ts"
import { DEBUG, getKeyByValue, handleError, validate } from "../../utils/index.ts"
import { type ICoin } from "../../utils/interfaces/ICoin.ts"
import { type ICost } from "../../utils/interfaces/ICost.ts"
import { type IFetchClient } from "../../utils/interfaces/IFetchClient.ts"
import { defaultSubstance, type ISubstance, SubstanceSchema } from "../../utils/interfaces/ISubstance.ts"
import { type ISubstanceDisplay } from "../../utils/interfaces/ISubstanceDisplay.ts"
import { CostSchema, CostType, DateSchema, MAX_LEN_STR, NameSchema } from "../../utils/schemas.ts"
import { default as Settings } from "../Settings/index.tsx"
import { default as Substances } from "../Substances/index.tsx"

import "./index.css"

dayjs.extend(utc) // * NOTE: required for timezone
dayjs.extend(timezone)
dayjs.extend(advancedFormat) // * NOTE: for Do format option

if (DEBUG) {
  info("Debug is ON")
}

dayjs.tz.setDefault(dayjs.tz.guess())
if (DEBUG) {
  info(`Timezone set to: ${dayjs.tz.guess()}`)
}

const INTERVAL_MS: number = ms("1s")

const Display = (): JSX.Element => {
  const [soberUser, setSoberUser, resetSoberUser] = useLocalStorage<string | undefined>({
    defaultValue: undefined,
    getInitialValueInEffect: false,
    key: "soberUser",
    deserialize: (data: string | undefined): string | undefined => {
      if (!data) {
        return // not set
      }

      const u: string | null = validate<string, NameSchema>(data as string, NameSchema)
      if (!u) {
        resetSoberUser() // not valid

        return
      }

      if (u.includes("showCoin") && u.includes("showCost")) {
        resetSoberUser() // deprecated format

        return
      }

      return u
    },
    serialize: (data: string | undefined): string => {
      if (!data) {
        return "" // not set
      }

      const u: string | null = validate<string, NameSchema>(data, NameSchema)
      if (!u) {
        return "" // not valid
      }

      return u
    }
  })

  const nameField = useField<string>({
    initialValue: "",
    validateOnChange: true,
    validate: (s: string): string | null => (s.length > 0 ? null : "Must enter a name")
  })

  const [openedLogin, { open: openLogin, close: closeLogin }] = useDisclosure(false)
  const [openedSettings, { open: openSettings, close: closeSettings }] = useDisclosure(false)
  const [openedCoin, { open: openCoin, close: closeCoin }] = useDisclosure(false)

  const {
    getDaysInt,
    getMonthsFloat,
    getSelectedSubstance,
    getUser,
    getWeeksFloat,
    getYearsFloat,
    setCoin,
    setCost,
    setDisplay,
    setSelectedSubstance,
    setUser
  } = displayStoreActions()

  const coin: ICoin | null = getCoin()
  const cost: ICost | null = getCost()
  const days: string = getDays()
  const hours: string = getHours()
  const minutes: string = getMinutes()
  const months: string = getMonths()
  const seconds: string = getSeconds()
  const weeks: string = getWeeks()
  const years: string = getYears()

  const selectedSubstanceDate: string = getSelectedSubstance().date

  const validateUser = async (): Promise<void> => {
    const userValue: string | null = getUser()
    if (!userValue) {
      return
    }

    // * NOTE: Validate/create user
    await fetchClient({
      endpoint: "user",
      method: httpMethods.GET,
      user: userValue
    } satisfies IFetchClient)
  }

  const fetchSubstances = async (endpoint: string): Promise<ISubstance[]> => {
    const userValue: string | null = getUser()
    if (!userValue) {
      return [] as ISubstance[]
    }

    return await fetchClient<ISubstance[]>({
      endpoint,
      method: httpMethods.GET,
      user: userValue
    } satisfies IFetchClient).then((data: ISubstance[] | null): ISubstance[] => {
      const s: ISubstance[] | null = validate<ISubstance[], SubstanceSchema>(data, SubstanceSchema)
      if (!s) {
        return [] as ISubstance[]
      }

      if (DEBUG) {
        info(`Got ${pluralize("substance", s.length, true)} from API`)
      }

      return s
    })
  }

  const { data: substances, mutate: refreshSubstances } = useSWR<ISubstance[]>(
    soberUser ? "substances" : null,
    fetchSubstances,
    {
      onSuccess: (s: ISubstance[]): void => {
        const subs: ISubstance[] | null = validate<ISubstance[], SubstanceSchema>(s, SubstanceSchema)
        if (!subs || subs.length === 0) {
          setSelectedSubstance(defaultSubstance)

          handleSetCost(0)

          return
        }

        const selectedSubstance: ISubstance = getSelectedSubstance()

        const foundSubstance: ISubstance | undefined = subs.find(
          (sub: ISubstance): boolean => sub.name === selectedSubstance.name
        )
        if (!foundSubstance) {
          setSelectedSubstance(defaultSubstance)

          handleSetCost(0)
        }

        const substance: ISubstance | undefined =
          !selectedSubstance.name || subs.length === 1 ? subs[0] : foundSubstance

        if (!substance) {
          if (DEBUG) {
            handleError("Substance not found")
          }

          return
        }

        handleSetCost(substance.cost)

        if (fastIsEqual(substance, selectedSubstance)) {
          if (DEBUG) {
            info("Found same substance… skipping")
          }

          return
        }

        setSelectedSubstance(substance)

        if (DEBUG) {
          info(`Setting substance to: ${substance.name} on ${substance.date}`)
        }
      }
    }
  )

  const handleChangeDate = async (date: string | null): Promise<void> => {
    const userValue: string | null = getUser()

    const selectedSubstance: ISubstance = getSelectedSubstance()

    if (selectedSubstance.id === undefined || !userValue) {
      return
    }

    const d: string | null = validate<string, DateSchema>(date, DateSchema)
    if (!d) {
      return
    }

    await fetchClient<ISubstance>({
      body: {
        ...selectedSubstance,
        date: d
      } as ISubstance,
      endpoint: `substances/update/${selectedSubstance.id}`,
      method: httpMethods.PUT,
      user: userValue
    } satisfies IFetchClient)
      .then((data: ISubstance | null): void => {
        const s: ISubstance | null = validate<ISubstance, SubstanceSchema>(data, SubstanceSchema)
        if (!s) {
          return
        }

        setSelectedSubstance(s)

        if (DEBUG) {
          info(`New sober date for ${s.name}: ${d}`)
        }
      })
      .then(async (): Promise<void> => {
        await refreshSubstances()
      })
  }

  const setUserAndRefresh = (): void => {
    new Promise<void>((resolve): void => {
      const user: string = getUser() as string

      setSoberUser(user)

      if (DEBUG) {
        info(`User logged in as: ${user}`)
      }

      resolve()
    })
      .then(async (): Promise<void> => {
        await validateUser()
      })
      .then(async (): Promise<void> => {
        await refreshSubstances()
      })
  }

  const resetUserAndRefresh = (): void => {
    new Promise<void>((resolve): void => {
      setUser(null)

      resetSoberUser()

      if (DEBUG) {
        info("User logged out")
      }

      resolve()
    }).then(async (): Promise<void> => {
      await refreshSubstances() // clear
    })
  }

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const u: string | null = validate<string, NameSchema>(e.target.value, NameSchema)
    if (!u) {
      return
    }

    setUser(u)

    nameField.setValue(u)
  }

  const handleNameConfirm = (): void => {
    if (!getUser()) {
      return
    }

    closeLogin()

    setUserAndRefresh()
  }

  const handleNameChangeKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" && getUser() !== null) {
      handleNameConfirm()
    }
  }

  const setUserFromSoberUser = (): void => {
    setUser(soberUser ?? null)
  }

  const handleNameCancel = (): void => {
    closeLogin()

    setUserFromSoberUser()
  }

  const handleLogin = (): void => {
    openLogin()

    nameField.setValue("")
    nameField.validate() // show error
  }

  const getSubstancesDisplay = (): ISubstanceDisplay[] =>
    substances
      ? substances.map(
          (s: ISubstance): ISubstanceDisplay =>
            ({
              cost: s.cost ?? 0,
              id: s.id as number,
              label: (
                <Tooltip label={s.name} withArrow>
                  <Text size="sm">{s.name}</Text>
                </Tooltip>
              ),
              value: s.name as string
            }) satisfies ISubstanceDisplay
        )
      : []

  const getLoginButton = (): JSX.Element => (
    <Tooltip label="Log In" withArrow={true}>
      <Button
        c="var(--mantine-color-dark-0)"
        color="var(--color-blue)"
        leftSection={<IconKey color="yellow" size={16} />}
        onClick={handleLogin}
        size="xs"
        variant="outline">
        Log In
      </Button>
    </Tooltip>
  )

  const handleSetCost = (c: number | undefined): void => {
    const substanceCost: number | null = validate<number | undefined, CostSchema, number>(c, CostSchema)

    // * NOTE: catches 0 or null
    if (!substanceCost) {
      setCost(null)

      return
    }

    const substance: ISubstance = getSelectedSubstance()

    try {
      const totalCost: number = match<CostType, number>(substance.costType)
        .returnType<number>()
        .with(CostType.Day, (): number => substanceCost * getDaysInt())
        .with(CostType.Week, (): number => substanceCost * getWeeksFloat())
        .with(CostType.Month, (): number => substanceCost * getMonthsFloat())
        .with(CostType.Year, (): number => substanceCost * getYearsFloat())
        .exhaustive()

      if (totalCost === 0) {
        return
      }

      setCost({
        cost: totalCost,
        costPer: `Cost per ${getKeyByValue(CostType, substance.costType)}: $${new Big(substance.cost).toFixed(2, Big.roundDown)}`
      } satisfies ICost)
    } catch (e: unknown) {
      // * NOTE: Handles NonExhaustiveError
      handleError(e)
    }
  }

  const init = async (): Promise<void> => {
    setUserFromSoberUser()
    if (!getUser()) {
      return
    }

    await validateUser().then(async (): Promise<ISubstance[] | undefined> => await refreshSubstances())

    const selectedSubstance: ISubstance = getSelectedSubstance()

    new Promise<void>((resolve): void => {
      setDisplay(selectedSubstance.date)

      handleSetCost(selectedSubstance.cost)

      resolve()
    }).then((): void => {
      let txt: string = "No milestones to show yet."
      let img: string | undefined

      const m: number = Math.floor(getMonthsFloat())

      if (m > 0) {
        const EighteenMonths: number = 18
        const MaxYears: number = 5 // TODO: more images

        const y: number = Math.floor(getYearsFloat())

        txt = titleCase(y > 0 ? pluralize("year", y, true) : pluralize("month", m, true))

        img = "/coins/"

        // biome-ignore format: don't expand braces
        img += match<object, string>({ m, y })
          .returnType<string>()
          .with({ m: EighteenMonths }, (): string => "18m.png")
          .with({ y: P.number.gt(0) }, (): string => `${y}y.png`)
          .otherwise((): string => `${m}m.png`)

        if (y > MaxYears) {
          img = undefined
          txt = `${txt} (No image)`
        }
      }

      setCoin({
        image: img,
        text: txt
      } satisfies ICoin)
    })
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: only watching selectedSubstance
  useEffect((): ReturnType<EffectCallback> => {
    init()

    const interval: NodeJS.Timeout = setInterval((): void => {
      setDisplay(selectedSubstanceDate)
    }, INTERVAL_MS)

    return (): void => clearInterval(interval)
  }, [getSelectedSubstance()])

  return (
    <>
      <Modal.Root
        centered={true}
        onClose={closeLogin}
        opened={openedLogin}
        size="auto"
        transitionProps={{
          duration: 250,
          timingFunction: "linear",
          transition: "scale"
        }}>
        <Modal.Overlay backgroundOpacity={0.75} />
        <Modal.Content>
          <Modal.Header>
            <Modal.Title
              c="var(--color-green)"
              fw="bold"
              styles={{
                title: {
                  fontSize: "1.5rem"
                }
              }}>
              Login
            </Modal.Title>
            <Tooltip label="Close" withArrow>
              <Modal.CloseButton
                style={{
                  cursor: "pointer"
                }}
              />
            </Tooltip>
          </Modal.Header>
          <Modal.Body>
            <Tooltip label="Name" withArrow={true}>
              <TextInput
                {...nameField.getInputProps()}
                data-autofocus
                label="Name"
                maxLength={MAX_LEN_STR}
                onChange={handleNameChange}
                onKeyDown={handleNameChangeKeyDown}
                placeholder="Enter name…"
                rightSection={
                  <>
                    <Tooltip label="Confirm" withArrow={true}>
                      <IconCheck
                        color="green"
                        onClick={handleNameConfirm}
                        size={16}
                        style={{
                          cursor: "pointer",
                          flexShrink: 0,
                          marginRight: "5px"
                        }}
                      />
                    </Tooltip>
                    <Tooltip label="Cancel" withArrow={true}>
                      <IconX
                        color="red"
                        onClick={handleNameCancel}
                        size={16}
                        style={{
                          cursor: "pointer",
                          flexShrink: 0,
                          marginRight: "20px"
                        }}
                      />
                    </Tooltip>
                  </>
                }
                withAsterisk={true}
              />
            </Tooltip>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
      <Group
        style={{
          left: "10px",
          position: "fixed",
          top: "10px"
        }}>
        {soberUser ? (
          <Text c="dimmed" data-testid="loggedIn" fs="italic" size="xs">
            Logged in as:{" "}
            <Tooltip label="Log Out" withArrow={true}>
              <Anchor c="blue" onClick={resetUserAndRefresh} underline="never">
                {soberUser}
              </Anchor>
            </Tooltip>
          </Text>
        ) : (
          getLoginButton()
        )}
      </Group>
      <Settings
        closeSettings={closeSettings}
        openedSettings={openedSettings}
        refreshSubstances={refreshSubstances}
        substances={substances}
        user={getUser()}
      />
      {getUser() ? (
        <>
          <Tooltip label="Settings" withArrow>
            <ActionIcon
              data-testid="settings"
              disabled={getSelectedSubstance().name.length === 0}
              onClick={openSettings}
              pos="absolute"
              right={10}
              style={{
                cursor: "pointer"
              }}
              top={10}
              variant="subtle">
              <IconSettings color="white" size={64} />
            </ActionIcon>
          </Tooltip>
          <Substances
            allSubstances={substances}
            refreshSubstances={refreshSubstances}
            selectedSubstance={getSelectedSubstance()}
            setSelectedSubstance={setSelectedSubstance}
            substances={getSubstancesDisplay()}
            user={soberUser ?? null}
          />
          <Center>
            <Stack>
              <Center>
                <Box mb={20}>
                  <Tooltip label="Enter your sobriety date" withArrow>
                    <DatePickerInput
                      c="var(--color-blue)"
                      className="sober-date"
                      data-testid="datePicker"
                      disabled={!getSelectedSubstance().name}
                      label="Sober since:"
                      leftSection={<IconCalendar color="var(--color-red)" size={16} />}
                      maxDate={dayjs().toDate()}
                      mb={20}
                      mt={50}
                      onChange={handleChangeDate}
                      pointer={true}
                      popoverProps={{
                        withinPortal: true
                      }}
                      ta="center"
                      value={getSelectedSubstance().date}
                      valueFormat="dddd, MMMM Do, YYYY"
                      w={250}
                    />
                  </Tooltip>
                </Box>
              </Center>
              <Stack
                align="center"
                c="var(--color-blue)"
                data-testid="counter"
                ff="var(--font-counters)"
                fw="bold"
                fz="h1"
                gap="xs">
                <Box data-testid="seconds">{seconds}</Box>
                <Box>{minutes}</Box>
                <Box>{hours}</Box>
                <Box>{days}</Box>
                <Box>{weeks}</Box>
                <Box>{months}</Box>
                <Box>{years}</Box>
              </Stack>
              {getSelectedSubstance().showCost && cost ? (
                <Center mt={20}>
                  <Text c="var(--color-red)" fw="bold" inline mr={10} size="xl">
                    Savings:
                  </Text>
                  <Tooltip
                    label={
                      <Text fs="italic" fw="bold" size="sm">
                        {cost.costPer}
                      </Text>
                    }
                    withArrow>
                    <Text
                      c="var(--color-green)"
                      ff="var(--font-counters)"
                      fw="bold"
                      inline
                      size="xl"
                      style={{
                        cursor: "pointer"
                      }}>
                      <NumberFormatter
                        data-testid="cost"
                        decimalScale={2}
                        fixedDecimalScale={true}
                        prefix="$"
                        thousandSeparator=","
                        value={cost.cost}
                      />
                    </Text>
                  </Tooltip>
                </Center>
              ) : null}
              {getSelectedSubstance().showCoin && coin ? (
                <>
                  {/* biome-ignore lint/correctness/useUniqueElementIds: needed for CSS */}
                  <Modal
                    centered
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
                      <Text c="var(--color-blue)" fw="bold" size="xl">
                        {coin.text}
                      </Text>
                      {coin.image ? <Image src={coin.image} title={coin.text} /> : null}
                    </Stack>
                  </Modal>
                  <Tooltip label="Show Coin" withArrow>
                    <Button
                      c="var(--color-black)"
                      data-testid="coinButton"
                      fw="bold"
                      gradient={{
                        deg: 90,
                        from: "var(--color-blue)",
                        to: "var(--color-green)"
                      }}
                      mb={30}
                      mt={40}
                      onClick={openCoin}
                      size="xs"
                      variant="gradient">
                      Show Coin
                    </Button>
                  </Tooltip>
                </>
              ) : null}
            </Stack>
          </Center>
        </>
      ) : (
        <EmptyState
          color="var(--color-yellow)"
          description="Please log in to display counter."
          mt={50}
          size="sm"
          title="« Not Logged In »">
          <EmptyState.Actions>{getLoginButton()}</EmptyState.Actions>
        </EmptyState>
      )}
    </>
  )
}

export default Display
