import { appendFile, readdir } from "node:fs/promises"

import { default as react } from "@vitejs/plugin-react"
import { default as getDirSize } from "fdir-size"
import { default as prettyBytes } from "pretty-bytes"
import { default as removeAttributes } from "rollup-plugin-jsx-remove-attributes"
import { defineConfig } from "vite"
import { ViteMinifyPlugin as minifyHtml } from "vite-plugin-minify"
import { ViteWebfontDownload as webFontDownload } from "vite-plugin-webfont-dl"

export default defineConfig({
  build: {
    cssMinify: "lightningcss",
    rolldownOptions: {
      output: {
        postFooter: "/* ♡ ᓚᘏᗢ ♡ */",
        codeSplitting: {
          groups: [
            {
              name: "mantine",
              test: "@mantine"
            },
            {
              name: "postfmly",
              test: "@postfmly"
            },
            {
              name: "icons",
              test: "react-icons"
            },
            {
              name: "react",
              test: "react"
            }
          ]
        }
      }
    }
  },
  css: {
    transformer: "lightningcss"
  },
  plugins: [
    minifyHtml({
      keepClosingSlash: true,
      noNewlinesBeforeTagClose: true,
      removeComments: true
    }),
    react(),
    removeAttributes({
      usage: "vite"
    }),
    webFontDownload(["https://fonts.googleapis.com/css2?family=Cairo+Play&display=swap"], {
      assetsSubfolder: "fonts",
      injectAsStyleTag: false,
      subsetsAllowed: ["latin"]
    }),
    {
      name: "footer",
      async closeBundle(): Promise<void> {
        await readdir("dist", {
          recursive: true
        })
          .then((files: string[]): string[] =>
            files.filter((file: string): boolean => file.endsWith(".css") || file.endsWith(".html"))
          )
          .then(async (files: string[]): Promise<void> => {
            for await (const file of files) {
              const cat: string = "♡ ᓚᘏᗢ ♡"

              const footer: string = file.endsWith(".html") ? `<!-- ${cat} -->` : `/* ${cat} */`

              const bunFile: Bun.BunFile = Bun.file(`dist/${file}`)
              if (bunFile.size > 0) {
                await bunFile
                  .slice(bunFile.size - 1)
                  .arrayBuffer()
                  .then(async (ending: ArrayBuffer): Promise<void> => {
                    const LF: number = 10

                    await appendFile(`dist/${file}`, `${new Uint8Array(ending)[0] === LF ? "" : "\n"}${footer}`)
                  })
              }
            }
          })
      }
    },
    {
      name: "size",
      async closeBundle(): Promise<void> {
        console.info(
          `\nTotal Size: ${prettyBytes(await getDirSize("dist"), {
            maximumFractionDigits: 2
          })}`
        )
      }
    }
  ]
})
