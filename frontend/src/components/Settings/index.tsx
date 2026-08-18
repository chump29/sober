import { type ChangeEvent, type JSX, type KeyboardEvent, type RefObject, useRef } from "react"

import { type ComboboxData, Divider, Modal, NumberInput, Select, Stack, Switch, Tooltip } from "@mantine/core"
import { useDebouncedCallback } from "@mantine/hooks"

import { default as httpMethods } from "http-methods-constants"
import { default as ms } from "ms"
import { TbCurrencyDollar as IconCurrencyDollar } from "react-icons/tb"
import { type KeyedMutator } from "swr"
import { match } from "ts-pattern"

import { fetchClient } from "../../api/index.ts"
import { getKeyByValue, handleError, SaveType, validate } from "../../utils/index.ts"
import { type IFetchClient } from "../../utils/interfaces/IFetchClient.ts"
import { type ISelectDisplay } from "../../utils/interfaces/ISelectDisplay.ts"
import { type ISubstance } from "../../utils/interfaces/ISubstance.ts"
import { BooleanSchema, CostInputSchema, CostSchema, CostType, CostTypeSchema } from "../../utils/schemas.ts"

const DEBOUNCE_MS: number = ms("0.75s")

const Settings = ({
  closeSettings,
  openedSettings,
  refreshSubstances,
  substances,
  user
}: {
  closeSettings: () => void
  openedSettings: boolean
  refreshSubstances: KeyedMutator<ISubstance[]>
  substances: ISubstance[] | undefined
  user: string | null
}): JSX.Element => {
  const costTypeRef: RefObject<HTMLInputElement | null> = useRef<HTMLInputElement | null>(null)
  const costRef: RefObject<HTMLInputElement | null> = useRef<HTMLInputElement | null>(null)

  const handleSave = async (
    substance: ISubstance,
    type: SaveType,
    value: boolean | CostType | number
  ): Promise<void> => {
    if (!(user && substance.id)) {
      return
    }

    const res: string | undefined | null = match<SaveType, string | undefined | null>(type)
      .returnType<string | undefined | null>()
      .with(SaveType.COST, (): string | undefined | null => {
        const c: number | null = validate<number, CostSchema>(value as number, CostSchema)

        if (c === null) {
          return "Invalid Cost"
        }

        substance.cost = c
      })
      .with(SaveType.COST_TYPE, (): string | undefined | null => {
        const c: CostType | null = validate<CostType, CostTypeSchema>(value as CostType, CostTypeSchema)

        if (c === null) {
          return "Invalid CostType"
        }

        substance.costType = c
      })
      .with(SaveType.SHOW_COIN, (): string | undefined | null => {
        const c: boolean | null = validate<boolean, BooleanSchema>(value as boolean, BooleanSchema)

        if (c === null) {
          return "Invalid ShowCoin"
        }

        substance.showCoin = c
      })
      .with(SaveType.SHOW_COST, (): string | undefined | null => {
        const c: boolean | null = validate<boolean, BooleanSchema>(value as boolean, BooleanSchema)

        if (c === null) {
          return "Invalid ShowCost"
        }

        substance.showCost = c

        if (substance.cost === 0) {
          return null
        }
      })
      .with(SaveType.SHOW_DECIMALS, (): string | undefined | null => {
        const d: boolean | null = validate<boolean, BooleanSchema>(value as boolean, BooleanSchema)

        if (d === null) {
          return "Invalid ShowDecimals"
        }

        substance.showDecimals = d
      })
      .otherwise((): string | undefined | null => "Invalid SaveType")

    if (res === null) {
      return
    }

    if (res) {
      handleError(res)

      return
    }

    await fetchClient<ISubstance[]>({
      body: substance,
      endpoint: `substances/update/${substance.id}`,
      method: httpMethods.PUT,
      user
    } satisfies IFetchClient).then(async (): Promise<ISubstance[] | undefined> => await refreshSubstances())
  }

  const setCost = (substance: ISubstance, value: string): void => {
    if (value === "" || value === "0.00") {
      substance.cost = 0

      return
    }

    const c: number | null = validate<string, CostInputSchema, number>(value, CostInputSchema)

    handleSave(substance, SaveType.COST, c ?? 0)
  }

  const handleCost = useDebouncedCallback((substance: ISubstance, value: string) => {
    setCost(substance, value)
  }, DEBOUNCE_MS)

  const handleEnter = (value: string): void => {
    if (value === "Enter") {
      costRef.current?.blur()
    }
  }

  const getData = (): ComboboxData<CostType> => {
    const types: ISelectDisplay[] = []
    for (const [k, v] of Object.entries(CostType)) {
      types.push({
        label: k,
        value: v
      } satisfies ISelectDisplay)
    }
    return types as ComboboxData<CostType>
  }

  return (
    <Modal.Root
      centered={true}
      onClose={closeSettings}
      opened={openedSettings}
      size="auto"
      transitionProps={{
        duration: 250,
        timingFunction: "linear",
        transition: "scale"
      }}>
      <Modal.Overlay backgroundOpacity={0.75} />
      <Modal.Content>
        <Modal.Header>
          <Modal.Title
            c="var(--color-green)"
            fw="bold"
            styles={{
              title: {
                fontSize: "1.5rem"
              }
            }}>
            Settings
          </Modal.Title>
          <Tooltip label="Close" withArrow>
            <Modal.CloseButton
              style={{
                cursor: "pointer"
              }}
            />
          </Tooltip>
        </Modal.Header>
        <Modal.Body>
          <Stack>
            {substances?.map(
              (substance: ISubstance): JSX.Element => (
                <Stack data-testid={`stack-${substance.name}`} key={substance.id}>
                  <Divider label={substance.name} labelPosition="center" my="xs" variant="dashed" />
                  <Switch
                    checked={substance.showDecimals ?? true}
                    color="var(--color-blue)"
                    data-testid="showDecimals"
                    description="Show decimal places for weeks/months/years"
                    label="Show Decimals"
                    offLabel="OFF"
                    onChange={async (val: ChangeEvent<HTMLInputElement>): Promise<void> =>
                      await handleSave(substance, SaveType.SHOW_DECIMALS, val.target.checked)
                    }
                    onLabel="ON"
                    size="md"
                  />
                  <Switch
                    checked={substance.showCoin ?? false}
                    color="var(--color-blue)"
                    data-testid="showCoin"
                    description="Display AA coin"
                    label="Show Coin"
                    offLabel="OFF"
                    onChange={async (val: ChangeEvent<HTMLInputElement>): Promise<void> =>
                      await handleSave(substance, SaveType.SHOW_COIN, val.target.checked)
                    }
                    onLabel="ON"
                    size="md"
                  />
                  <Switch
                    checked={substance.showCost ?? false}
                    color="var(--color-blue)"
                    data-testid="showCost"
                    description="Display cost savings"
                    label="Show Cost"
                    offLabel="OFF"
                    onChange={async (val: ChangeEvent<HTMLInputElement>): Promise<void> => {
                      await handleSave(substance, SaveType.SHOW_COST, val.target.checked).then((): void => {
                        if (substance.showCost) {
                          costRef.current?.focus()
                        }
                      })
                    }}
                    onLabel="ON"
                    size="md"
                  />
                  <Select<CostType>
                    checkIconPosition="left"
                    data={getData()}
                    data-testid="costType"
                    disabled={!substance.showCost}
                    label="Cost Frequency"
                    onChange={async (val: CostType | null): Promise<void> =>
                      await handleSave(substance, SaveType.COST_TYPE, val as CostType).then((): void =>
                        costTypeRef.current?.blur()
                      )
                    }
                    placeholder="Choose frequency…"
                    ref={costTypeRef}
                    styles={{
                      option: {
                        cursor: "pointer"
                      }
                    }}
                    value={substance.costType}
                    withAlignedLabels={true}
                    withScrollArea={false}
                  />
                  <NumberInput
                    allowDecimal
                    allowNegative={false}
                    data-autofocus
                    data-testid="cost"
                    decimalScale={2}
                    disabled={!substance.showCost}
                    error={substance.showCost && substance.cost === 0 ? "Must enter a cost" : null}
                    fixedDecimalScale
                    hideControls
                    label={`Cost Per ${getKeyByValue(CostType, substance.costType)}`}
                    leftSection={<IconCurrencyDollar color="var(--color-red)" size={16} />}
                    min={0}
                    onChange={(val: string | number): void => {
                      handleCost(
                        substance,
                        val as string /* Numbers with trailing decimal separators or trailing decimal zeros are represented as strings */
                      )
                    }}
                    onKeyDown={(val: KeyboardEvent<HTMLInputElement>): void => handleEnter(val.key)}
                    placeholder="Enter cost…"
                    ref={costRef}
                    value={substance.cost}
                    withAsterisk={substance.showCost}
                  />
                </Stack>
              )
            )}
          </Stack>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  )
}

export default Settings
