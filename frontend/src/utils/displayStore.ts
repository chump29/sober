import { type Nullable, type Nullish } from "@postfmly/types"

import { type Dayjs, default as dayjs } from "dayjs"
import { dequal as equal } from "dequal"
import { create } from "zustand"

import { calculateSavings, calculateStats } from "./calc.ts"
import { getKeyByValue, round } from "./index.ts"
import { type ICost } from "./interfaces/ICost.ts"
import { defaultValues, type IDisplay, type IDisplayActions } from "./interfaces/IDisplay.ts"
import { defaultSubstance, type ISubstance } from "./interfaces/ISubstance.ts"
import { CostType } from "./schemas.ts"

const getCost = (substance: ISubstance, date: string, now: Dayjs): Nullable<ICost> => {
  if (substance.cost <= 0) {
    return null
  }

  const savings = calculateSavings(date, substance.cost, substance.costType, now)

  return {
    cost: round(savings.today),
    costPer: round(substance.cost),
    costType: getKeyByValue(CostType, substance.costType)
  }
}

export const displayStore = create<IDisplay>()(
  (set, get): IDisplay =>
    ({
      actions: {
        getSelectedSubstanceNow: (): ISubstance => get().selectedSubstance,
        getUserNow: (): Nullable<string> => get().user,

        setDisplay: (date: Nullish<string>): void => {
          if (!date) {
            set({
              ...defaultValues,
              cost: null
            })

            return
          }

          const now = dayjs()

          const substance = get().selectedSubstance

          // * NOTE: reducing updates
          const currentCost = get().cost
          const updatedCost = getCost(substance, date, now)

          set({
            ...calculateStats(date, substance.showDecimals, now),
            cost: equal(currentCost, updatedCost) ? currentCost : updatedCost
          })
        },

        setSelectedSubstance: (data: ISubstance): void => {
          const now = dayjs()

          set({
            ...calculateStats(data.date, get().selectedSubstance.showDecimals, now),
            cost: getCost(data, data.date, now),
            selectedSubstance: data
          })
        },

        setUser: (data: Nullable<string>): void =>
          set({
            user: data
          })
      } satisfies IDisplayActions,
      ...defaultValues,
      cost: null,
      selectedSubstance: defaultSubstance,
      user: null
    }) satisfies IDisplay
)

// atomic
export const useCost = (): Nullable<ICost> => displayStore((state: IDisplay): Nullable<ICost> => state.cost)
export const useDays = (): number => displayStore((state: IDisplay): number => state.days)
export const useFortnights = (): number => displayStore((state: IDisplay): number => state.fortnights)
export const useHours = (): number => displayStore((state: IDisplay): number => state.hours)
export const useMinutes = (): number => displayStore((state: IDisplay): number => state.minutes)
export const useMonths = (): number => displayStore((state: IDisplay): number => state.months)
export const useSeconds = (): number => displayStore((state: IDisplay): number => state.seconds)
export const useWeeks = (): number => displayStore((state: IDisplay): number => state.weeks)
export const useYears = (): number => displayStore((state: IDisplay): number => state.years)
export const useSelectedSubstance = (): ISubstance =>
  displayStore((state: IDisplay): ISubstance => state.selectedSubstance)

export const displayStoreActions = (): IDisplayActions =>
  displayStore((state: IDisplay): IDisplayActions => state.actions)
