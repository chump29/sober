import { type JSX } from "react"

import {
  IconChartLine,
  IconCircleCheckFilled,
  IconDots,
  IconInfoCircleFilled,
  IconLock,
  IconLockOpen2
} from "@tabler/icons-react"

import { Box, Group, Paper, Progress, SimpleGrid, Stack, Text, Title } from "@mantine/core"

import { type Dayjs, default as dayjs } from "dayjs"

import { Substances } from "../components/Substances.tsx"
import { TIME } from "../utils/calc.ts"
import { FACTOR, Milestone } from "../utils/index.ts"
import { type IMilestone, type IMilestoneDefinition } from "../utils/interfaces/IMilestone.ts"
import { type ISubstancesProps } from "../utils/interfaces/ISubstancesProps.ts"
import { DATETIME_FORMAT_MILESTONE, DATETIME_FORMAT_SHORT } from "../utils/schemas.ts"

const FIVE_YEARS = 5

const milestoneDefinitions: IMilestoneDefinition[] = [
  { days: 1, label: Milestone.Day },
  { days: TIME.DAYS_PER_WEEK, label: Milestone.Week },
  { days: TIME.DAYS_PER_FORTNIGHT, label: Milestone.Fortnight },
  { label: Milestone.Month, months: 1 },
  { label: Milestone.Months3, months: 3 },
  { label: Milestone.Months6, months: 6 },
  { label: Milestone.Year, months: TIME.MONTHS_PER_YEAR },
  { label: Milestone.Years2, months: TIME.MONTHS_PER_YEAR * 2 },
  { label: Milestone.Years5, months: TIME.MONTHS_PER_YEAR * FIVE_YEARS }
] as const

const addMonthsClamped = (date: Dayjs, months: number): Dayjs => {
  const day = date.date()
  const target = date.date(1).add(months, "months")

  return target.date(Math.min(day, target.daysInMonth()))
}

const getMilestones = (date: string, now: Dayjs): IMilestone[] => {
  const startDate = dayjs(date)

  return milestoneDefinitions.map((milestone: IMilestoneDefinition): IMilestone => {
    const targetDate =
      milestone.days === undefined
        ? addMonthsClamped(startDate, milestone.months ?? 0)
        : startDate.add(milestone.days, "days")

    // biome-ignore lint/nursery/noMapSpread: not mutating milestone
    return {
      ...milestone,
      completed: !now.isBefore(targetDate),
      targetDate
    }
  })
}

const MilestoneItem = ({ completed, label, targetDate }: IMilestone): JSX.Element => {
  const Icon = completed ? IconLockOpen2 : IconLock

  return (
    <Paper
      h="100%"
      style={{
        background: completed ? "var(--bg-savings)" : "var(--bg-secondary)",
        border: `1px solid ${completed ? "var(--text-savings)" : "var(--border-default)"}`
      }}>
      <Group align="center" gap="md" wrap="nowrap">
        <Box
          bdrs={999}
          bg={completed ? "var(--bg-savings)" : "var(--bg-primary)"}
          c={completed ? "var(--text-savings)" : "var(--text-muted)"}
          display="flex"
          h={64}
          style={{
            alignItems: "center",
            flexShrink: 0,
            justifyContent: "center"
          }}
          w={64}>
          <Icon size={32} />
        </Box>
        <Stack gap={4} miw={0}>
          <Title>{label}</Title>
          <Group align="center" gap={6} wrap="nowrap">
            {completed ? (
              <>
                <IconCircleCheckFilled color="var(--text-savings)" size={20} />
                <Text c="var(--text-savings)" fw={600} size="sm">
                  Completed
                </Text>
              </>
            ) : (
              <>
                <IconDots color="var(--text-muted)" size={18} />
                <Text c="var(--text-muted)" fw={600} size="sm">
                  Upcoming
                </Text>
              </>
            )}
          </Group>
          <Text c="var(--text-secondary)" size="sm">
            {completed ? "Reached" : "Target"} {targetDate.format(DATETIME_FORMAT_MILESTONE)}
          </Text>
        </Stack>
      </Group>
    </Paper>
  )
}

export const Milestones = ({
  allSubstances,
  refreshSubstances,
  selectedSubstance,
  setSelectedSubstance,
  substances,
  user
}: ISubstancesProps): JSX.Element => {
  const now = dayjs()

  const milestones = getMilestones(selectedSubstance.date, now)

  const completed = milestones.filter((milestone: IMilestone): boolean => milestone.completed).length

  const percentage = Math.trunc((completed / milestones.length) * FACTOR)

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
      <Paper>
        <Stack gap="xl">
          <Group gap="sm" wrap="nowrap">
            <Box
              bdrs={999}
              bg="var(--bg-hours)"
              c="var(--text-hours)"
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
              <Title c="var(--text-secondary)">YOUR JOURNEY</Title>
              <Text c="var(--text-muted)" size="xs">
                Every milestone is worth celebrating
              </Text>
            </Stack>
          </Group>
          <Group align="center" justify="space-between">
            <Stack gap="xl">
              <Box>
                <Group gap={8} pl={{ base: "md", md: "xl" }} wrap="nowrap">
                  <IconInfoCircleFilled color="var(--text-secondary)" size={16} />
                  <Text c="var(--text-muted)" size="xxs">
                    Started on {dayjs(selectedSubstance.date).format(DATETIME_FORMAT_SHORT)}
                  </Text>
                </Group>
              </Box>
              <Title>
                <Text c="var(--accent-purple)" component="span" inherit={true}>
                  {completed}
                </Text>{" "}
                of{" "}
                <Text c="var(--accent-purple)" component="span" inherit={true}>
                  {milestones.length}
                </Text>{" "}
                Milestones Reached
              </Title>
            </Stack>
          </Group>
          <Progress.Root radius="xl" size="lg">
            <Progress.Section
              c="var(--text-dark)"
              fw="bold"
              fz="xs"
              style={{
                background: "var(--gradient-primary)"
              }}
              value={percentage}>
              {percentage}%
            </Progress.Section>
          </Progress.Root>
        </Stack>
      </Paper>
      <SimpleGrid cols={{ base: 1, lg: 3, sm: 2 }} spacing="md">
        {milestones.map(
          (milestone: IMilestone): JSX.Element => (
            <MilestoneItem key={milestone.label} {...milestone} />
          )
        )}
      </SimpleGrid>
    </Stack>
  )
}
