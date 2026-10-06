import { type ChangeEvent, type JSX, type KeyboardEvent, useEffect, useMemo } from "react"

import {
  ActionIcon,
  Anchor,
  Box,
  Button,
  Center,
  Checkbox,
  EmptyState,
  Group,
  Modal,
  NumberFormatter,
  RollingNumber,
  Space,
  Stack,
  Text,
  TextInput,
  Tooltip
} from "@mantine/core"
import { DateTimePicker } from "@mantine/dates"
import { useField } from "@mantine/form"
import { useDisclosure, useLocalStorage } from "@mantine/hooks"

import { info } from "@postfmly/logger"
import { type Nullable, type Optional } from "@postfmly/types"

import { default as pluralize } from "@jarrodek/pluralize"
import { parse as ms } from "@lukeed/ms"
import { IconCalendar, IconCheck, IconKey, IconSettings, IconX } from "@tabler/icons-react"
import { Big } from "big.js"
import { default as dayjs } from "dayjs"
import { default as advancedFormat } from "dayjs/plugin/advancedFormat"
import { default as timezone } from "dayjs/plugin/timezone"
import { default as utc } from "dayjs/plugin/utc"
import { fastIsEqual as isEqual } from "fast-is-equal"
import { default as useSWR } from "swr/immutable"
import { match } from "ts-pattern"

import { fetchClient } from "../../api/index.ts"
import { env } from "../../env.ts"
import {
  displayStoreActions,
  getCost,
  getDays,
  getHours,
  getMinutes,
  getMonths,
  getSeconds,
  getWeeks,
  getYears
} from "../../utils/displayStore.ts"
import { getKeyByValue, HttpMethods, handleError, validate } from "../../utils/index.ts"
import { type ICost } from "../../utils/interfaces/ICost.ts"
import { type IFetchClient } from "../../utils/interfaces/IFetchClient.ts"
import { defaultSubstance, type ISubstance, SubstanceSchema } from "../../utils/interfaces/ISubstance.ts"
import { type ISubstanceDisplay } from "../../utils/interfaces/ISubstanceDisplay.ts"
import {
  CostSchema,
  CostType,
  DATETIME_FORMAT,
  DATETIME_FORMAT_OUTPUT,
  DATETIME_FORMAT_SHORT_OUTPUT,
  DateTimeSchema,
  MAX_LEN_STR,
  NameSchema
} from "../../utils/schemas.ts"
import { Coin } from "../Coin/index.tsx"
import { Settings } from "../Settings/index.tsx"
import { Substances } from "../Substances/index.tsx"

import "./index.css"

dayjs.extend(utc) // * NOTE: required for timezone
dayjs.extend(timezone)
dayjs.extend(advancedFormat) // * NOTE: for Do format option

if (env.SOBER_DEBUG) {
  info("Debug is ON")
}

dayjs.tz.setDefault(dayjs.tz.guess())
if (env.SOBER_DEBUG) {
  info(`Timezone set to: ${dayjs.tz.guess()}`)
}

const INTERVAL_MS: number = ms("1s") as number

const Display = (): JSX.Element => {
  const [soberUser, setSoberUser, resetSoberUser] = useLocalStorage<Optional<string>>({
    defaultValue: undefined,
    getInitialValueInEffect: false,
    key: "soberUser",
    deserialize: (data: Optional<string>): Optional<string> => {
      if (!data) {
        return // not set
      }

      const u: Nullable<string> = validate<string, NameSchema>(data as string, NameSchema)
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
    serialize: (data: Optional<string>): string => {
      if (!data) {
        return "" // not set
      }

      const u: Nullable<string> = validate<string, NameSchema>(data, NameSchema)
      if (!u) {
        return "" // not valid
      }

      return u
    }
  })

  const nameField = useField<string>({
    initialValue: "",
    validateOnChange: true,
    validate: (s: string): Nullable<string> => (s.length > 0 ? null : "Must enter a name")
  })

  const [openedLogin, { open: openLogin, close: closeLogin }] = useDisclosure(false)
  const [openedSettings, { open: openSettings, close: closeSettings }] = useDisclosure(false)
  const [openedCoin, { open: openCoin, close: closeCoin }] = useDisclosure(false)

  const {
    getDaysNow,
    getMonthsNow,
    getSelectedSubstance,
    getUser,
    getWeeksNow,
    getYearsNow,
    setCost,
    setDisplay,
    setSelectedSubstance,
    setUser
  } = displayStoreActions()

  const cost: Nullable<ICost> = getCost()
  const days: number = getDays()
  const hours: number = getHours()
  const minutes: number = getMinutes()
  const months: number = getMonths()
  const seconds: number = getSeconds()
  const weeks: number = getWeeks()
  const years: number = getYears()

  const strSeconds: string = useMemo((): string => pluralize("second", seconds), [seconds])
  const strMinutes: string = useMemo((): string => pluralize("minute", minutes), [minutes])
  const strHours: string = useMemo((): string => pluralize("hour", hours), [hours])
  const strDays: string = useMemo((): string => pluralize("day", days), [days])
  const strWeeks: string = useMemo((): string => pluralize("week", weeks), [weeks])
  const strMonths: string = useMemo((): string => pluralize("month", months), [months])
  const strYears: string = useMemo((): string => pluralize("year", years), [years])

  const validateUser = async (): Promise<void> => {
    const userValue: Nullable<string> = getUser()
    if (!userValue) {
      return
    }

    // * NOTE: Validate/create user
    await fetchClient({
      endpoint: "user",
      method: HttpMethods.GET,
      user: userValue
    } satisfies IFetchClient)
  }

  const fetchSubstances = async (endpoint: string): Promise<ISubstance[]> => {
    const userValue: Nullable<string> = getUser()
    if (!userValue) {
      return [] as ISubstance[]
    }

    const data: Nullable<ISubstance[]> = await fetchClient<ISubstance[]>({
      endpoint,
      method: HttpMethods.GET,
      user: userValue
    } satisfies IFetchClient)

    const s: Nullable<ISubstance[]> = validate<ISubstance[], SubstanceSchema>(data, SubstanceSchema)
    if (!s) {
      return [] as ISubstance[]
    }

    if (env.SOBER_DEBUG) {
      info(`Got ${pluralize("substance", s.length, true)} from API`)
    }

    return s
  }

  const { data: substances, mutate: refreshSubstances } = useSWR<ISubstance[]>(
    soberUser ? "substances" : null,
    fetchSubstances,
    {
      onSuccess: (s: ISubstance[]): void => {
        const subs: Nullable<ISubstance[]> = validate<ISubstance[], SubstanceSchema>(s, SubstanceSchema)
        if (!subs || subs.length === 0) {
          setSelectedSubstance(defaultSubstance)

          handleSetCost(0)

          return
        }

        const selectedSubstance: ISubstance = getSelectedSubstance()

        const foundSubstance: Optional<ISubstance> = subs.find(
          (sub: ISubstance): boolean => sub.name === selectedSubstance.name
        )
        if (!foundSubstance) {
          setSelectedSubstance(defaultSubstance)

          handleSetCost(0)
        }

        const substance: Optional<ISubstance> = !selectedSubstance.name || subs.length === 1 ? subs[0] : foundSubstance

        if (!substance) {
          if (env.SOBER_DEBUG) {
            handleError("Substance not found")
          }

          return
        }

        handleSetCost(substance.cost)

        if (isEqual(substance, selectedSubstance)) {
          if (env.SOBER_DEBUG) {
            info("Found same substance… skipping")
          }

          return
        }

        setSelectedSubstance(substance)

        if (env.SOBER_DEBUG) {
          info(`Setting substance to: ${substance.name} on ${substance.date}`)
        }
      }
    }
  )

  const handleChangeDate = async (date: Nullable<string>): Promise<void> => {
    const userValue: Nullable<string> = getUser()

    const selectedSubstance: ISubstance = getSelectedSubstance()

    if (selectedSubstance.id === undefined || !userValue) {
      return
    }

    const formattedDate: string = dayjs(date).format(DATETIME_FORMAT) // convert from output format

    const d: Nullable<string> = validate<string, DateTimeSchema>(formattedDate, DateTimeSchema)
    if (!d) {
      return
    }

    const data: Nullable<ISubstance> = await fetchClient<ISubstance>({
      body: {
        ...selectedSubstance,
        date: d
      } as ISubstance,
      endpoint: `substances/update/${selectedSubstance.id}`,
      method: HttpMethods.PUT,
      user: userValue
    } satisfies IFetchClient)

    const s: Nullable<ISubstance> = validate<ISubstance, SubstanceSchema>(data, SubstanceSchema)
    if (!s) {
      return
    }

    setSelectedSubstance(s)

    if (env.SOBER_DEBUG) {
      info(`New sober date for ${s.name}: ${d}`)
    }

    await refreshSubstances()
  }

  const setUserAndRefresh = async (): Promise<void> => {
    const user: string = getUser() as string

    setSoberUser(user)

    if (env.SOBER_DEBUG) {
      info(`User logged in as: ${user}`)
    }

    await validateUser()

    await refreshSubstances()
  }

  const resetUserAndRefresh = async (): Promise<void> => {
    setUser(null)

    resetSoberUser()

    if (env.SOBER_DEBUG) {
      info("User logged out")
    }

    await refreshSubstances() // clear
  }

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const u: Nullable<string> = validate<string, NameSchema>(e.target.value, NameSchema)
    if (!u) {
      return
    }

    setUser(u)

    nameField.setValue(u)
  }

  const handleNameConfirm = async (): Promise<void> => {
    if (!getUser()) {
      return
    }

    closeLogin()

    await setUserAndRefresh()
  }

  const handleNameChangeKeyDown = async (e: KeyboardEvent<HTMLInputElement>): Promise<void> => {
    if (e.key === "Enter" && getUser() !== null) {
      await handleNameConfirm()
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
                <Tooltip label={s.name} withArrow={true}>
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

  const handleSetCost = (c: Optional<number>): void => {
    const substanceCost: Nullable<number> = validate<Optional<number>, CostSchema, number>(c, CostSchema)

    // * NOTE: catches 0 or null
    if (!substanceCost) {
      setCost(null)

      return
    }

    const substance: ISubstance = getSelectedSubstance()

    try {
      const totalCost: number = match<CostType, number>(substance.costType)
        .with(CostType.Day, (): number => substanceCost * getDaysNow())
        .with(CostType.Week, (): number => substanceCost * getWeeksNow())
        .with(CostType.Month, (): number => substanceCost * getMonthsNow())
        .with(CostType.Year, (): number => substanceCost * getYearsNow())
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

  const handleSetTime = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const checked: boolean = e.currentTarget.checked

    if (checked) {
      const now: dayjs.Dayjs = dayjs()

      getSelectedSubstance().date = dayjs(getSelectedSubstance().date)
        .set("hour", now.hour())
        .set("minute", now.minute())
        .set("second", now.second())
        .set("millisecond", now.millisecond())
        .format(DATETIME_FORMAT)
    } else {
      getSelectedSubstance().date = dayjs(getSelectedSubstance().date)
        .startOf("day")
        .format(DATETIME_FORMAT.replace("hh", "HH"))
    }

    getSelectedSubstance().showTime = checked

    await handleChangeDate(getSelectedSubstance().date)
  }

  const init = async (): Promise<void> => {
    setUserFromSoberUser()
    if (!getUser()) {
      return
    }

    await validateUser()

    await refreshSubstances()

    const selectedSubstance: ISubstance = getSelectedSubstance()

    setDisplay(selectedSubstance.date)

    handleSetCost(selectedSubstance.cost)
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: only watching selectedSubstance
  useEffect(() => {
    const handleInit = async (): Promise<void> => {
      await init()
    }

    handleInit()

    const interval = setInterval((): void => {
      setDisplay(getSelectedSubstance().date)
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
            <Tooltip label="Close" withArrow={true}>
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
                data-autofocus={true}
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
          position: "absolute",
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
          <Tooltip label="Settings" withArrow={true}>
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
                  <Tooltip label="Enter your sobriety date" withArrow={true}>
                    <DateTimePicker
                      c="var(--color-blue)"
                      className="sober-date"
                      data-testid="dateTimePicker"
                      disabled={!getSelectedSubstance().name}
                      dropdownType="modal"
                      highlightToday={true}
                      label="Sober since:"
                      leftSection={<IconCalendar color="var(--color-red)" size={16} />}
                      maxDate={dayjs().toDate()}
                      mb={20}
                      mt={50}
                      onChange={async (val: Nullable<string>): Promise<void> =>
                        await handleChangeDate(dayjs(val).format(DATETIME_FORMAT))
                      }
                      pointer={true}
                      ta="center"
                      timePickerProps={{
                        clearable: true,
                        disabled: !getSelectedSubstance().showTime,
                        format: "12h",
                        leftSection: (
                          <Tooltip label="Set time?" withArrow={true}>
                            <Checkbox checked={getSelectedSubstance().showTime} onChange={handleSetTime} />
                          </Tooltip>
                        ),
                        withDropdown: true
                      }}
                      value={getSelectedSubstance().date}
                      valueFormat={
                        getSelectedSubstance().showTime ? DATETIME_FORMAT_OUTPUT : DATETIME_FORMAT_SHORT_OUTPUT
                      }
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
                <Box data-testid="seconds">
                  <RollingNumber animationDuration={500} thousandSeparator={true} value={seconds} /> {strSeconds}
                </Box>
                {minutes > 0 ? (
                  <Box>
                    <RollingNumber animationDuration={500} thousandSeparator={true} value={minutes} /> {strMinutes}
                  </Box>
                ) : null}
                {hours > 0 ? (
                  <Box>
                    <RollingNumber animationDuration={500} thousandSeparator={true} value={hours} /> {strHours}
                  </Box>
                ) : null}
                {days > 0 ? (
                  <Box>
                    <RollingNumber animationDuration={500} thousandSeparator={true} value={days} /> {strDays}
                  </Box>
                ) : null}
                {weeks > 0 ? (
                  <Box>
                    <RollingNumber animationDuration={500} thousandSeparator={true} value={weeks} /> {strWeeks}
                  </Box>
                ) : null}
                {months > 0 ? (
                  <Box>
                    <RollingNumber animationDuration={500} thousandSeparator={true} value={months} /> {strMonths}
                  </Box>
                ) : null}
                {years > 0 ? (
                  <Box>
                    <RollingNumber animationDuration={500} thousandSeparator={true} value={years} /> {strYears}
                  </Box>
                ) : null}
              </Stack>
              {getSelectedSubstance().showCost && cost ? (
                <Center mt={20}>
                  <Text c="var(--color-red)" fw="bold" inline={true} mr={10} size="xl">
                    Savings:
                  </Text>
                  <Tooltip
                    label={
                      <Text fs="italic" fw="bold" size="sm">
                        {cost.costPer}
                      </Text>
                    }
                    withArrow={true}>
                    <Text
                      c="var(--color-green)"
                      ff="var(--font-counters)"
                      fw="bold"
                      inline={true}
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
              {getSelectedSubstance().showCoin ? (
                <>
                  <Coin
                    closeCoin={closeCoin}
                    m={Math.floor(getMonthsNow())}
                    openedCoin={openedCoin}
                    y={Math.floor(getYearsNow())}
                  />
                  <Tooltip label="Show Coin" withArrow={true}>
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
              ) : (
                <Space h="xl" />
              )}
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

export { Display }
