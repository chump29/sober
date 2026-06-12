interface IDisplayActions {
  setDisplay(date: string | null | undefined): void
}

interface IDisplay {
  actions: IDisplayActions
  d: number
  days: string
  hours: string
  m: number
  minutes: string
  months: string
  seconds: string
  w: number
  weeks: string
  y: number
  years: string
}

export { type IDisplay, type IDisplayActions }
