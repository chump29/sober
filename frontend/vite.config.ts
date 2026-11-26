import { readdir } from "node:fs/promises"
import { default as path } from "node:path"

import { type Optional } from "@postfmly/types"

import { default as react } from "@vitejs/plugin-react"
import { default as getDirSize } from "fdir-size"
import { type Rule, type Selector, type SelectorComponent } from "lightningcss"
import { MagicRegExpTransformPlugin as regexp } from "magic-regexp/transform"
import { default as prettyBytes } from "pretty-bytes"
import { default as removeAttributes } from "rollup-plugin-jsx-remove-attributes"
import { defineConfig } from "vite"
import { ViteMinifyPlugin as minifyHtml } from "vite-plugin-minify"

export default defineConfig({
  build: {
    cssMinify: "lightningcss",
    modulePreload: {
      resolveDependencies: (_: string, deps: string[], { hostType }: { hostType: "html" | "js" }): string[] =>
        hostType === "html"
          ? deps.filter((dep: string): boolean => !(dep.includes("mantine-charts") || dep.includes("mantine-dates")))
          : deps
    },
    rolldownOptions: {
      output: {
        postFooter: "/* ♡ ᓚᘏᗢ ♡ */",
        codeSplitting: {
          groups: [
            {
              name: "react",
              priority: 40,
              test: /node_modules[\\/](?:react|react-dom)[\\/]/u
            },
            {
              name: "mantine-charts",
              priority: 30,
              test: "@mantine/charts"
            },
            {
              name: "mantine-dates",
              priority: 30,
              test: "@mantine/dates"
            },
            {
              name: "mantine-core",
              priority: 25,
              test: "@mantine"
            },
            {
              name: "tabler",
              priority: 20,
              test: "@tabler/icons-react"
            },
            {
              name: "vendor",
              priority: 10,
              test: /node_modules/u
            }
          ]
        }
      }
    }
  },
  css: {
    transformer: "lightningcss",
    lightningcss: {
      visitor: {
        Rule: {
          style(rule: Extract<Rule, { type: "style" }>): Optional<Rule | Rule[]> {
            const hasLightComponent = (component: SelectorComponent): boolean => {
              if (
                component.type === "attribute" &&
                component.name === "data-mantine-color-scheme" &&
                component.operation?.value === "light"
              ) {
                return true
              }

              if ("selectors" in component && Array.isArray(component.selectors)) {
                for (const nested of component.selectors) {
                  const matched = Array.isArray(nested) ? nested.some(hasLightComponent) : hasLightComponent(nested)

                  if (matched) {
                    return true
                  }
                }
              }

              if ("selector" in component && Array.isArray(component.selector)) {
                return component.selector.some(hasLightComponent)
              }

              return false
            }

            const hasLightSelector = rule.value.selectors.some((selector: Selector): boolean =>
              selector.some(hasLightComponent)
            )

            if (hasLightSelector) {
              return []
            }
          }
        }
      }
    }
  },
  plugins: [
    minifyHtml({
      keepClosingSlash: true,
      noNewlinesBeforeTagClose: true,
      removeComments: true
    }),
    react(),
    regexp.vite(),
    removeAttributes({
      usage: "vite"
    }),
    {
      enforce: "post",
      name: "mantine-css",
      transformIndexHtml: (html: string): string =>
        html.replace(/<link rel="stylesheet"[^>]*href="[^"]*mantine-(?:charts|dates)[^"]*\.css"[^>]*>/gu, "")
    },
    {
      enforce: "post",
      name: "footer",
      async closeBundle(): Promise<void> {
        const dist = "dist"

        const files = await readdir(dist, { recursive: true })

        const tasks = files
          .filter((f: string): boolean => f.endsWith(".css") || f.endsWith(".html"))
          .map(async (f: string) => {
            const filePath = path.join(dist, f)

            const file = Bun.file(filePath)

            if (file.size > 0) {
              const cat = "♡ ᓚᘏᗢ ♡"

              const content = await file.text()

              const HTML_COMMENT = `<!-- ${cat} -->`
              const JS_COMMENT = `/* ${cat} */`

              await Bun.write(
                filePath,
                `${content}${content.endsWith("\n") ? "" : "\n"}${f.endsWith(".html") ? HTML_COMMENT : JS_COMMENT}`
              )
            }
          })

        await Promise.all(tasks)
      }
    },
    {
      enforce: "post",
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
