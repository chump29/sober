import { type EffectCallback, type JSX, useEffect } from "react"

import { error, info } from "@postfmly/logger"

import { ActionIcon, Box, Center, Stack, Tooltip } from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"
import { useLocalStorage } from "@mantine/hooks"
import { IconCalendar, IconSettings } from "@tabler/icons-react"
import { default as dayjs } from "dayjs"
import { default as advancedFormat } from "dayjs/plugin/advancedFormat"
import { default as duration } from "dayjs/plugin/duration"
import { default as timezone } from "dayjs/plugin/timezone"
import { default as utc } from "dayjs/plugin/utc"
import { default as ms } from "ms"
import { type SafeParseResult, safeParse } from "valibot"

import {
  days,
  displayStoreActions,
  hours,
  //loadedFromUrl,
  minutes,
  months,
  seconds,
  //showSettings,
  weeks,
  years
} from "../shared/displayStore.ts"
import { type ISoberDate, SoberDateSchema } from "../shared/ISoberDate.ts"
import { BooleanSchema, DateSchema } from "../shared/schemas.ts"

import "./index.css"

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(duration)
dayjs.extend(advancedFormat)

const d: SafeParseResult<BooleanSchema> = safeParse(BooleanSchema, import.meta.env.VITE_DEBUG)
const DEBUG: boolean = d.success ? d.output : false
if (DEBUG) {
  info("Debug is ON")
}

dayjs.tz.setDefault(dayjs.tz.guess())
if (DEBUG) {
  info(`Timezone set to: ${dayjs.tz.guess()}`)
}

const newSoberDate: ISoberDate = {
  cost: 0,
  date: dayjs().format("YYYY-MM-DD"),
  showCoin: true,
  showCost: true
} satisfies ISoberDate

const Display = (): JSX.Element => {
  const [soberDate, setSoberDate] = useLocalStorage<ISoberDate>({
    defaultValue: newSoberDate,
    key: "soberDate",
    deserialize: (val: string | undefined): ISoberDate => {
      if (!val) {
        return {} as ISoberDate
      }

      const s: SafeParseResult<SoberDateSchema> = safeParse(SoberDateSchema, JSON.parse(val))
      if (s.success) {
        return s.output
      } else {
        error(s.issues)
        return newSoberDate
      }
    }
  })

  const { setDisplay } = displayStoreActions()

  const handleChange = (date: string | null): void => {
    const d: SafeParseResult<DateSchema> = safeParse(DateSchema, date)
    if (d.success) {
      setSoberDate({
        ...soberDate,
        date: d.output
      })

      if (DEBUG) {
        info(`New sober date: ${d.output}`)
      }
    } else {
      error(d.issues)
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies(setDisplay): not a dependency
  useEffect((): ReturnType<EffectCallback> => {
    setDisplay(soberDate.date)

    const interval: NodeJS.Timeout = setInterval((): void => {
      setDisplay(soberDate.date)
    }, ms("1s"))

    return (): void => clearInterval(interval)
  }, [
    soberDate.date
  ])

  return (
    <>
      <Tooltip label="Settings" withArrow>
        <ActionIcon
          //onClick={handleSettings}
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
                  value={soberDate.date}
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
        </Stack>
      </Center>
      {/*{showCost ? <Cost cost={cost} days={parseInt(days)} showCost={showCost} /> : null}*/}
      {/*{showCoin ? <Coin months={parseInt(months)} showCoin={showCoin} years={parseInt(years)} /> : null}*/}
    </>
  )
}

export default Display
