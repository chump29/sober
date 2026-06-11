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
import { default as dayjs } from "dayjs"
import { default as advancedFormat } from "dayjs/plugin/advancedFormat"
import { default as duration } from "dayjs/plugin/duration"
import { default as timezone } from "dayjs/plugin/timezone"
import { default as utc } from "dayjs/plugin/utc"
import { default as ms } from "ms"
import { type SafeParseResult, safeParse } from "valibot"

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
import { type ISoberDate, SoberDateSchema } from "../shared/interfaces/ISoberDate.ts"
import { DateSchema, StringAsBooleanSchema } from "../shared/schemas.ts"

import "./index.css"

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(duration)
dayjs.extend(advancedFormat)

const d: SafeParseResult<StringAsBooleanSchema> = safeParse(StringAsBooleanSchema, import.meta.env.VITE_DEBUG)
const DEBUG: boolean = d.success ? d.output : false
if (DEBUG) {
  info("Debug is ON")
}

dayjs.tz.setDefault(dayjs.tz.guess())
if (DEBUG) {
  info(`Timezone set to: ${dayjs.tz.guess()}`)
}

const defaultSoberDate: ISoberDate = {
  cost: undefined,
  date: dayjs().format("YYYY-MM-DD"),
  showCoin: true,
  showCost: true
} satisfies ISoberDate

const Display = (): JSX.Element => {
  const { setDisplay } = displayStoreActions()

  const [soberDate, setSoberDate] = useLocalStorage<ISoberDate | undefined>({
    defaultValue: defaultSoberDate,
    key: "soberDate",
    deserialize: (soberDate: string | undefined): ISoberDate | undefined => {
      if (!soberDate) {
        return undefined
      }

      const s: SafeParseResult<SoberDateSchema> = safeParse(SoberDateSchema, JSON.parse(soberDate))
      if (s.success) {
        return s.output
      }

      error(s.issues)

      return undefined
    }
  })

  const coin: RefObject<ICoin | null> = useRef<ICoin>(null)
  const cost: RefObject<number> = useRef<number>(0)

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

  const init = async (): Promise<void> => {
    await new Promise((resolve): void => {
      setDisplay(soberDate?.date)

      resolve(null)
    })
      .then(async (): Promise<void> => {
        const weeks: number = displayStore.getState().w

        if (weeks > 0) {
          cost.current = weeks * (soberDate?.cost ?? 0)
        }
      })
      .then(async (): Promise<void> => {
        const MAX_YEARS: number = 5 // ! TODO: more images
        const EIGHTEEN_MONTHS: number = 18

        let txt: string = "No milestones to show yet"
        let img: string | undefined = undefined

        const months: number = displayStore.getState().m
        const years: number = displayStore.getState().y

        if (months > 0) {
          txt = years > 0 ? pluralize("year", years, true) : pluralize("month", months, true)

          img = "/coins/"

          if (months === EIGHTEEN_MONTHS) {
            img = `${img}18m.png`
          } else if (years > 0) {
            img = `${img}${years}y.png`
          } else {
            img = `${img}${months}m.png`
          }

          if (years > MAX_YEARS) {
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
      <Modal centered id="settings" onClose={closeSettings} opened={openedSettings} size="auto" title="Settings">
        <Stack>
          <Switch
            checked={soberDate?.showCoin ?? false}
            color="var(--color-blue)"
            description="Display AA coin"
            label="Show Coin"
            offLabel="OFF"
            onChange={(event: ChangeEvent<HTMLInputElement>): void =>
              setSoberDate({
                ...soberDate,
                showCoin: event.currentTarget.checked
              } as ISoberDate)
            }
            onLabel="ON"
            size="md"
          />
          <Switch
            checked={soberDate?.showCost ?? false}
            color="var(--color-blue)"
            description="Display weekly cost"
            label="Show Cost"
            offLabel="OFF"
            onChange={(event: ChangeEvent<HTMLInputElement>): void =>
              setSoberDate({
                ...soberDate,
                showCost: event.currentTarget.checked
              } as ISoberDate)
            }
            onLabel="ON"
            size="md"
          />
          <NumberInput
            allowDecimal={true}
            allowNegative={false}
            decimalScale={2}
            disabled={!(soberDate?.showCost ?? false)}
            error={!(soberDate?.cost ?? 0)}
            fixedDecimalScale
            hideControls
            label="Cost Per Week"
            leftSection={<IconCurrencyDollar color="var(--color-red)" size={16} />}
            min={0}
            onChange={(value: number | string): void =>
              setSoberDate({
                ...soberDate,
                cost: +value
              } as ISoberDate)
            }
            placeholder="Enter cost..."
            value={soberDate?.cost ?? 0}
            withAsterisk
          />
        </Stack>
      </Modal>
      <Tooltip label="Settings" withArrow>
        <ActionIcon
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
                  label="Sober Since:"
                  leftSection={<IconCalendar color="var(--color-red)" size={16} />}
                  maxDate={dayjs().toDate()}
                  mb={20}
                  mt={50}
                  onChange={handleChange}
                  popoverProps={{
                    withinPortal: true
                  }}
                  style={{
                    cursor: "pointer"
                  }}
                  value={soberDate?.date}
                  valueFormat="dddd, MMMM Do, YYYY"
                  w={250}
                />
              </Tooltip>
            </Box>
          </Center>
          <Stack align="center" c="var(--color-blue)" ff="var(--font-counter)" fw="bold" fz="h1" gap="xs">
            <Box>{seconds()}</Box>
            <Box>{minutes()}</Box>
            <Box>{hours()}</Box>
            <Box>{days()}</Box>
            <Box>{weeks()}</Box>
            <Box>{months()}</Box>
            <Box>{years()}</Box>
          </Stack>
          {soberDate?.showCost && cost.current ? (
            <Center mt={20}>
              <Text c="var(--color-red)" fw="bold" inline mr={10} size="xl">
                Total Savings:
              </Text>
              <Text c="var(--color-green)" ff="var(--font-counter)" fw="bold" inline size="xl">
                <NumberFormatter decimalScale={2} prefix="$" thousandSeparator="," value={cost.current} />
              </Text>
              <Text
                c="var(--color-yellow)"
                ml={5}
                size="xs"
                style={{
                  fontVariantPosition: "super"
                }}>
                <NumberFormatter
                  decimalScale={2}
                  prefix="@ $"
                  suffix="/week"
                  thousandSeparator=","
                  value={soberDate.cost}
                />
              </Text>
            </Center>
          ) : null}
          {soberDate?.showCoin && coin.current ? (
            <>
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
      {/*{showCost ? <Cost cost={cost} days={parseInt(days)} showCost={showCost} /> : null}*/}
      {/*{showCoin ? <Coin months={parseInt(months)} showCoin={showCoin} years={parseInt(years)} /> : null}*/}
    </>
  )
}

export default Display
