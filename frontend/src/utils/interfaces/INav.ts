import { type TablerIcon } from "@tabler/icons-react"

export interface INav<T> {
  icon: TablerIcon
  label: string
  value: T
}
