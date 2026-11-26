import { type AvatarProps, type ElementProps } from "@mantine/core"

export interface IUserAvatarProps extends AvatarProps, ElementProps<"div", keyof AvatarProps> {
  name: string
}
