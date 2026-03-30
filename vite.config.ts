import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import removeAttributes from "rollup-plugin-jsx-remove-attributes"
import version from "vite-plugin-package-version"
import simpleHtml from "vite-plugin-simple-html"
import webFontDownload from "vite-plugin-webfont-dl"
import { defineConfig } from "vitest/config"

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 750,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "vendor",
              test: /node_modules/
            }
          ]
        }
      }
    }
  },
  plugins: [
    react(),
    removeAttributes({
      usage: "vite"
    }),
    simpleHtml({
      minify: true,
      inject: {
        data: {
          title: "Sᴏʙᴇᴙ Tᴙᴀᴄᴋᴇᴙ"
        }
      }
    }),
    tailwindcss(),
    version(),
    webFontDownload(
      [
        "https://fonts.googleapis.com/css2?family=Cairo+Play&display=swap"
      ],
      {
        assetsSubfolder: "fonts",
        injectAsStyleTag: false
      }
    )
  ],
  test: {
    disableConsoleIntercept: false, // for debug
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setup.ts",
    silent: true,
    coverage: {
      enabled: true,
      reporter: [
        "text"
      ]
    },
    include: [
      "./src/**/*.test.{ts,tsx}"
    ],
    reporters: [
      [
        "verbose",
        {
          summary: true
        }
      ]
    ]
  }
})
