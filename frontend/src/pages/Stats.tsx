// cSpell: ignore mehta,niaaa

import { type JSX } from "react"

import {
  IconCalendarEvent,
  IconChartLine,
  IconCircleOff,
  IconInfoCircleFilled,
  IconPigMoney,
  IconRibbonHealth
} from "@tabler/icons-react"

import { LineChart } from "@mantine/charts"
import {
  Box,
  Group,
  NumberFormatter,
  Paper,
  Progress,
  RollingNumber,
  SimpleGrid,
  Stack,
  Text,
  Title,
  Tooltip
} from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"

import { default as pluralize } from "@jarrodek/pluralize"
import { default as dayjs } from "dayjs"
import { match, P } from "ts-pattern"

import { Substances } from "../components/Substances.tsx"
import { calculateSavings, calculateStats, TIME } from "../utils/calc.ts"
import { currencyFormatter, FACTOR, Per, round } from "../utils/index.ts"
import { type IInterval } from "../utils/interfaces/IInterval.ts"
import { type ISavings } from "../utils/interfaces/ISavings.ts"
import { type IAlcohol, type IChart, type IHealth, type ISmoking, type IStat } from "../utils/interfaces/IStats.ts"
import { type ISubstancesProps } from "../utils/interfaces/ISubstancesProps.ts"
import { DATETIME_FORMAT_SHORT, StatsType } from "../utils/schemas.ts"

import "@mantine/charts/styles.css"

import { type Optional } from "@postfmly/types"

import { useMinutes } from "../utils/displayStore.ts"
import { type IHealthBarItem } from "../utils/interfaces/IHealthBarItem.ts"

const X_ANGLE = -45
const X_HEIGHT_MOBILE = 45
const X_HEIGHT = 70

const THREE_WIDE = 3

const DECIMALS = [
  { decimals: 8, max: 0.01 },
  { decimals: 6, max: 0.1 },
  { decimals: 4, max: 1 }
] as const

const DEFAULT_DECIMALS = 2

const getDecimalScale = (val: number): number => DECIMALS.find(({ max }) => val < max)?.decimals ?? DEFAULT_DECIMALS

// NOTE: Recovery percentages are modeled using standard exponential saturation curves (1 − e⁻ᵏᵗ)
// calibrated to clinical abstinence milestones from The Lancet (Wood et al., 2018), BMJ Open (Mehta et al., 2018),
// NIAAA/PMC organ recovery reviews, and CDC/American Cancer Society smoking cessation timelines.
const K = {
  [StatsType.Alcohol]: {
    BLOOD_PRESSURE: 0.012,
    LONG_TERM: 0.0015,
    OVERALL: 0.0055,
    SLEEP: 0.1
  },
  [StatsType.Smoking]: {
    LONG_TERM: 0.0019,
    LUNG_FUNCTION: 0.0111,
    OVERALL: 0.0052,
    OXYGENATION: 0.214
  }
} as const

const recovery = (k: number, days: number): number => round(FACTOR * (1 - Math.exp(-k * days)))

const health = (type: StatsType, days: number): Optional<IHealth> => {
  if (days === 0) {
    return undefined
  }

  return match<StatsType, Optional<IHealth>>(type)
    .with(StatsType.None, () => undefined)
    .with(StatsType.Alcohol, (): IAlcohol => {
      const rates = K[StatsType.Alcohol]

      return {
        bloodPressure: recovery(rates.BLOOD_PRESSURE, days),
        longTerm: recovery(rates.LONG_TERM, days),
        overall: recovery(rates.OVERALL, days),
        sleep: recovery(rates.SLEEP, days),
        type: StatsType.Alcohol
      } satisfies IAlcohol
    })
    .with(StatsType.Smoking, (): ISmoking => {
      const rates = K[StatsType.Smoking]

      return {
        longTerm: recovery(rates.LONG_TERM, days),
        lungFunction: recovery(rates.LUNG_FUNCTION, days),
        overall: recovery(rates.OVERALL, days),
        oxygenation: recovery(rates.OXYGENATION, days),
        type: StatsType.Smoking
      } satisfies ISmoking
    })
    .exhaustive()
}

// * NOTE: not being exact
const DAYS_IN_MONTH = 30
const DAYS_IN_TWO_MONTHS = 60
const DAYS_IN_QUARTER = 90
const DAYS_IN_HALF_YEAR = 180
const DAYS_IN_YEAR = 365

const chart = (savings: ISavings, days: number, isMobile: boolean): IChart[] => {
  const intDays = Math.trunc(days)

  const milestones: IChart[] = [
    { days: 1, label: "1 Day", savings: savings.day },
    { days: TIME.DAYS_PER_WEEK, label: "1 Week", savings: savings.week },
    { days: DAYS_IN_MONTH, label: "30 Days", savings: savings.month },
    { days: DAYS_IN_TWO_MONTHS, label: "60 Days", savings: savings.months2 },
    { days: DAYS_IN_QUARTER, label: "90 Days", savings: savings.months3 },
    { days: DAYS_IN_HALF_YEAR, label: "6 Months", savings: savings.months6 },
    { days: DAYS_IN_YEAR, label: "1 Year", savings: savings.year }
  ].filter((milestone: IChart): boolean => milestone.days !== intDays)

  return [
    ...milestones,
    { days, label: isMobile ? "Today" : `Today (${pluralize("Day", intDays, true)})`, savings: savings.today },
    { days: intDays + TIME.DAYS_PER_YEAR, label: isMobile ? "+1 Year" : "1 Year From Now", savings: savings.next }
  ].sort((a: IChart, b: IChart): number => a.days - b.days)
}

const HealthBars = ({ items }: { items: IHealthBarItem[] }): JSX.Element => (
  <Stack gap="xs">
    {items.map(
      (item: IHealthBarItem): JSX.Element => (
        <Box key={item.label}>
          <Text size="xs">{item.label}</Text>
          <Tooltip label={item.tooltip}>
            <Progress.Root>
              <Progress.Section value={item.value}>
                {item.value >= 10 && <Progress.Label>{item.value}%</Progress.Label>}
              </Progress.Section>
            </Progress.Root>
          </Tooltip>
        </Box>
      )
    )}
  </Stack>
)

const Stat = (stat: IStat): JSX.Element => {
  const Icon = stat.icon

  const statValue = match<Pick<IStat, "isMoney" | "value">, JSX.Element>(stat)
    .with({ value: 0 }, () => (
      <IconCircleOff
        style={{
          height: "clamp(1rem, 2vw, 1.5rem)",
          width: "clamp(1rem, 2vw, 1.5rem)"
        }}
      />
    ))
    .with({ isMoney: true, value: P.number }, ({ value }) => (
      <RollingNumber decimalScale={2} fixedDecimalScale={true} prefix="$" thousandSeparator={true} value={value} />
    ))
    .with({ value: P.number }, ({ value }) => <RollingNumber thousandSeparator={true} value={value} />)
    .with({ value: { type: StatsType.Alcohol } }, ({ value }) => (
      <HealthBars
        items={[
          {
            label: "Sleep & Metabolic Gain",
            tooltip: "Sleep architecture, hydration, and insulin sensitivity gains",
            value: value.sleep
          },
          {
            label: "Organ & Blood Pressure Gain",
            tooltip: "Blood pressure reduction and liver fat reversal",
            value: value.bloodPressure
          },
          {
            label: "Long Term Risk Reduction",
            tooltip: "Long-term chronic disease risk reduction",
            value: value.longTerm
          },
          {
            label: "Overall Physiological Recovery",
            tooltip: "Composite recovery score across sleep, organ health, and long-term risk reduction",
            value: value.overall
          }
        ]}
      />
    ))
    .with({ value: { type: StatsType.Smoking } }, ({ value }) => (
      <HealthBars
        items={[
          {
            label: "Oxygenation & Circulation",
            tooltip: "Carbon monoxide clearance, nicotine detox, and taste/smell repair",
            value: value.oxygenation
          },
          {
            label: "Lung & Cilia Function",
            tooltip: "Bronchial relaxation, lung cilia regrowth, and reduced coughing",
            value: value.lungFunction
          },
          {
            label: "Heart & Vascular Risk Reduction",
            tooltip: "Long-term coronary heart disease and stroke risk reduction",
            value: value.longTerm
          },
          {
            label: "Overall Respiratory Recovery",
            tooltip: "Composite recovery score across oxygenation, lung cilia, and cardiovascular risk",
            value: value.overall
          }
        ]}
      />
    ))
    .with({ value: P.optional(undefined) }, () => <Text fs="italic">Healing in progress…</Text>)
    .exhaustive()

  const isHealthBars = typeof stat.value === "object" // not undefined | number

  return (
    <Paper h="100%">
      <Group align={isHealthBars ? "flex-start" : "center"} wrap="nowrap">
        <Box
          bdrs={999}
          bg={stat.bg}
          c={stat.color}
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
        <Stack miw={0} w="100%">
          <Text c="var(--text-secondary)" fw="bold" lts={1} size="xs">
            {stat.label.toUpperCase()}
          </Text>
          {isHealthBars ? (
            <Box c={stat.color}>{statValue}</Box>
          ) : (
            <Title
              c={stat.color}
              style={{
                fontVariantNumeric: "tabular-nums"
              }}>
              {statValue}
            </Title>
          )}
        </Stack>
      </Group>
      {stat.value === undefined ? null : (
        <Box pt={16}>
          <Group gap={8} pl={{ base: "md", md: "xl" }} wrap="nowrap">
            <IconInfoCircleFilled color="var(--text-secondary)" size={16} />
            <Text c="var(--text-muted)" size="xxs">
              {stat.description}
            </Text>
          </Group>
        </Box>
      )}
    </Paper>
  )
}

export const Stats = ({
  allSubstances,
  refreshSubstances,
  selectedSubstance,
  setSelectedSubstance,
  substances,
  user
}: ISubstancesProps): JSX.Element => {
  useMinutes() // trigger render every minute

  const isMobile = useMediaQuery("(max-width: 48em)")

  const now = dayjs()

  const stats = calculateStats(selectedSubstance.date, selectedSubstance.showDecimals, now)

  const savings = calculateSavings(selectedSubstance.date, selectedSubstance.cost, selectedSubstance.costType, now)

  const { days } = stats

  const dailyCost = savings.day

  const total = round(savings.today)

  const costs: IInterval[] = [
    {
      label: Per.Second,
      value: dailyCost / TIME.SECONDS_PER_DAY
    },
    {
      label: Per.Minute,
      value: dailyCost / TIME.MINUTES_PER_DAY
    },
    {
      label: Per.Hour,
      value: dailyCost / TIME.HOURS_PER_DAY
    },
    {
      label: Per.Day,
      value: dailyCost
    },
    {
      label: Per.Week,
      value: dailyCost * TIME.DAYS_PER_WEEK
    },
    {
      label: Per.Fortnight,
      value: dailyCost * TIME.DAYS_PER_FORTNIGHT
    },
    {
      label: Per.Month,
      value: dailyCost * TIME.DAYS_PER_MONTH
    },
    {
      label: Per.Year,
      value: dailyCost * TIME.DAYS_PER_YEAR
    }
  ]

  const scale = getDecimalScale(dailyCost)
  const formattedDailyCost =
    scale === DEFAULT_DECIMALS
      ? currencyFormatter.format(dailyCost)
      : new Intl.NumberFormat("en-US", {
          currency: "USD",
          maximumFractionDigits: scale,
          minimumFractionDigits: scale,
          style: "currency"
        }).format(dailyCost)

  return (
    <Stack>
      <Substances
        allSubstances={allSubstances}
        refreshSubstances={refreshSubstances}
        selectedSubstance={selectedSubstance}
        setSelectedSubstance={setSelectedSubstance}
        substances={substances}
        user={user}
      />
      <SimpleGrid cols={{ base: 1, md: selectedSubstance.showCost === true ? THREE_WIDE : 2 }}>
        <Stat
          bg="var(--bg-days)"
          color="var(--text-days)"
          description={`Since ${dayjs(selectedSubstance.date).format(DATETIME_FORMAT_SHORT)}`}
          icon={IconCalendarEvent}
          label="Days Sober"
          value={days}
        />
        {selectedSubstance.showCost === true && (
          <Stat
            bg="var(--bg-savings)"
            color="var(--text-savings)"
            description={`Based on ${formattedDailyCost} per day`}
            icon={IconPigMoney}
            isMoney={true}
            label="Money Saved"
            value={total}
          />
        )}
        <Stat
          bg="var(--bg-fortnights)"
          color="var(--text-fortnights)"
          description="Illustrative population-level estimates, not measured individual recovery or a clinical prediction."
          icon={IconRibbonHealth}
          label="Potential Health Gain"
          value={health(selectedSubstance.statsType, days)}
        />
      </SimpleGrid>
      {selectedSubstance.showCost === true && selectedSubstance.cost > 0 && (
        <Paper>
          <Stack gap="xl">
            <Group gap="sm" wrap="nowrap">
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
                <IconChartLine size={28} />
              </Box>
              <Stack miw={0}>
                <Title c="var(--text-secondary)">{"Savings Breakdown".toUpperCase()}</Title>
                <Text c="var(--text-muted)" size="xs">
                  Estimated savings based on your selected frequency and amount
                </Text>
              </Stack>
            </Group>
            <SimpleGrid cols={{ base: 1, sm: 2 }} p={16} spacing="xl">
              <LineChart
                curveType="monotone"
                data={chart(savings, days, isMobile)}
                dataKey="label"
                h={300}
                series={[{ color: "var(--text-savings)", label: "Savings", name: "savings" }]}
                styles={{
                  tooltip: {
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--text-primary)"
                  },
                  tooltipItemData: {
                    color: "var(--text-savings)"
                  },
                  tooltipItemName: {
                    color: "var(--text-muted)"
                  },
                  tooltipLabel: {
                    color: "var(--text-secondary)"
                  }
                }}
                tickLine="x"
                valueFormatter={(value: number): string => currencyFormatter.format(value)}
                withPointLabels={true}
                xAxisProps={{
                  height: isMobile ? X_HEIGHT_MOBILE : X_HEIGHT,
                  interval: isMobile ? 1 : 0,
                  tickMargin: 8,
                  tick: {
                    angle: isMobile ? 0 : X_ANGLE,
                    fill: "var(--text-muted)",
                    fontSize: 12,
                    textAnchor: isMobile ? "middle" : "end"
                  }
                }}
                yAxisProps={{
                  tickFormatter: (value: number): string => (value === 0 ? "" : currencyFormatter.format(value))
                }}
              />
              <Box pl={{ base: 0, sm: "xl" }}>
                <Paper>
                  <SimpleGrid cols={1} spacing={0}>
                    {costs.map(
                      (interval: IInterval, index: number): JSX.Element => (
                        <Group
                          bg={index % 2 === 1 ? "var(--bg-secondary)" : undefined}
                          justify="space-between"
                          key={interval.label}
                          px="sm"
                          py="xs"
                          w="100%"
                          wrap="nowrap">
                          <Text c="var(--text-secondary)" size="sm" style={{ whiteSpace: "nowrap" }}>
                            {interval.label}
                          </Text>
                          <NumberFormatter
                            decimalScale={getDecimalScale(interval.value)}
                            fixedDecimalScale={true}
                            prefix="$"
                            thousandSeparator={true}
                            value={interval.value}
                          />
                        </Group>
                      )
                    )}
                  </SimpleGrid>
                </Paper>
              </Box>
            </SimpleGrid>
          </Stack>
        </Paper>
      )}
    </Stack>
  )
}
