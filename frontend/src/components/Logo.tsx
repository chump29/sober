import { type JSX } from "react"

import { Group, Image, Text } from "@mantine/core"

import { env } from "../env.ts"

const spaceRegex = /\s+/u

export const Logo = (): JSX.Element => {
  const [first, ...rest] = env.TITLE.trim().split(spaceRegex)
  const second = rest.join(" ")

  return (
    <Group gap="sm" wrap="nowrap">
      <Image h={36} src="/sober.webp" w={36} />
      <Text size="xxl" textWrap="nowrap">
        <Text c="var(--text-primary)" fw="bold" span={true}>
          {first}
        </Text>
        {second.length > 0 && (
          <>
            {" "}
            <Text c="var(--accent-red)" fw="bold" span={true}>
              {second}
            </Text>
          </>
        )}
      </Text>
    </Group>
  )
}
