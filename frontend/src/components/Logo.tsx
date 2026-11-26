import { type JSX } from "react"

import { Group, Image, Text } from "@mantine/core"

import { env } from "../env.ts"

export const Logo = (): JSX.Element => {
  const title = env.TITLE.split(" ", 2)

  return (
    <Group gap="sm" wrap="nowrap">
      <Image h={36} src="sober.webp" w={36} />
      <Text size="xxl" textWrap="nowrap">
        <Text c="var(--text-primary)" fw="bold" span={true}>
          {title[0]}
        </Text>{" "}
        <Text c="var(--accent-red)" fw="bold" span={true}>
          {title[1]}
        </Text>
      </Text>
    </Group>
  )
}
