import { type ChangeEvent, type JSX, type KeyboardEvent, type RefObject, useRef } from "react"

import { ActionIcon, Box, Center, Modal, SegmentedControl, Stack, Text, TextInput, Tooltip } from "@mantine/core"
import { useField } from "@mantine/form"
import { useDisclosure } from "@mantine/hooks"
import { hideNotification, showNotification } from "@mantine/notifications"

import { info } from "@postfmly/logger"

import { default as httpMethods } from "http-methods-constants"
import { default as ms } from "ms"
import { TbCheck as IconCheck, TbMinus as IconMinus, TbPlus as IconPlus, TbX as IconX } from "react-icons/tb"
import { type KeyedMutator } from "swr"
import { titleCase } from "title-case"

import { fetchClient } from "../../api/index.ts"
import { displayStoreActions } from "../../utils/displayStore.ts"
import { DEBUG, type Nullable, type Optional, validate } from "../../utils/index.ts"
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
  allSubstances: Optional<ISubstance[]>
  refreshSubstances: KeyedMutator<ISubstance[]>
  selectedSubstance: ISubstance
  setSelectedSubstance: (data: ISubstance) => void
  substances: ISubstanceDisplay[]
  user: Nullable<string>
}): JSX.Element => {
  const { getSelectedSubstance } = displayStoreActions()

  const [openedSubstance, { open: openSubstance, close: closeSubstance }] = useDisclosure(false)

  const substanceField = useField<string>({
    initialValue: "",
    validateOnChange: true,
    validate: (s: string): Nullable<string> => (s.length > 0 ? null : "Must enter a substance")
  })

  const substanceValue: RefObject<string> = useRef<string>("")

  const isRenaming: RefObject<boolean> = useRef<boolean>(false)

  const addSubstanceAndRefresh = (name: string): void => {
    if (!user) {
      return
    }

    const n: string = titleCase(name)

    new Promise<void>((resolve): void => {
      fetchClient<ISubstance>({
        body: {
          ...defaultSubstance,
          name: n
        } satisfies ISubstance,
        endpoint: "substances/add",
        method: httpMethods.POST,
        user
      } satisfies IFetchClient).then((data: Nullable<ISubstance>): void => {
        const s: Nullable<ISubstance> = validate<ISubstance, SubstanceSchema>(data, SubstanceSchema)
        if (!s) {
          return
        }

        setSelectedSubstance(s)

        if (DEBUG) {
          info(`Substance added: ${s.name}`)
        }

        resolve()
      })
    })
      .then(async (): Promise<Optional<ISubstance[]>> => await refreshSubstances())
      .then((): string =>
        showNotification({
          autoClose: ms("7.5s"),
          className: "var(--color-blue)",
          id: "setDate",
          message: `Choose your sober date for ${getSelectedSubstance().name}`,
          title: "Set Sober Date",
          withBorder: true
        })
      )
  }

  const handleSubstanceChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const substanceName: string = e.target.value

    let s: Nullable<string> = ""
    if (substanceName.trim().length > 0) {
      s = validate<string, NameSchema>(substanceName, NameSchema)
    }

    substanceValue.current = s ?? ""

    substanceField.setValue(substanceValue.current)
  }

  const handleClose = (): void => {
    isRenaming.current = false // reset

    closeSubstance()
  }

  const handleSubstanceConfirm = (): void => {
    if (substanceValue.current.trim().length === 0) {
      return
    }

    if (isRenaming.current) {
      if (!(user && selectedSubstance)) {
        return
      }

      selectedSubstance.name = substanceValue.current

      new Promise<void>((resolve): void => {
        fetchClient<void>({
          body: selectedSubstance,
          endpoint: `substances/update/${selectedSubstance.id}`,
          method: httpMethods.PUT,
          user
        } satisfies IFetchClient).then((): void => {
          if (DEBUG) {
            info(`Updated ID ${selectedSubstance.id} to ${selectedSubstance.name}`)
          }

          resolve()
        })
      })
        .then((): string => hideNotification("setDate"))
        .then(async (): Promise<Optional<ISubstance[]>> => await refreshSubstances())

      handleClose()

      return
    }

    if (
      allSubstances?.find(
        (substance: ISubstance): boolean => substance.name.toLowerCase() === substanceValue.current.toLowerCase()
      )
    ) {
      if (DEBUG) {
        substanceField.setError("Substance already added")
      }

      return
    }

    handleClose()

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
    handleClose()

    resetSubstance()
  }

  const handleOpenSubstance = (): void => {
    resetSubstance()

    openSubstance()

    substanceField.validate()
  }

  const handleChange = (name: string): void => {
    const substance: Optional<ISubstance> = allSubstances?.find((s: ISubstance): boolean => s.name === name)
    if (!substance) {
      return
    }

    setSelectedSubstance(substance)

    if (DEBUG) {
      info(`Showing substance: ${substance.name} on ${substance.date}`)
    }
  }

  const handleRename = (): void => {
    isRenaming.current = true

    const name: string = selectedSubstance.name

    substanceField.setValue(name)

    substanceValue.current = name

    openSubstance()
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
      } satisfies IFetchClient).then((data: Nullable<boolean>): void => {
        if (!data) {
          // * NOTE: catches false and null
          return
        }

        if (DEBUG) {
          info(`Deleted ID ${selectedSubstance.id}`)
        }

        resolve()
      })
    }).then(async (): Promise<Optional<ISubstance[]>> => await refreshSubstances())
  }

  return (
    <>
      <Modal centered={true} onClose={handleClose} opened={openedSubstance} size="auto" withCloseButton={false}>
        <Tooltip label="Substance" withArrow={true}>
          <TextInput
            {...substanceField.getInputProps()}
            data-testid="substanceName"
            label="Substance"
            maxLength={MAX_LEN_STR}
            onChange={handleSubstanceChange}
            onKeyDown={handleSubstanceChangeKeyDown}
            placeholder="Enter substance…"
            rightSection={
              <>
                <Tooltip label="Confirm" withArrow={true}>
                  <IconCheck
                    color="green"
                    data-testid="confirmSubstance"
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
                    data-testid="cancelSubstance"
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
              <ActionIcon data-testid="addButton" onClick={handleOpenSubstance} variant="transparent">
                <IconPlus color="var(--color-green)" size={16} />
              </ActionIcon>
            </Tooltip>
            {substances.length > 0 ? (
              <>
                <SegmentedControl<string>
                  color="var(--color-blue)"
                  data={substances}
                  data-testid={`segment-${selectedSubstance.name}`}
                  onChange={handleChange}
                  onDoubleClick={handleRename}
                  size="sm"
                  transitionDuration={ms(".5s")}
                  transitionTimingFunction="linear"
                  value={selectedSubstance.name}
                />
                <Tooltip label="Delete Substance">
                  <ActionIcon data-testid="removeButton" onClick={handleDeleteAndRefresh} variant="transparent">
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
