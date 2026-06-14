import { type ChangeEvent, type EffectCallback, type JSX, type RefObject, useEffect, useRef } from "react"

import { error, info } from "@postfmly/logger"

import { default as pluralize } from "@jarrodek/pluralize"
import {
  ActionIcon,
  Box,
  Button,
  Center,
  Image,
  Modal,
  NumberFormatter,
  NumberInput,
  Stack,
  Switch,
  Text,
  Tooltip
} from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"
import { useDisclosure, useLocalStorage } from "@mantine/hooks"
import { IconCalendar, IconCurrencyDollar, IconSettings } from "@tabler/icons-react"
import { Big } from "big.js"
import { default as dayjs } from "dayjs"
import { default as advancedFormat } from "dayjs/plugin/advancedFormat"
import { default as duration } from "dayjs/plugin/duration"
import { default as timezone } from "dayjs/plugin/timezone"
import { default as utc } from "dayjs/plugin/utc"
import { default as ms } from "ms"
import { type SafeParseResult, safeParse, summarize } from "valibot"

import {
  days,
  displayStore,
  displayStoreActions,
  hours,
  minutes,
  months,
  seconds,
  weeks,
  years
} from "../shared/displayStore.ts"
import { type ICoin } from "../shared/interfaces/ICoin.ts"
import { type ICost } from "../shared/interfaces/ICost.ts"
import { type ICustomCloseButtonProps } from "../shared/interfaces/ICustomCloseButtonProps.ts"
import { type ISoberDate, SoberDateSchema } from "../shared/interfaces/ISoberDate.ts"
import { DATE_FORMAT, DateSchema, StringAsBooleanSchema } from "../shared/schemas.ts"

import "./index.css"

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(duration)
dayjs.extend(advancedFormat)

const debug: SafeParseResult<StringAsBooleanSchema> = safeParse(StringAsBooleanSchema, import.meta.env.VITE_DEBUG)
const DEBUG: boolean = debug.success ? debug.output : false
if (DEBUG) {
  info("Debug is ON")
}

dayjs.tz.setDefault(dayjs.tz.guess())
if (DEBUG) {
  info(`Timezone set to: ${dayjs.tz.guess()}`)
}

const defaultSoberDate: ISoberDate = {
  cost: undefined,
  date: dayjs().format(DATE_FORMAT),
  showCoin: true,
  showCost: true
} satisfies ISoberDate

const Display = (): JSX.Element => {
  const { setDisplay } = displayStoreActions()

  const [soberDate, setSoberDate] = useLocalStorage<ISoberDate | undefined>({
    defaultValue: defaultSoberDate,
    key: "soberDate",
    deserialize: (strSoberDate: string | undefined): ISoberDate | undefined => {
      if (!strSoberDate) {
        return
      }

      const s: SafeParseResult<SoberDateSchema> = safeParse(SoberDateSchema, JSON.parse(strSoberDate))
      if (s.success) {
        return s.output
      }

      throw new Error(summarize(s.issues))
    }
  })

  const coin: RefObject<ICoin | null> = useRef<ICoin | null>(null)
  const cost: RefObject<ICost | null> = useRef<ICost | null>(null)

  const [openedSettings, { open: openSettings, close: closeSettings }] = useDisclosure(false)
  const [openedCoin, { open: openCoin, close: closeCoin }] = useDisclosure(false)

  const handleChange = (date: string | null): void => {
    const d: SafeParseResult<DateSchema> = safeParse(DateSchema, date)
    if (d.success) {
      setSoberDate({
        ...soberDate,
        date: d.output
      } as ISoberDate)

      if (DEBUG) {
        info(`New sober date: ${d.output}`)
      }
    } else {
      error(d.issues)
    }
  }

  const handleShowCoin = (event: ChangeEvent<HTMLInputElement>): void =>
    setSoberDate({
      ...soberDate,
      showCoin: event.currentTarget.checked
    } as ISoberDate)

  const handleShowCost = (event: ChangeEvent<HTMLInputElement>): void =>
    setSoberDate({
      ...soberDate,
      showCost: event.currentTarget.checked
    } as ISoberDate)

  const handleSoberDate = (value: number | string): void =>
    setSoberDate({
      ...soberDate,
      cost: Number(value)
    } as ISoberDate)

  const init = async (): Promise<void> => {
    await new Promise((resolve): void => {
      setDisplay(soberDate?.date)

      resolve(null)
    })
      .then((): void => {
        const d: number = displayStore.getState().d

        const soberDataCost: number = soberDate?.cost ?? 0

        if (d > 0 && soberDataCost > 0) {
          const DaysPerWeek: number = 7

          const costPerDay: number = soberDataCost / DaysPerWeek

          cost.current = {
            cost: d * costPerDay,
            costPerDay: `Cost per day: $${new Big(costPerDay).toFixed(2, 0)}`
          } satisfies ICost
        }
      })
      .then((): void => {
        let txt: string = "No milestones to show yet"
        let img: string | undefined

        const m: number = displayStore.getState().m

        if (m > 0) {
          const EighteenMonths: number = 18
          const MaxYears: number = 5 // ! TODO: more images

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

        coin.current = {
          image: img,
          text: txt
        } satisfies ICoin
      })
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies(init): not a dependency
  // biome-ignore lint/correctness/useExhaustiveDependencies(setDisplay): not a dependency
  useEffect((): ReturnType<EffectCallback> => {
    init()

    const interval: NodeJS.Timeout = setInterval((): void => {
      setDisplay(soberDate?.date)
    }, ms("1s"))

    return (): void => clearInterval(interval)
  }, [
    soberDate
  ])

  return (
    <>
      {/** biome-ignore lint/correctness/useUniqueElementIds: needed for CSS */}
      <Modal
        centered
        closeButtonProps={
          {
            "data-testid": "testCloseSettings"
          } as ICustomCloseButtonProps
        }
        data-testid="testSettingsModal"
        id="settings"
        onClose={closeSettings}
        opened={openedSettings}
        size="auto"
        title="Settings">
        <Stack>
          <Switch
            checked={soberDate?.showCoin ?? false}
            color="var(--color-blue)"
            data-testid="testShowCoin"
            description="Display AA coin"
            label="Show Coin"
            offLabel="OFF"
            onChange={handleShowCoin}
            onLabel="ON"
            size="md"
          />
          <Switch
            checked={soberDate?.showCost ?? false}
            color="var(--color-blue)"
            data-testid="testShowCost"
            description="Display weekly cost"
            label="Show Cost"
            offLabel="OFF"
            onChange={handleShowCost}
            onLabel="ON"
            size="md"
          />
          <NumberInput
            allowDecimal
            allowNegative={false}
            decimalScale={2}
            disabled={!(soberDate?.showCost ?? false)}
            error={!(soberDate?.cost ?? 0)}
            fixedDecimalScale
            hideControls
            label="Cost Per Week"
            leftSection={<IconCurrencyDollar color="var(--color-red)" size={16} />}
            min={0}
            onChange={handleSoberDate}
            placeholder="Enter cost..."
            value={soberDate?.cost ?? 0}
            withAsterisk
          />
        </Stack>
      </Modal>
      <Tooltip label="Settings" withArrow>
        <ActionIcon
          data-testid="testSettings"
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
      <Center>
        <Stack>
          <Center>
            <Box mb={20}>
              <Tooltip label="Enter your sobriety date" withArrow>
                <DatePickerInput
                  c="var(--color-blue)"
                  className="sober-date"
                  data-testid="testSoberDate"
                  label="Sober Since:"
                  leftSection={<IconCalendar color="var(--color-red)" size={16} />}
                  maxDate={dayjs().toDate()}
                  mb={20}
                  mt={50}
                  onChange={handleChange}
                  popoverProps={{
                    withinPortal: true
                  }}
                  value={soberDate?.date}
                  valueFormat="dddd, MMMM Do, YYYY"
                  w={250}
                />
              </Tooltip>
            </Box>
          </Center>
          <Stack
            align="center"
            c="var(--color-blue)"
            data-testid="testCounters"
            ff="var(--font-counters)"
            fw="bold"
            fz="h1"
            gap="xs">
            <Box>{seconds()}</Box>
            <Box>{minutes()}</Box>
            <Box>{hours()}</Box>
            <Box>{days()}</Box>
            <Box>{weeks()}</Box>
            <Box>{months()}</Box>
            <Box>{years()}</Box>
          </Stack>
          {soberDate?.showCost && cost.current ? (
            <Center data-testid="testCost" mt={20}>
              <Text c="var(--color-red)" fw="bold" inline mr={10} size="xl">
                Savings:
              </Text>
              <Tooltip label={cost.current.costPerDay} withArrow>
                <Text
                  c="var(--color-green)"
                  ff="var(--font-counters)"
                  fw="bold"
                  inline
                  size="xl"
                  style={{
                    cursor: "pointer"
                  }}>
                  <NumberFormatter decimalScale={2} prefix="$" thousandSeparator="," value={cost.current.cost} />
                </Text>
              </Tooltip>
            </Center>
          ) : null}
          {soberDate?.showCoin && coin.current ? (
            <>
              {/** biome-ignore lint/correctness/useUniqueElementIds: needed for CSS */}
              <Modal centered id="coin" onClose={closeCoin} opened={openedCoin} size="auto" title="AA Coin">
                <Stack ta="center">
                  <Text c="var(--color-blue)" fw="bold" size="xl">
                    {coin.current.text}
                  </Text>
                  {coin.current.image ? <Image src={coin.current.image} title={coin.current.text} /> : null}
                </Stack>
              </Modal>
              <Tooltip label="Show Coin" withArrow>
                <Button
                  c="var(--color-black)"
                  data-testid="testCoin"
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
  )
}

export default Display
