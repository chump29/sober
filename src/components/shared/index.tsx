// biome-ignore-all lint/suspicious/noExplicitAny: can log anything

import { bgBlue, bgRed, cyan, red, white } from "recolors"

const toComma = (num: string): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

const pad = (n: number): string => {
  return n.toString().padStart(2, "0")
}

const getDate = (): [
  string,
  string,
  string
] => {
  const d = new Date()
  return [
    pad(d.getHours()),
    pad(d.getMinutes()),
    pad(d.getSeconds())
  ]
}

const getTime = (): string => {
  const [h, m, s] = getDate()
  return cyan(" [") + white(`${h}:${m}:${s}`) + cyan("] ")
}

const error = (...o: any[]): void => {
  if (!o.length) {
    return
  }
  console.error(bgRed(white(" ERROR ")) + getTime())
  o.forEach((x: any) => console.error(red(" ⤷"), x))
}

const info = (...o: any[]): void => {
  if (!o.length) {
    return
  }
  console.info(bgBlue(white(" INFO ")) + getTime())
  o.forEach((x: any) => console.info(white(" ⤷"), x))
}

export { error, info, toComma }
