import { type ChangeEvent, type JSX, useState } from "react"

import {
  IconCalendar,
  IconCalendarClock,
  IconCalendarDue,
  IconCalendarEvent,
  IconCalendarMonth,
  IconCalendarWeek,
  IconCircleOff,
  IconClock,
  IconHourglass,
  IconPigMoney,
  IconStopwatch
} from "@tabler/icons-react"

import {
  Box,
  Checkbox,
  Grid,
  Group,
  NumberFormatter,
  Paper,
  RollingNumber,
  Stack,
  Text,
  Title,
  Tooltip
} from "@mantine/core"
import { DateTimePicker } from "@mantine/dates"
import { useDisclosure } from "@mantine/hooks"

import { info } from "@postfmly/logger"
import { type Nullable } from "@postfmly/types"

import { default as dayjs } from "dayjs"

import { Coin } from "../components/Coin.tsx"
import { Substances } from "../components/Substances.tsx"
import { env } from "./../env.ts"
import { fetchClient } from "../services/fetchClient.ts"
import {
  useCost,
  useDays,
  useFortnights,
  useHours,
  useMinutes,
  useMonths,
  useSeconds,
  useWeeks,
  useYears
} from "../utils/displayStore.ts"
import { Endpoint, HttpMethod, Metric, validate } from "../utils/index.ts"
import { type IDisplayStats } from "../utils/interfaces/IDisplay.ts"
import { type IFetchClientSettings } from "../utils/interfaces/IFetchClientSettings.ts"
import { type IMetric } from "../utils/interfaces/IMetric.ts"
import { type ISubstance, SubstanceSchema } from "../utils/interfaces/ISubstance.ts"
import { type ISubstancesProps } from "../utils/interfaces/ISubstancesProps.ts"
import {
  DATETIME_FORMAT,
  DATETIME_FORMAT_OUTPUT,
  DATETIME_FORMAT_SHORT_OUTPUT,
  DateTimeSchema
} from "../utils/schemas.ts"

import "@mantine/dates/styles.css"
import "./Home.css"

const metrics: IMetric[] = [
  {
    icon: IconStopwatch,
    label: Metric.Seconds
  },
  {
    icon: IconClock,
    label: Metric.Minutes
  },
  {
    icon: IconHourglass,
    label: Metric.Hours
  },
  {
    icon: IconCalendarEvent,
    label: Metric.Days
  },
  {
    icon: IconCalendarWeek,
    label: Metric.Weeks
  },
  {
    icon: IconCalendarDue,
    label: Metric.Fortnights
  },
  {
    icon: IconCalendarMonth,
    label: Metric.Months
  },
  {
    icon: IconCalendar,
    label: Metric.Years
  }
] as const

export const Home = ({
  allSubstances,
  refreshSubstances,
  selectedSubstance,
  setSelectedSubstance,
  substances,
  user
}: ISubstancesProps): JSX.Element => {
  const [openedCoin, { open: openCoin, close: closeCoin }] = useDisclosure(false)

  const cost = useCost()

  const [updatingDate, setUpdatingDate] = useState(false)

  const handleChangeDate = async (datetime: Nullable<string>, isShowTime?: boolean): Promise<void> => {
    const { id } = selectedSubstance

    if (!user || id === undefined || datetime === null || updatingDate) {
      return
    }

    const formattedDate = dayjs(datetime).format(DATETIME_FORMAT) // convert from output format

    const date = validate(formattedDate, DateTimeSchema)
    if (!date) {
      return
    }

    try {
      const data = await fetchClient(
        {
          body: {
            ...selectedSubstance,
            date,
            showTime: isShowTime ?? selectedSubstance.showTime
          } satisfies ISubstance,
          endpoint: Endpoint.UpdateSubstance,
          id,
          method: HttpMethod.PUT,
          user
        } satisfies IFetchClientSettings,
        SubstanceSchema
      )

      if (!data) {
        return
      }

      setSelectedSubstance(data)

      await refreshSubstances()

      if (env.DEBUG) {
        info(`New sober date for ${data.name}: ${date}`)
      }
    } finally {
      setUpdatingDate(false)
    }
  }

  const handleSetTime = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const { checked } = e.currentTarget

    const now = dayjs()

    const newDate = checked
      ? dayjs(selectedSubstance.date)
          .set("hour", now.hour())
          .set("minute", now.minute())
          .set("second", now.second())
          .set("millisecond", now.millisecond())
          .format(DATETIME_FORMAT)
      : dayjs(selectedSubstance.date).startOf("day").format(DATETIME_FORMAT)

    await handleChangeDate(newDate, checked)
  }

  const stats: IDisplayStats = {
    days: useDays(),
    fortnights: useFortnights(),
    hours: useHours(),
    minutes: useMinutes(),
    months: useMonths(),
    seconds: useSeconds(),
    weeks: useWeeks(),
    years: useYears()
  }

  return (
    <Stack>
      <Grid>
        <Grid.Col
          span={{
            base: 12,
            md: 5
          }}>
          <Substances
            allSubstances={allSubstances}
            isHome={true}
            refreshSubstances={refreshSubstances}
            selectedSubstance={selectedSubstance}
            setSelectedSubstance={setSelectedSubstance}
            substances={substances}
            user={user}
          />
        </Grid.Col>
        <Grid.Col
          span={{
            base: 12,
            md: 7
          }}>
          <Paper h="100%">
            <Stack>
              <Group wrap="nowrap">
                <IconCalendarClock size={20} />
                <Text c="var(--text-primary)" fw="bold">
                  {"Sober Since".toUpperCase()}
                </Text>
              </Group>
              <Tooltip label="Set Sober Date">
                <DateTimePicker
                  disabled={!selectedSubstance.name || updatingDate}
                  dropdownType="modal"
                  firstDayOfWeek={0}
                  highlightToday={true}
                  maxDate={dayjs().toDate()}
                  onChange={async (val: Nullable<string>): Promise<void> => {
                    if (val !== null) {
                      await handleChangeDate(val)
                    }
                  }}
                  pointer={true}
                  styles={{
                    calendarHeaderLevel: {
                      backgroundColor: "var(--bg-primary)"
                    },
                    input: {
                      textAlign: "center"
                    },
                    submitButton: {
                      backgroundColor: "var(--bg-primary)"
                    }
                  }}
                  timePickerProps={{
                    clearable: true,
                    disabled: !selectedSubstance.showTime || updatingDate,
                    format: "12h",
                    leftSection: (
                      <Tooltip label="Set time?">
                        <Checkbox
                          checked={selectedSubstance.showTime}
                          disabled={updatingDate}
                          onChange={handleSetTime}
                        />
                      </Tooltip>
                    ),
                    withDropdown: true,
                    styles: {
                      dropdown: {
                        backgroundColor: "var(--bg-primary)"
                      },
                      input: {
                        backgroundColor: "var(--bg-primary)"
                      }
                    }
                  }}
                  value={selectedSubstance.date}
                  valueFormat={selectedSubstance.showTime ? DATETIME_FORMAT_OUTPUT : DATETIME_FORMAT_SHORT_OUTPUT}
                />
              </Tooltip>
              <Text c="var(--text-muted)" fs="italic" size="xxs" ta="center">
                Click to set sober date
              </Text>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
      <Grid>
        {metrics.map((metric: IMetric): JSX.Element => {
          const Icon = metric.icon

          return (
            <Grid.Col
              key={metric.label}
              span={{
                base: 6,
                lg: 3
              }}>
              <Paper h="100%">
                <Group align="center" wrap="nowrap">
                  <Box
                    bdrs={999}
                    bg={`var(--bg-${metric.label})`}
                    c={`var(--text-${metric.label})`}
                    display="flex"
                    h={48}
                    style={{
                      alignItems: "center",
                      flexShrink: 0,
                      justifyContent: "center"
                    }}
                    visibleFrom="sm"
                    w={48}>
                    <Icon size={32} />
                  </Box>
                  <Stack miw={0}>
                    <Text c="var(--text-secondary)" fw="bold" lts={1} size="xs">
                      {metric.label.toUpperCase()}
                    </Text>
                    <Title
                      c={`var(--text-${metric.label})`}
                      style={{
                        fontVariantNumeric: "tabular-nums"
                      }}>
                      {stats[metric.label] === 0 ? (
                        <IconCircleOff
                          style={{
                            height: "clamp(1rem, 2vw, 1.5rem)",
                            width: "clamp(1rem, 2vw, 1.5rem)"
                          }}
                        />
                      ) : (
                        <RollingNumber thousandSeparator={true} value={stats[metric.label]} />
                      )}
                    </Title>
                  </Stack>
                </Group>
              </Paper>
            </Grid.Col>
          )
        })}
      </Grid>
      {selectedSubstance.showCost === true && cost && (
        <Paper bg="var(--gradient-savings)">
          <Group justify="center" wrap="nowrap">
            <Box
              bdrs={999}
              bg="var(--bg-savings)"
              c="var(--text-savings)"
              display="flex"
              h={48}
              style={{
                alignItems: "center",
                flexShrink: 0,
                justifyContent: "center"
              }}
              visibleFrom="sm"
              w={48}>
              <IconPigMoney size={32} />
            </Box>
            <Stack>
              <Text c="var(--text-secondary)" fw="bold" lts={1} size="sm">
                ESTIMATED SAVINGS
              </Text>
              <Title c="var(--accent-green)" ta="center">
                <RollingNumber
                  decimalScale={2}
                  fixedDecimalScale={true}
                  prefix="$"
                  thousandSeparator={true}
                  value={cost.cost}
                />
              </Title>
              <Text c="var(--text-secondary)" fs="italic" size="xxs" ta="center">
                Based on{" "}
                <NumberFormatter
                  decimalScale={2}
                  fixedDecimalScale={true}
                  prefix="$"
                  thousandSeparator={true}
                  value={cost.costPer}
                />{" "}
                per {cost.costType}
              </Text>
            </Stack>
          </Group>
        </Paper>
      )}
      {selectedSubstance.showCoin === true && stats.months > 0 && (
        <Coin
          closeCoin={closeCoin}
          months={Math.trunc(stats.months)}
          openCoin={openCoin}
          openedCoin={openedCoin}
          years={Math.trunc(stats.years)}
        />
      )}
    </Stack>
  )
}
