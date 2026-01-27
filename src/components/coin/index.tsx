import { useEffect, useState } from "react"

const MAX_YEARS = 5

export default function Coin({
  months,
  years
}: {
  months: number
  years: number
}) {
  const [url, setUrl] = useState("")
  const [txt, setTxt] = useState("")

  useEffect(() => {
    if (isNaN(months)) {
      return
    }

    const path = "/coins/"
    if (months === 18) {
      setUrl(`${path}18m.png`)
      setTxt("18 months")
    } else if (years > 0) {
      setUrl(`${path}${years}y.png`)
      let y = "year"
      if (years > 1) {
        y += "s"
      }
      setTxt(`${years} ${y}`)
    } else {
      setUrl(`${path}${months}m.png`)
      let m = "month"
      if (months > 1) {
        m += "s"
      }
      setTxt(`${months} ${m}`)
    }
  }, [months])

  return (
    <>
      {months > 0 && years <= MAX_YEARS ? (
        <div>
          <img alt={txt} className="mx-auto w-[200px] mt-20 mb-10" src={url} />
        </div>
      ) : null}
    </>
  )
}
