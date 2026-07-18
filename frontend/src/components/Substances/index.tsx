import { type ChangeEvent, type JSX, type KeyboardEvent, type RefObject, useRef } from "react"

import { info } from "@postfmly/logger"

import { ActionIcon, Box, Center, Modal, SegmentedControl, Stack, Text, TextInput, Tooltip } from "@mantine/core"
import { useField } from "@mantine/form"
import { useDisclosure } from "@mantine/hooks"
import { default as httpMethods } from "http-methods-constants"
import { TbCheck as IconCheck, TbMinus as IconMinus, TbPlus as IconPlus, TbX as IconX } from "react-icons/tb"
import { type KeyedMutator } from "swr"
import { titleCase } from "title-case"

import { fetchClient } from "../../api/index.ts"
import { DEBUG, validate } from "../../utils/index.ts"
import { type IFetchClient } from "../../utils/interfaces/IFetchClient.ts"
import { defaultSubstance, type ISubstance, SubstanceSchema } from "../../utils/interfaces/ISubstance.ts"
import { type ISubstanceDisplay } from "../../utils/interfaces/ISubstanceDisplay.ts"
import { MAX_LEN_STR, NameSchema } from "../../utils/schemas.ts"

const Substances = ({
  allSubstances,
  refreshSubstances,
  selectedSubstance,
  setSelectedSubstance,
  substances,
  user
}: {
  allSubstances: ISubstance[] | undefined
  refreshSubstances: KeyedMutator<ISubstance[]>
  selectedSubstance: ISubstance
  setSelectedSubstance: (data: ISubstance) => void
  substances: ISubstanceDisplay[]
  user: string | null
}): JSX.Element => {
  const [openedSubstance, { open: openSubstance, close: closeSubstance }] = useDisclosure(false)

  const substanceField = useField<string>({
    initialValue: "",
    validateOnChange: true,
    validate: (s: string): string | null => (s.length > 0 ? null : "Must enter a substance")
  })

  const substanceValue: RefObject<string> = useRef<string>("")

  const addSubstanceAndRefresh = (name: string): void => {
    if (!user) {
      return
    }

    const n: string = titleCase(name)

    if (allSubstances?.find((substance: ISubstance): boolean => substance.name === n)) {
      if (DEBUG) {
        info("Substance already added")
      }

      return
    }

    new Promise<void>((resolve): void => {
      fetchClient<ISubstance>({
        body: {
          ...defaultSubstance,
          name: n
        } satisfies ISubstance,
        endpoint: "substances/add",
        method: httpMethods.POST,
        user
      } satisfies IFetchClient).then((data: ISubstance | null): void => {
        const s: ISubstance | null = validate<ISubstance, SubstanceSchema>(data, SubstanceSchema)
        if (!s) {
          return
        }

        setSelectedSubstance(s)

        if (DEBUG) {
          info(`Substance added: ${s.name}`)
        }

        resolve()
      })
    }).then(async (): Promise<ISubstance[] | undefined> => await refreshSubstances())
  }

  const handleSubstanceChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const substanceName: string = e.target.value

    let s: string | null = ""
    if (substanceName.trim().length > 0) {
      s = validate<string, NameSchema>(substanceName, NameSchema)
    }

    substanceValue.current = s ?? ""

    substanceField.setValue(substanceValue.current)
  }

  const handleSubstanceConfirm = (): void => {
    if (substanceValue.current.trim().length === 0) {
      return
    }

    closeSubstance()

    addSubstanceAndRefresh(substanceValue.current)
  }

  const handleSubstanceChangeKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" && substanceValue.current.trim().length > 0) {
      handleSubstanceConfirm()
    }
  }

  const resetSubstance = (): void => {
    substanceValue.current = ""

    substanceField.setValue("")
  }

  const handleSubstanceCancel = (): void => {
    closeSubstance()

    resetSubstance()
  }

  const handleOpenSubstance = (): void => {
    resetSubstance()

    openSubstance()

    substanceField.validate()
  }

  const handleChange = (name: string): void => {
    const substance: ISubstance | undefined = allSubstances?.find((s: ISubstance): boolean => s.name === name)
    if (!substance) {
      return
    }

    if (DEBUG) {
      info(`Showing substance: ${substance.name} @ ${substance.date}`)
    }

    setSelectedSubstance(substance)
  }

  const handleDeleteAndRefresh = (): void => {
    if (!(user && selectedSubstance)) {
      return
    }

    new Promise<void>((resolve): void => {
      fetchClient<boolean>({
        endpoint: `substances/delete/${selectedSubstance.id}`,
        method: httpMethods.DELETE,
        user
      } satisfies IFetchClient).then((data: boolean | null): void => {
        if (!data) {
          // * NOTE: catches false and null
          return
        }

        if (DEBUG) {
          info(`Deleted ID ${selectedSubstance.id}`)
        }

        resolve()
      })
    }).then(async (): Promise<ISubstance[] | undefined> => await refreshSubstances())
  }

  return (
    <>
      <Modal centered={true} onClose={closeSubstance} opened={openedSubstance} size="auto" withCloseButton={false}>
        <Tooltip label="Substance" withArrow={true}>
          <TextInput
            {...substanceField.getInputProps()}
            label="Substance"
            maxLength={MAX_LEN_STR}
            onChange={handleSubstanceChange}
            onKeyDown={handleSubstanceChangeKeyDown}
            placeholder="Enter substance..."
            rightSection={
              <>
                <Tooltip label="Confirm" withArrow={true}>
                  <IconCheck
                    color="green"
                    onClick={handleSubstanceConfirm}
                    size={16}
                    style={{
                      cursor: (substanceValue.current ?? "").length === 0 ? "not-allowed" : "pointer",
                      flexShrink: 0,
                      marginRight: "5px"
                    }}
                  />
                </Tooltip>
                <Tooltip label="Cancel" withArrow={true}>
                  <IconX
                    color="red"
                    onClick={handleSubstanceCancel}
                    size={16}
                    style={{
                      cursor: "pointer",
                      flexShrink: 0,
                      marginRight: "30px"
                    }}
                  />
                </Tooltip>
              </>
            }
            withAsterisk={true}
          />
        </Tooltip>
      </Modal>
      <Center mt={50}>
        <Stack>
          {substances.length > 0 ? (
            <Text c="var(--color-blue)" fw="bold" size="sm" ta="center">
              Selected substance:
            </Text>
          ) : null}
          <Box ta="center">
            <Tooltip label="Add Substance">
              <ActionIcon onClick={handleOpenSubstance} variant="transparent">
                <IconPlus color="var(--color-green)" size={16} />
              </ActionIcon>
            </Tooltip>
            {substances.length > 0 ? (
              <>
                <SegmentedControl
                  color="var(--color-blue)"
                  data={substances}
                  onChange={handleChange}
                  size="sm"
                  value={selectedSubstance.name}
                />
                <Tooltip label="Delete Substance">
                  <ActionIcon onClick={handleDeleteAndRefresh} variant="transparent">
                    <IconMinus color="var(--color-red)" size={16} />
                  </ActionIcon>
                </Tooltip>
              </>
            ) : (
              <Text c="var(--color-red)" fs="italic" fw="bold">
                « No substances found. Please add one. »
              </Text>
            )}
          </Box>
        </Stack>
      </Center>
    </>
  )
}

export default Substances
