import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import removeAttributes from "rollup-plugin-jsx-remove-attributes"
import { ViteImageOptimizer as imageOptimizer } from "vite-plugin-image-optimizer"
import version from "vite-plugin-package-version"
import simpleHtml from "vite-plugin-simple-html"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [
    imageOptimizer(),
    react(),
    removeAttributes({
      attributes: ["data-testid"],
      usage: "vite"
    }),
    simpleHtml({
      inject: {
        data: {
          title: "Sᴏʙᴇᴙ Tᴙᴀᴄᴋᴇᴙ"
        }
      },
      minify: true
    }),
    tailwindcss(),
    version()
  ],
  test: {
    environment: "jsdom",
    globals: true,
    include: ["./src/**/*.test.tsx"],
    reporters: [["verbose", { summary: true }]],
    setupFiles: "./src/setup.ts",
    silent: true
  }
})
