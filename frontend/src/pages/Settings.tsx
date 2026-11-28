import { type ChangeEvent, type JSX, useState } from "react"

import { IconCheck, IconExclamationCircle, IconSettings } from "@tabler/icons-react"

import { Box, Center, Group, NumberInput, Paper, Select, Stack, Switch, Text, Title, Tooltip } from "@mantine/core"
import { hideNotification, showNotification } from "@mantine/notifications"

import { error, info } from "@postfmly/logger"
import { type Nullable } from "@postfmly/types"

import { match, P } from "ts-pattern"

import { Substances } from "../components/Substances.tsx"
import { env } from "../env.ts"
import { fetchClient } from "../services/fetchClient.ts"
import { Endpoint, getKeyByValue, HttpMethod, validate } from "../utils/index.ts"
import { type IFetchClientSettings } from "../utils/interfaces/IFetchClientSettings.ts"
import { type ISelectOption } from "../utils/interfaces/ISelectOption.ts"
import { type ISubstance, SubstanceSchema } from "../utils/interfaces/ISubstance.ts"
import { type ISubstancesProps } from "../utils/interfaces/ISubstancesProps.ts"
import { CostType, CostTypeSchema, StatsType, StatsTypeSchema } from "../utils/schemas.ts"

const toOptions = <T extends Record<string, number>>(obj: T): readonly ISelectOption[] =>
  Object.entries(obj)
    .sort(([, a], [, b]): number => a - b)
    .map(
      ([label, value]): ISelectOption => ({
        label,
        value: String(value)
      })
    )

const costTypeOptions = toOptions(CostType)

const statsTypeOptions = toOptions(StatsType)

const Label = {
  Cost: "Cost",
  CostFrequency: "Cost Frequency",
  ShowCoin: "Show Coin",
  ShowCost: "Show Cost",
  ShowDecimals: "Show Decimals",
  StatsType: "Stats Type"
} as const

export const Settings = ({
  allSubstances,
  refreshSubstances,
  selectedSubstance,
  setSelectedSubstance,
  substances,
  user
}: ISubstancesProps): JSX.Element => {
  const [updating, setUpdating] = useState(false)
  const [costInput, setCostInput] = useState<number>(selectedSubstance.cost)
  const [prevCost, setPrevCost] = useState<number>(selectedSubstance.cost)

  if (prevCost !== selectedSubstance.cost) {
    setPrevCost(selectedSubstance.cost)
    setCostInput(selectedSubstance.cost)
  }

  const updateSubstance = async (updates: Partial<ISubstance>, label: string): Promise<void> => {
    const { id } = selectedSubstance

    if (!user || id === undefined || updating) {
      return
    }

    setUpdating(true)

    try {
      const data = await fetchClient(
        {
          endpoint: Endpoint.UpdateSubstance,
          body: {
            ...selectedSubstance,
            ...updates
          },
          id,
          method: HttpMethod.PUT,
          user
        } satisfies IFetchClientSettings,
        SubstanceSchema
      )

      if (!data) {
        const message = `Could not update ${label} for ${selectedSubstance.name}`

        showNotification({
          color: "var(--accent-red)",
          icon: <IconExclamationCircle color="var(--text-primary)" size={20} />,
          message,
          title: "Setting Update Failed"
        })

        error(message)

        return
      }

      setSelectedSubstance(data)

      hideNotification("updated")
      showNotification({
        color: "var(--accent-green)",
        icon: <IconCheck color="var(--text-primary)" size={20} />,
        id: "updated",
        message: `${label} updated for ${data.name}`,
        title: "Setting Updated"
      })

      if (env.DEBUG) {
        info(`${data.name} updated`)
      }

      await refreshSubstances()
    } finally {
      setUpdating(false)
    }
  }

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

      <Center>
        <Paper maw={300}>
          <Stack gap="xl">
            <Group gap="sm" wrap="nowrap">
              <Box
                bdrs={999}
                bg="var(--bg-active)"
                c="var(--text-muted)"
                display="flex"
                h={48}
                style={{
                  alignItems: "center",
                  flexShrink: 0,
                  justifyContent: "center"
                }}
                visibleFrom="sm"
                w={48}>
                <IconSettings size={28} />
              </Box>
              <Stack miw={0}>
                <Title c="var(--text-secondary)">{"Settings".toUpperCase()}</Title>
                <Text c="var(--text-muted)" size="xs">
                  Customize these settings to your preference
                </Text>
              </Stack>
            </Group>
            <Stack>
              <Tooltip label={Label.StatsType}>
                <Select
                  allowDeselect={false}
                  data={statsTypeOptions}
                  disabled={updating}
                  label={Label.StatsType}
                  onChange={async (value: Nullable<string>): Promise<void> => {
                    const statsType = validate(value === null ? null : Number(value), StatsTypeSchema)

                    if (statsType !== null) {
                      await updateSubstance({ statsType }, Label.StatsType)
                    }
                  }}
                  value={String(selectedSubstance.statsType)}
                  withAlignedLabels={true}
                  withScrollArea={false}
                />
              </Tooltip>
              <Tooltip label={Label.ShowCoin} refProp="rootRef">
                <Switch
                  checked={selectedSubstance.showCoin}
                  description="Display AA Coin"
                  disabled={updating}
                  label={Label.ShowCoin}
                  onChange={async (e: ChangeEvent<HTMLInputElement>): Promise<void> =>
                    await updateSubstance({ showCoin: e.currentTarget.checked }, Label.ShowCoin)
                  }
                />
              </Tooltip>
              <Tooltip label={Label.ShowDecimals} refProp="rootRef">
                <Switch
                  checked={selectedSubstance.showDecimals}
                  description="Show decimal places"
                  disabled={updating}
                  label={Label.ShowDecimals}
                  onChange={async (e: ChangeEvent<HTMLInputElement>): Promise<void> =>
                    await updateSubstance({ showDecimals: e.currentTarget.checked }, Label.ShowDecimals)
                  }
                />
              </Tooltip>
              <Tooltip label={Label.ShowCost} refProp="rootRef">
                <Switch
                  checked={selectedSubstance.showCost}
                  description="Display cost savings"
                  disabled={updating}
                  label={Label.ShowCost}
                  onChange={async (e: ChangeEvent<HTMLInputElement>): Promise<void> =>
                    await updateSubstance({ showCost: e.currentTarget.checked }, Label.ShowCost)
                  }
                />
              </Tooltip>
            </Stack>
          </Stack>
          {selectedSubstance.showCost === true && (
            <Stack mt="lg">
              <Tooltip label={`Cost Per ${getKeyByValue(CostType, selectedSubstance.costType)}`}>
                <NumberInput
                  allowNegative={false}
                  data-autofocus={true}
                  decimalScale={2}
                  disabled={updating}
                  error={costInput <= 0 ? "Cost must be greater than zero" : undefined}
                  fixedDecimalScale={true}
                  hideControls={true}
                  label={`Cost Per ${getKeyByValue(CostType, selectedSubstance.costType)}`}
                  min={0}
                  onBlur={async (): Promise<void> => {
                    if (costInput <= 0 || costInput === selectedSubstance.cost) {
                      return
                    }

                    await updateSubstance(
                      {
                        cost: costInput
                      },
                      Label.Cost
                    )
                  }}
                  onChange={(value: string | number): void => {
                    const cost = match<string | number, number>(value)
                      .with(P.number, (num: number) => num)
                      .with("", () => 0)
                      .with(P.string, (str: string) => Number(str)) // could return NaN
                      .exhaustive()

                    setCostInput(Number.isNaN(cost) ? 0 : cost)
                  }}
                  placeholder="Enter cost…"
                  prefix="$ "
                  value={costInput}
                  withAsterisk={true}
                />
              </Tooltip>
              <Tooltip label={Label.CostFrequency}>
                <Select
                  allowDeselect={false}
                  data={costTypeOptions}
                  disabled={updating}
                  label={Label.CostFrequency}
                  onChange={async (value: Nullable<string>): Promise<void> => {
                    const costType = validate(value === null ? null : Number(value), CostTypeSchema)

                    if (costType !== null) {
                      await updateSubstance({ costType }, Label.CostFrequency)
                    }
                  }}
                  value={String(selectedSubstance.costType)}
                  withAlignedLabels={true}
                  withScrollArea={false}
                />
              </Tooltip>
            </Stack>
          )}
        </Paper>
      </Center>
    </Stack>
  )
}
