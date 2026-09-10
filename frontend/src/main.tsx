import { MantineProvider } from "@mantine/core"
import { ModalsProvider } from "@mantine/modals"
import { Notifications } from "@mantine/notifications"

import { type Nullable } from "@postfmly/types"

import { createRoot } from "react-dom/client"

import { version } from "../package.json" with { type: "json" }
import { fetchClient } from "./api/index.ts"
import { Display } from "./components/Display/index.tsx"
import { findElement, HttpMethods, handleError } from "./utils/index.ts"
import { type IFetchClient } from "./utils/interfaces/IFetchClient.ts"

const getVersion = (v: Nullable<string>): string => (v ? `v${v}` : "N/A")

const renderVersion = (sel: string, txt: string, ver: Nullable<string>): void => {
  const ele: Nullable<HTMLElement> = findElement(sel)
  if (ele) {
    ele.textContent = ""

    const sup: HTMLElement = document.createElement("sup")
    sup.textContent = txt

    ele.append(sup, document.createTextNode(` ${getVersion(ver)}`))
  }
}

renderVersion("#frontend", "UI", version)

// * NOTE: not using await, don't hold up page render
fetchClient<string>({
  endpoint: "version",
  method: HttpMethods.GET
} satisfies IFetchClient).then((data: Nullable<string>): void => {
  renderVersion("#backend", "API", data)
})

const root: Nullable<HTMLElement> = findElement("#root")
if (root) {
  createRoot(root).render(
    <MantineProvider defaultColorScheme="dark">
      <ModalsProvider>
        <Notifications />
        <Display />
      </ModalsProvider>
    </MantineProvider>
  )
} else {
  handleError("Could not find root element")
}
