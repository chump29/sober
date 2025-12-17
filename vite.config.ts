import yearPlugin from "@8hobbies/vite-plugin-year"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { ViteImageOptimizer } from "vite-plugin-image-optimizer"
import versionPlugin from "vite-plugin-package-version"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ViteImageOptimizer(),
    yearPlugin(),
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
