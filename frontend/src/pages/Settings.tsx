import { type ChangeEvent, type JSX, useState } from "react"

import { IconSettings } from "@tabler/icons-react"

import { Box, Center, Group, NumberInput, Paper, Select, Stack, Switch, Text, Title, Tooltip } from "@mantine/core"

import { info } from "@postfmly/logger"
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

  const updateSubstance = async (updates: Partial<ISubstance>): Promise<void> => {
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
        return
      }

      setSelectedSubstance(data)

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
              <Tooltip label="Stats Type">
                <Select
                  allowDeselect={false}
                  data={statsTypeOptions}
                  disabled={updating}
                  label="Stats Type"
                  onChange={async (value: Nullable<string>): Promise<void> => {
                    const statsType = validate(value === null ? null : Number(value), StatsTypeSchema)

                    if (statsType !== null) {
                      await updateSubstance({ statsType })
                    }
                  }}
                  value={String(selectedSubstance.statsType)}
                  withAlignedLabels={true}
                  withScrollArea={false}
                />
              </Tooltip>
              <Tooltip label="Show Coin" refProp="rootRef">
                <Switch
                  checked={selectedSubstance.showCoin}
                  description="Display AA Coin"
                  disabled={updating}
                  label="Show Coin"
                  onChange={async (e: ChangeEvent<HTMLInputElement>): Promise<void> =>
                    await updateSubstance({ showCoin: e.currentTarget.checked })
                  }
                />
              </Tooltip>
              <Tooltip label="Show Decimals" refProp="rootRef">
                <Switch
                  checked={selectedSubstance.showDecimals}
                  description="Show decimal places"
                  disabled={updating}
                  label="Show Decimals"
                  onChange={async (e: ChangeEvent<HTMLInputElement>): Promise<void> =>
                    await updateSubstance({ showDecimals: e.currentTarget.checked })
                  }
                />
              </Tooltip>
              <Tooltip label="Show Cost" refProp="rootRef">
                <Switch
                  checked={selectedSubstance.showCost}
                  description="Display cost savings"
                  disabled={updating}
                  label="Show Cost"
                  onChange={async (e: ChangeEvent<HTMLInputElement>): Promise<void> =>
                    await updateSubstance({ showCost: e.currentTarget.checked })
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

                    await updateSubstance({
                      cost: costInput
                    })
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
              <Tooltip label="Cost Frequency">
                <Select
                  allowDeselect={false}
                  data={costTypeOptions}
                  disabled={updating}
                  label="Cost Frequency"
                  onChange={async (value: Nullable<string>): Promise<void> => {
                    const costType = validate(value === null ? null : Number(value), CostTypeSchema)

                    if (costType !== null) {
                      await updateSubstance({ costType })
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
