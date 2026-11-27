import { type Nullable, type Optional } from "@postfmly/types"

import { type KeyedMutator } from "swr"

import { type ISubstance } from "./ISubstance.ts"
import { type ISubstanceDisplay } from "./ISubstanceDisplay.ts"

export interface ISubstancesProps {
  allSubstances: Optional<ISubstance[]>
  isHome?: boolean
  refreshSubstances: KeyedMutator<ISubstance[]>
  selectedSubstance: ISubstance
  setSelectedSubstance: (data: ISubstance) => void
  substances: ISubstanceDisplay[]
  user: Nullable<string>
}
