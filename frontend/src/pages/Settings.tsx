import { type ChangeEvent, type JSX } from "react"

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
import { type ISubstance, SubstanceSchema } from "../utils/interfaces/ISubstance.ts"
import { type ISubstancesProps } from "../utils/interfaces/ISubstancesProps.ts"
import { CostType, CostTypeSchema } from "../utils/schemas.ts"

const costTypeOptions = [
  { label: "Day", value: String(CostType.Day) },
  { label: "Week", value: String(CostType.Week) },
  { label: "Month", value: String(CostType.Month) },
  { label: "Year", value: String(CostType.Year) }
]

export const Settings = ({
  allSubstances,
  refreshSubstances,
  selectedSubstance,
  setSelectedSubstance,
  substances,
  user
}: ISubstancesProps): JSX.Element => {
  const updateSubstance = async (updates: Partial<ISubstance>): Promise<void> => {
    const { id } = selectedSubstance

    if (!user || id === undefined) {
      return
    }

    const data = await fetchClient(
      {
        endpoint: Endpoint.update_substance,
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
                <Text c="dimmed" size="xs">
                  Customize these settings to your preference
                </Text>
              </Stack>
            </Group>
            <Stack>
              <Tooltip label="Show Coin" refProp="rootRef">
                <Switch
                  checked={selectedSubstance.showCoin}
                  description="Display AA Coin"
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
                  error={selectedSubstance.cost === 0 ? "Cost must be greater than zero" : undefined}
                  fixedDecimalScale={true}
                  hideControls={true}
                  label={`Cost Per ${getKeyByValue(CostType, selectedSubstance.costType)}`}
                  min={0}
                  onBlur={async (): Promise<void> => {
                    if (selectedSubstance.cost === 0) {
                      return
                    }

                    await updateSubstance({
                      cost: selectedSubstance.cost
                    })
                  }}
                  onChange={(value: string | number): void => {
                    const cost = match<string | number, number>(value)
                      .with(P.number, (num: number) => num)
                      .with("", () => 0)
                      .with(P.string, (str: string) => Number(str))
                      .exhaustive()

                    setSelectedSubstance({
                      ...selectedSubstance,
                      cost
                    })
                  }}
                  placeholder="Enter cost…"
                  prefix="$ "
                  value={selectedSubstance.cost}
                  withAsterisk={true}
                />
              </Tooltip>
              <Tooltip label="Cost Frequency">
                <Select
                  allowDeselect={false}
                  data={costTypeOptions}
                  label="Cost Frequency"
                  onChange={async (value: Nullable<string>): Promise<void> => {
                    const costType = validate(Number(value), CostTypeSchema)

                    if (costType) {
                      await updateSubstance({ costType })
                    }
                  }}
                  placeholder="Choose frequency…"
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
