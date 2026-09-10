import { readdir } from "node:fs/promises"
import { default as path } from "node:path"

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
        const dist: string = "dist"

        const files: string[] = await readdir(dist, { recursive: true })

        const tasks: Promise<void>[] = files
          .filter((f: string): boolean => f.endsWith(".css") || f.endsWith(".html"))
          .map(async (f: string) => {
            const filePath: string = path.join(dist, f)

            const file: Bun.BunFile = Bun.file(filePath)

            if (file.size > 0) {
              const cat: string = "♡ ᓚᘏᗢ ♡"

              const content: string = await file.text()

              await Bun.write(
                filePath,
                `${content}${content.endsWith("\n") ? "" : "\n"}${f.endsWith(".html") ? `<!-- ${cat} -->` : `/* ${cat} */`}`
              )
            }
          })

        await Promise.all(tasks)
      }
    },
    {
      name: "size",
      async writeBundle(): Promise<void> {
        console.info(
          `\nTotal Size: ${prettyBytes(await getDirSize("dist"), {
            maximumFractionDigits: 2
          })}`
        )
      }
    }
  ]
})
