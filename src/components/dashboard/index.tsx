import { useEffect, useState } from "react"

import "./index.css"

export default function Dashboard() {
  const [days, setDays] = useState(0)

  useEffect(() => {
    setDays(0)
  }, [days])

  return (
    <>
      <div>
        <h1>TODO</h1>
        <div>{days} days/months/years sober</div>
      </div>
    </>
  )
}
