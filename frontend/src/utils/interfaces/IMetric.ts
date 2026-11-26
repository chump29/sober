import { type TablerIcon } from "@tabler/icons-react"

import { type IDisplayStats } from "./IDisplay.ts"

export interface IMetric {
  icon: TablerIcon
  label: keyof IDisplayStats
}
