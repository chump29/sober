import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import removeAttributes from "rollup-plugin-jsx-remove-attributes"
import { ViteImageOptimizer } from "vite-plugin-image-optimizer"
import versionPlugin from "vite-plugin-package-version"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [
    react(),
    removeAttributes({
      attributes: ["data-testid"],
      usage: "vite"
    }),
    tailwindcss(),
    ViteImageOptimizer(),
    versionPlugin()
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
