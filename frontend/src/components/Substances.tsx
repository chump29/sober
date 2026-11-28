import { type JSX, type KeyboardEvent, useEffect, useState } from "react"

import {
  IconGlassFull,
  IconPencil,
  IconPlus,
  IconSquareRoundedMinus,
  IconSquareRoundedPlus,
  IconTrash,
  IconX
} from "@tabler/icons-react"

import { Button, Group, Modal, Paper, SegmentedControl, Stack, Text, TextInput, Tooltip } from "@mantine/core"
import { useField } from "@mantine/form"
import { useDisclosure, useLongPress, useMediaQuery } from "@mantine/hooks"
import { hideNotification, showNotification } from "@mantine/notifications"

import { error, info } from "@postfmly/logger"
import { type Nullable } from "@postfmly/types"

import { titleCase } from "title-case"

import { env } from "../env.ts"
import { fetchClient } from "../services/fetchClient.ts"
import { Endpoint, HttpMethod, MAX_SUBSTANCES } from "../utils/index.ts"
import { type IFetchClientSettings } from "../utils/interfaces/IFetchClientSettings.ts"
import { defaultSubstance, type ISubstance, SubstanceSchema } from "../utils/interfaces/ISubstance.ts"
import { type ISubstancesProps } from "../utils/interfaces/ISubstancesProps.ts"
import { BooleanSchema, MAX_LEN_STR } from "../utils/schemas.ts"

import "./Substances.css"

const spaceRegex = /\s+/gu

const formatName = (s: string): string => titleCase(s.trim().replace(spaceRegex, " "))

export const Substances = ({
  allSubstances,
  isHome = false,
  refreshSubstances,
  selectedSubstance,
  setSelectedSubstance,
  substances,
  user
}: ISubstancesProps): JSX.Element => {
  const [openedAdd, { open: openAdd, close: closeAdd }] = useDisclosure(false)
  const [openedRemove, { open: openRemove, close: closeRemove }] = useDisclosure(false)

  const substanceNameField = useField<string>({
    initialValue: "",
    validateOnChange: true,
    validate: (s: string): Nullable<string> => (s.trim().length > 0 ? null : "Must enter a substance name")
  })

  const [isRenaming, setIsRenaming] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  const isTouch = useMediaQuery("(pointer: coarse)")

  const canAddSubstance = (): boolean => allSubstances !== undefined && allSubstances.length < MAX_SUBSTANCES

  const refreshAllSubstances = async (): Promise<void> => {
    try {
      await refreshSubstances()
    } catch (e: unknown) {
      error("Substance change succeeded, but refresh failed", e)

      showNotification({
        color: "var(--accent-red)",
        message:
          "Your change was saved, but the substance list could not be refreshed. Reload the page to see the latest changes.",
        title: "Refresh Failed"
      })
    }
  }

  const hasAddedSubstance = async (substanceName: string): Promise<boolean> => {
    if (!user) {
      return false
    }

    const name = formatName(substanceName)

    const data = await fetchClient(
      {
        body: {
          ...defaultSubstance,
          name
        } satisfies ISubstance,
        endpoint: Endpoint.AddSubstance,
        method: HttpMethod.POST,
        user
      } satisfies IFetchClientSettings,
      SubstanceSchema
    )

    if (!data) {
      error(`Could not add substance: ${name}`)

      return false
    }

    setSelectedSubstance(data)

    if (env.DEBUG) {
      info(`Substance added: ${name}`)
    }

    await refreshAllSubstances()

    showNotification({
      color: "var(--accent-blue)",
      id: "setDate",
      message: `Choose your sober date for ${name}`,
      title: "Set Sober Date"
    })

    return true
  }

  const doRename = async (name: string): Promise<void> => {
    if (!(user && selectedSubstance)) {
      return
    }

    if (name === selectedSubstance.name) {
      handleClose()

      return
    }

    const { id } = selectedSubstance

    if (
      allSubstances?.some(
        (substance: ISubstance): boolean => substance.id !== id && substance.name.toLowerCase() === name.toLowerCase()
      )
    ) {
      substanceNameField.setError("Substance already added")

      return
    }

    const updatedSubstance = { ...selectedSubstance, name }

    const data = await fetchClient(
      {
        body: updatedSubstance,
        endpoint: Endpoint.UpdateSubstance,
        id,
        method: HttpMethod.PUT,
        user
      } satisfies IFetchClientSettings,
      SubstanceSchema
    )

    if (!data) {
      error(`Could not update ID ${id}`)

      return
    }

    setSelectedSubstance(data)

    if (env.DEBUG) {
      info(`Updated ID ${id} to ${data.name}`)
    }

    await refreshAllSubstances()

    handleClose()
  }

  const handleAdd = async (): Promise<void> => {
    if (isSubmitting) {
      return
    }

    const name = formatName(substanceNameField.getValue())

    setIsSubmitting(true)

    try {
      if (isRenaming) {
        await doRename(name)

        return
      }

      if (!allSubstances) {
        return
      }

      if (!canAddSubstance()) {
        error(`Maximum of ${MAX_SUBSTANCES} substances reached`)

        return
      }

      if (allSubstances.some((substance: ISubstance): boolean => substance.name.toLowerCase() === name.toLowerCase())) {
        substanceNameField.setError("Substance already added")

        return
      }

      const added = await hasAddedSubstance(name)
      if (!added) {
        return
      }

      handleClose()

      if (env.DEBUG) {
        info(`Added substance: ${name}`)
      }
    } catch (e: unknown) {
      error(`Could not ${isRenaming ? "rename" : "add"} substance`, e)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddChangeKeyDown = async (e: KeyboardEvent<HTMLInputElement>): Promise<void> => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      await handleAdd()
    }
  }

  const handleRemove = async (): Promise<void> => {
    if (isRemoving || !(user && selectedSubstance)) {
      return
    }

    setIsRemoving(true)

    hideNotification("setDate") // in case immediately removed

    try {
      const { id } = selectedSubstance

      const data = await fetchClient(
        {
          endpoint: Endpoint.DeleteSubstance,
          id,
          method: HttpMethod.DELETE,
          user
        } satisfies IFetchClientSettings,
        BooleanSchema
      )

      if (!data) {
        error(`Could not delete ID ${id}`)

        return
      }

      if (env.DEBUG) {
        info(`Deleted ID ${id}`)
      }

      const remainingSubstances = (allSubstances ?? []).filter((substance: ISubstance): boolean => substance.id !== id)

      setSelectedSubstance(remainingSubstances[0] ?? defaultSubstance)

      await refreshAllSubstances()

      closeRemove()
    } catch (e: unknown) {
      error("Could not remove substance", e)
    } finally {
      setIsRemoving(false)
    }
  }

  const handleChange = (name: string): void => {
    const substance = allSubstances?.find((s: ISubstance): boolean => s.name === name)
    if (!substance) {
      return
    }

    setSelectedSubstance(substance)
  }

  const handleClose = (): void => {
    setIsRenaming(false)

    resetSubstance()

    closeAdd()
  }

  const resetSubstance = (): void => {
    substanceNameField.reset()
  }

  const handleOpen = (): void => {
    resetSubstance()

    openAdd()
  }

  const handleRename = (): void => {
    if (!(isHome && selectedSubstance.name)) {
      return
    }

    setIsRenaming(true)

    substanceNameField.setValue(selectedSubstance.name)

    substanceNameField.setError(null)

    openAdd()
  }

  const buttonHandler = useLongPress(handleRename, { cancelOnMove: true })

  useEffect((): void => {
    if (openedAdd && !isRenaming) {
      substanceNameField.validate().catch(error)
    }
  }, [openedAdd, isRenaming, substanceNameField.validate])

  return (
    <>
      <Modal closeOnClickOutside={!isSubmitting} closeOnEscape={!isSubmitting} onClose={handleClose} opened={openedAdd}>
        <Stack gap="xl" p="md">
          <Text c="var(--text-primary)" fw="bold" size="xl">
            {isRenaming ? "Rename" : "Add"} Substance
          </Text>
          <Tooltip label="Substance Name">
            <TextInput
              {...substanceNameField.getInputProps()}
              data-autofocus={true}
              disabled={isSubmitting}
              maxLength={MAX_LEN_STR}
              onKeyDown={handleAddChangeKeyDown}
              placeholder="Enter substance name…"
              required={true}
              styles={{
                input: {
                  background: "var(--bg-login-input)",
                  borderColor: "var(--border-login-input)"
                }
              }}
            />
          </Tooltip>
          <Group justify="flex-end" mt="sm">
            <Tooltip label="Cancel">
              <Button
                c="var(--text-primary)"
                disabled={isSubmitting}
                leftSection={<IconX size={20} />}
                onClick={handleClose}
                style={{
                  borderColor: "var(--accent-red)"
                }}
                variant="outline">
                Cancel
              </Button>
            </Tooltip>
            <Tooltip label={isRenaming ? "Rename" : "Add"}>
              <Button
                bg="var(--gradient-add)"
                c="var(--text-dark)"
                disabled={isSubmitting || !substanceNameField.getValue().trim()}
                leftSection={isRenaming ? <IconPencil size={20} /> : <IconPlus size={20} />}
                loading={isSubmitting}
                onClick={handleAdd}>
                {isRenaming ? "Rename" : "Add"}
              </Button>
            </Tooltip>
          </Group>
        </Stack>
      </Modal>
      <Modal closeOnClickOutside={!isRemoving} closeOnEscape={!isRemoving} onClose={closeRemove} opened={openedRemove}>
        <Stack>
          <Text c="var(--text-primary)" fw="bold" size="xl">
            Remove Substance
          </Text>
          <Text c="var(--accent-red)">
            Are you sure you want to remove{" "}
            <Text c="var(--accent-cyan)" fw="bold" span={true}>
              {selectedSubstance.name}
            </Text>
            ?
          </Text>
          <Group justify="flex-end" mt="sm">
            <Tooltip label="Cancel">
              <Button
                c="var(--text-primary)"
                disabled={isRemoving}
                leftSection={<IconX size={20} />}
                onClick={closeRemove}
                style={{
                  borderColor: "var(--accent-red)"
                }}
                variant="outline">
                Cancel
              </Button>
            </Tooltip>
            <Tooltip label="Remove">
              <Button
                bg="var(--gradient-remove)"
                c="var(--text-primary)"
                disabled={isRemoving}
                leftSection={<IconTrash size={20} />}
                loading={isRemoving}
                onClick={handleRemove}>
                Remove
              </Button>
            </Tooltip>
          </Group>
        </Stack>
      </Modal>
      <Paper h="100%">
        <Stack>
          <Group justify="space-between" wrap="nowrap">
            <Group wrap="nowrap">
              <IconGlassFull size={20} />
              <Text c="var(--text-primary)" fw="bold">
                {"Substances".toUpperCase()}
              </Text>
            </Group>
            {isHome === true && (
              <Group justify="flex-end">
                <Tooltip label="Add">
                  <Button
                    color="var(--accent-green)"
                    disabled={isSubmitting || isRemoving || !canAddSubstance()}
                    leftSection={<IconSquareRoundedPlus size={20} />}
                    onClick={handleOpen}
                    size="xs"
                    variant="outline">
                    Add
                  </Button>
                </Tooltip>
                <Tooltip label="Remove">
                  <Button
                    color="var(--accent-red)"
                    disabled={!(allSubstances?.length && selectedSubstance) || isRemoving || isSubmitting}
                    leftSection={<IconSquareRoundedMinus size={20} />}
                    onClick={openRemove}
                    size="xs"
                    variant="outline">
                    Remove
                  </Button>
                </Tooltip>
              </Group>
            )}
          </Group>
          {substances.length > 0 && (
            <SegmentedControl
              data={substances}
              disabled={isSubmitting || isRemoving}
              fullWidth={true}
              onChange={handleChange}
              onDoubleClick={isHome ? handleRename : undefined}
              {...(isHome ? buttonHandler : {})}
              size="xl"
              style={{ userSelect: "none", WebkitTouchCallout: "none" }}
              styles={{
                indicator: {
                  background: "var(--gradient-primary)"
                },
                root: {
                  background: "var(--bg-substances)",
                  border: "1px solid var(--border-default)",
                  padding: 2
                }
              }}
              value={selectedSubstance.name}
              withItemsBorders={false}
            />
          )}
          {isHome === true && substances.length > 0 && (
            <Text c="var(--text-muted)" fs="italic" size="xxs" ta="center">
              {isTouch ? "Hold" : "Double-click"} to rename
            </Text>
          )}
        </Stack>
      </Paper>
    </>
  )
}
