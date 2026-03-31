import { type JSX, useEffect, useState } from "react"

const MAX_YEARS: number = 5

const Coin = ({ months, years, showCoin }: { months: number; years: number; showCoin: boolean }): JSX.Element => {
  const [url, setUrl] = useState<string>("")
  const [txt, setTxt] = useState<string>("")

  useEffect((): void => {
    if (isNaN(months)) {
      return
    }

    const path: string = "/coins/"
    if (months === 18) {
      setUrl(`${path}18m.png`)
      setTxt("18 months")
    } else if (years > 0) {
      setUrl(`${path}${years}y.png`)
      let y: string = "year"
      if (years > 1) {
        y += "s"
      }
      setTxt(`${years} ${y}`)
    } else {
      setUrl(`${path}${months}m.png`)
      let m: string = "month"
      if (months > 1) {
        m += "s"
      }
      setTxt(`${months} ${m}`)
    }
  }, [
    months,
    years
  ])

  return (
    <>
      {showCoin && months > 0 && years <= MAX_YEARS && url ? (
        <div className="py-10">
          <img alt={txt} className="mx-auto" src={url} title={txt} />
        </div>
      ) : null}
    </>
  )
}

export default Coin
