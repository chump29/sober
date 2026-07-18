import {
  type ChangeEvent,
  type EffectCallback,
  type JSX,
  type KeyboardEvent,
  type RefObject,
  useEffect,
  useRef
} from "react"

import { info } from "@postfmly/logger"

import { default as pluralize } from "@jarrodek/pluralize"
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
  NumberInput,
  Stack,
  Switch,
  Text,
  TextInput,
  Tooltip
} from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"
import { useField } from "@mantine/form"
import { useDisclosure, useLocalStorage } from "@mantine/hooks"
import { Big } from "big.js"
import { default as dayjs } from "dayjs"
import { default as advancedFormat } from "dayjs/plugin/advancedFormat"
import { default as timezone } from "dayjs/plugin/timezone"
import { default as utc } from "dayjs/plugin/utc"
import { default as httpMethods } from "http-methods-constants"
import { default as ms } from "ms"
import {
  TbCalendar as IconCalendar,
  TbCheck as IconCheck,
  TbCurrencyDollar as IconCurrencyDollar,
  TbKey as IconKey,
  TbSettings as IconSettings,
  TbX as IconX
} from "react-icons/tb"
import { default as useSWR } from "swr/immutable"

import { fetchClient } from "../../api/index.ts"
import {
  displayStore,
  displayStoreActions,
  getCoin,
  getCost,
  getCostValue,
  getDays,
  getHours,
  getMinutes,
  getMonths,
  getSeconds,
  getSelectedSubstance,
  getUserData,
  getUserValue,
  getWeeks,
  getYears
} from "../../utils/displayStore.ts"
import { DEBUG, UpdateType, validate } from "../../utils/index.ts"
import { type ICoin } from "../../utils/interfaces/ICoin.ts"
import { type ICost } from "../../utils/interfaces/ICost.ts"
import { defaultSubstance, type ISubstance, SubstanceSchema } from "../../utils/interfaces/ISubstance.ts"
import { type ISubstanceDisplay } from "../../utils/interfaces/ISubstanceDisplay.ts"
import { type IUser, UserSchema } from "../../utils/interfaces/IUser.ts"
import { BooleanSchema, CostSchema, DateSchema, MAX_LEN_STR, NameSchema } from "../../utils/schemas.ts"
import { default as Substances } from "../Substances/index.tsx"

import "./index.css"
import { type IFetchClient } from "../../utils/interfaces/IFetchClient.ts"

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

  const selectedSubstance: ISubstance = getSelectedSubstance()

  const userValue: string | null = getUserValue()
  const costValue: number | undefined = getCostValue()

  const userData: IUser | null = getUserData()

  const cost: ICost | null = getCost()
  const coin: ICoin | null = getCoin()

  const showCounter: RefObject<boolean> = useRef<boolean>(false)

  const nameField = useField<string>({
    initialValue: "",
    validateOnChange: true,
    validate: (s: string): string | null => (s.length > 0 ? null : "Must enter a name")
  })

  const costField = useField<number>({
    initialValue: 0,
    validateOnChange: true,
    validate: (c: number): string | null => (c > 0 ? null : "Must enter a cost")
  })

  const [openedLogin, { open: openLogin, close: closeLogin }] = useDisclosure(false)
  const [openedSettings, { open: openSettings, close: closeSettings }] = useDisclosure(false)
  const [openedCoin, { open: openCoin, close: closeCoin }] = useDisclosure(false)

  const days: string = getDays()
  const hours: string = getHours()
  const minutes: string = getMinutes()
  const months: string = getMonths()
  const seconds: string = getSeconds()
  const weeks: string = getWeeks()
  const years: string = getYears()

  const { setDisplay, setUserData, setSelectedSubstance, setUserValue, setCostValue, setCost, setCoin } =
    displayStoreActions()

  const fetchUser = async (): Promise<void> => {
    const user: string | null = displayStore.getState().userValue
    if (!user) {
      return
    }

    await fetchClient<IUser>({
      endpoint: "user",
      method: httpMethods.GET,
      user
    } satisfies IFetchClient).then((data: IUser | null): void => {
      const u: IUser | null = validate<IUser, UserSchema>(data, UserSchema)
      if (!u) {
        return
      }

      setUserData(u)

      if (DEBUG) {
        info(`Got user data for ${user}`)
      }
    })
  }

  const fetchSubstances = async (endpoint: string): Promise<ISubstance[]> => {
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
          return
        }

        const foundSubstance: ISubstance | undefined = subs.find(
          (sub: ISubstance): boolean => sub.name === selectedSubstance.name
        )
        if (!foundSubstance) {
          setSelectedSubstance(defaultSubstance)
        }

        const substance: ISubstance | undefined =
          !displayStore.getState().selectedSubstance.name || subs.length === 1 ? subs[0] : foundSubstance
        if (substance && substance !== displayStore.getState().selectedSubstance) {
          setSelectedSubstance(substance)

          if (DEBUG) {
            info(`Setting substance to: ${substance.name}`)
          }
        }
      }
    }
  )

  const handleChangeDate = async (date: string | null): Promise<void> => {
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
      const user: string = userValue as string

      setSoberUser(user)

      if (DEBUG) {
        info(`User logged in as: ${user}`)
      }

      resolve()
    })
      .then(async (): Promise<void> => {
        await fetchUser()
      })
      .then(async (): Promise<void> => {
        await refreshSubstances()
      })
  }

  const resetUserAndRefresh = (): void => {
    new Promise<void>((resolve): void => {
      setUserValue(null)

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

    setUserValue(u)

    nameField.setValue(u)
  }

  const handleNameConfirm = (): void => {
    if (!userValue) {
      return
    }

    closeLogin()

    setUserAndRefresh()
  }

  const handleNameChangeKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" && userValue !== null) {
      handleNameConfirm()
    }
  }

  const setUserValueFromSoberUser = (): void => {
    setUserValue(soberUser ?? null)
  }

  const handleNameCancel = (): void => {
    closeLogin()

    setUserValueFromSoberUser()
  }

  const handleLogout = (): void => {
    resetUserAndRefresh()
  }

  const handleLogin = (): void => {
    openLogin()

    nameField.setValue("")
    nameField.validate() // show error
  }

  const updateUser = async (type: UpdateType, val: boolean | number): Promise<boolean | number | null> => {
    if (!userValue?.trim()) {
      // * NOTE: catches zero length and null
      return null
    }

    const body: IUser = {
      ...userData
    } as IUser
    if (type === UpdateType.ShowCoin && userData?.showCoin !== Boolean(val)) {
      body.showCoin = validate<boolean, BooleanSchema>(Boolean(val), BooleanSchema) ?? false
    } else if (type === UpdateType.ShowCost && userData?.showCost !== Boolean(val)) {
      body.showCost = validate<boolean, BooleanSchema>(Boolean(val), BooleanSchema) ?? false

      if (!body.showCost) {
        body.cost = null

        if (userData) {
          userData.cost = null
        }

        setCostValue(undefined)

        costField.setValue(0)
      }
    } else if (type === UpdateType.Cost && Number(val) > 0 && userData?.cost !== Number(val)) {
      body.cost = validate<number, CostSchema>(Number(val), CostSchema)
    } else {
      return null
    }

    return await fetchClient<IUser>({
      body,
      endpoint: "user/update",
      method: httpMethods.PUT,
      user: userValue
    } satisfies IFetchClient).then((data: IUser | null): boolean | number | null => {
      const d: IUser | null = validate<IUser, UserSchema>(data, UserSchema)
      if (!d) {
        return null
      }

      setUserData(d)

      return val
    })
  }

  const handleShowCoin = async (event: ChangeEvent<HTMLInputElement>): Promise<void> =>
    await updateUser(UpdateType.ShowCoin, event.currentTarget.checked).then((val: boolean | number | null): void => {
      if (DEBUG && val !== null) {
        info(`${(val as boolean) ? "IS" : "NOT"} showing coin`)
      }
    })

  const handleShowCost = async (event: ChangeEvent<HTMLInputElement>): Promise<void> =>
    await updateUser(UpdateType.ShowCost, event.currentTarget.checked).then((val: boolean | number | null): void => {
      if (DEBUG && val !== null) {
        info(`${(val as boolean) ? "IS" : "NOT"} showing cost`)
      }
    })

  const handleCost = async (value: number | undefined): Promise<void> => {
    await updateUser(UpdateType.Cost, Number(value)).then((val: boolean | number | null): void => {
      if (DEBUG && val !== null) {
        info(`Cost is: $${val as number}`)
      }
    })
  }

  const handleCostChange = (costVal: number | string): void => {
    const costNum: number = Number(costVal)

    let c: number | null = 0
    if (costNum > 0) {
      c = validate<number, CostSchema>(costNum, CostSchema) as number
    }

    setCostValue(c ?? undefined)

    costField.setValue(c)
  }

  const handleCostConfirm = (): void => {
    if (!costValue) {
      // * NOTE: catches zero and undefined
      // ! NOTE: if changed to non-zero, cannot make zero again, must disable setting
      return
    }

    handleCost(costValue)
  }

  const handleCostKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" && costValue !== undefined) {
      handleCostConfirm()
    }
  }

  const resetCost = (): void => {
    setCostValue(userData?.cost ?? undefined)

    costField.setValue(costValue ?? 0)
  }

  const handleCostCancel = (): void => {
    resetCost()
  }

  const handleOpenSettings = (): void => {
    resetCost()

    openSettings()

    costField.validate()
  }

  const getSubstancesDisplay = (): ISubstanceDisplay[] =>
    substances
      ? substances.map(
          (s: ISubstance): ISubstanceDisplay =>
            ({
              id: s.id as number,
              label: (
                <Tooltip label={s.name} withArrow>
                  <Text size="sm">{s.name}</Text>
                </Tooltip>
              ),
              value: s.name
            }) satisfies ISubstanceDisplay
        )
      : []

  const getLoginButton = (): JSX.Element => (
    <Tooltip label="Log In" withArrow={true}>
      <Button
        c="var(--mantine-color-dark-0)"
        color="var(--color-og107)"
        leftSection={<IconKey color="yellow" size={16} />}
        onClick={handleLogin}
        size="xs"
        variant="outline">
        Log In
      </Button>
    </Tooltip>
  )

  const init = async (): Promise<void> => {
    setUserValueFromSoberUser()
    if (!displayStore.getState().userValue) {
      return
    }

    if (!userData) {
      await fetchUser().then(async (): Promise<ISubstance[] | undefined> => await refreshSubstances())
    }

    new Promise<void>((resolve): void => {
      setDisplay(selectedSubstance.date)

      resolve()
    })
      .then((): void => {
        const d: number = displayStore.getState().d

        const soberDataCost: number = userData?.cost ?? 0

        if (d > 0 && soberDataCost > 0) {
          const DaysPerWeek: number = 7

          const costPerDay: number = soberDataCost / DaysPerWeek

          setCost({
            cost: d * costPerDay,
            costPerDay: `Cost per day: $${new Big(costPerDay).toFixed(2, 0)}`
          } satisfies ICost)
        }
      })
      .then((): void => {
        let txt: string = "No milestones to show yet."
        let img: string | undefined

        const m: number = displayStore.getState().m

        if (m > 0) {
          const EighteenMonths: number = 18
          const MaxYears: number = 5 // TODO: more images

          const y: number = displayStore.getState().y

          txt = y > 0 ? pluralize("year", y, true) : pluralize("month", m, true)

          img = "/coins/"

          if (m === EighteenMonths) {
            img = `${img}18m.png`
          } else if (y > 0) {
            img = `${img}${y}y.png`
          } else {
            img = `${img}${m}m.png`
          }

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

  // biome-ignore lint/correctness/useExhaustiveDependencies(init): not a dependency
  // biome-ignore lint/correctness/useExhaustiveDependencies(setDisplay): not a dependency
  useEffect((): ReturnType<EffectCallback> => {
    init()

    const interval: NodeJS.Timeout = setInterval((): void => {
      if (!showCounter.current) {
        showCounter.current = true
      }

      setDisplay(selectedSubstance.date)
    }, ms("1s"))

    return (): void => clearInterval(interval)
  }, [
    selectedSubstance.date
  ])

  return (
    <>
      <Modal centered={true} onClose={closeLogin} opened={openedLogin} size="auto" withCloseButton={false}>
        <Tooltip label="Name" withArrow={true}>
          <TextInput
            {...nameField.getInputProps()}
            label="Name"
            maxLength={MAX_LEN_STR}
            onChange={handleNameChange}
            onKeyDown={handleNameChangeKeyDown}
            placeholder="Enter name..."
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
      </Modal>
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
              <Anchor c="blue" onClick={handleLogout} underline="never">
                {soberUser}
              </Anchor>
            </Tooltip>
          </Text>
        ) : (
          getLoginButton()
        )}
      </Group>
      {/* biome-ignore lint/correctness/useUniqueElementIds: needed for CSS */}
      <Modal.Root centered id="settings" onClose={closeSettings} opened={openedSettings} size="auto">
        <Modal.Overlay />
        <Modal.Content>
          <Modal.Header>
            <Modal.Title>Settings</Modal.Title>
            <Tooltip label="Close" withArrow>
              <Modal.CloseButton />
            </Tooltip>
          </Modal.Header>
          <Modal.Body>
            <Stack>
              <Switch
                checked={userData?.showCoin ?? true}
                color="var(--color-blue)"
                description="Display AA coin"
                label="Show Coin"
                offLabel="OFF"
                onChange={handleShowCoin}
                onLabel="ON"
                size="md"
              />
              <Switch
                checked={userData?.showCost ?? true}
                color="var(--color-blue)"
                description="Display weekly cost"
                label="Show Cost"
                offLabel="OFF"
                onChange={handleShowCost}
                onLabel="ON"
                size="md"
              />
              <NumberInput
                {...costField.getInputProps()}
                allowDecimal
                allowNegative={false}
                decimalScale={2}
                disabled={!userData?.showCost}
                fixedDecimalScale
                hideControls
                label="Cost Per Week"
                leftSection={<IconCurrencyDollar color="var(--color-red)" size={16} />}
                min={0}
                onChange={handleCostChange}
                onKeyDown={handleCostKeyDown}
                placeholder="Enter cost..."
                rightSection={
                  <>
                    <Tooltip label="Confirm" withArrow={true}>
                      <IconCheck
                        color="green"
                        onClick={handleCostConfirm}
                        size={16}
                        style={{
                          cursor: Number(costValue ?? null) === 0 ? "not-allowed" : "pointer",
                          flexShrink: 0,
                          marginRight: "5px"
                        }}
                      />
                    </Tooltip>
                    <Tooltip label="Cancel" withArrow={true}>
                      <IconX
                        color="red"
                        onClick={handleCostCancel}
                        size={16}
                        style={{
                          cursor: "pointer",
                          flexShrink: 0,
                          marginRight: "30px"
                        }}
                      />
                    </Tooltip>
                  </>
                }
                withAsterisk={true}
              />
            </Stack>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
      {soberUser ? (
        <>
          <Tooltip label="Settings" withArrow>
            <ActionIcon
              data-testid="settings"
              onClick={handleOpenSettings}
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
            selectedSubstance={selectedSubstance}
            setSelectedSubstance={setSelectedSubstance}
            substances={getSubstancesDisplay()}
            user={userValue}
          />
          <Center>
            <Stack>
              <Center>
                <Box mb={20}>
                  <Tooltip label="Enter your sobriety date" withArrow>
                    <DatePickerInput
                      c="var(--color-blue)"
                      className="sober-date"
                      data-testid="datepicker"
                      disabled={substances?.length === 0}
                      label="Sober since:"
                      leftSection={<IconCalendar color="var(--color-red)" size={16} />}
                      maxDate={dayjs().toDate()}
                      mb={20}
                      mt={50}
                      onChange={handleChangeDate}
                      popoverProps={{
                        withinPortal: true
                      }}
                      ta="center"
                      value={selectedSubstance.date}
                      valueFormat="dddd, MMMM Do, YYYY"
                      w={250}
                    />
                  </Tooltip>
                </Box>
              </Center>
              {showCounter.current ? (
                <Stack align="center" c="var(--color-blue)" ff="var(--font-counters)" fw="bold" fz="h1" gap="xs">
                  <Box>{seconds}</Box>
                  <Box>{minutes}</Box>
                  <Box>{hours}</Box>
                  <Box>{days}</Box>
                  <Box>{weeks}</Box>
                  <Box>{months}</Box>
                  <Box>{years}</Box>
                </Stack>
              ) : null}
              {userData?.showCost && cost ? (
                <Center mt={20}>
                  <Text c="var(--color-red)" fw="bold" inline mr={10} size="xl">
                    Savings:
                  </Text>
                  <Tooltip
                    label={
                      <Text fs="italic" fw="bold" size="sm">
                        {cost.costPerDay}
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
                      <NumberFormatter decimalScale={2} prefix="$" thousandSeparator="," value={cost.cost} />
                    </Text>
                  </Tooltip>
                </Center>
              ) : null}
              {userData?.showCoin && coin ? (
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
                      <Text c="var(--color-blue)" fw="bold" size="lg">
                        {coin.text}
                      </Text>
                      {coin.image ? <Image src={coin.image} title={coin.text} /> : null}
                    </Stack>
                  </Modal>
                  <Tooltip label="Show Coin" withArrow>
                    <Button
                      c="var(--color-black)"
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
