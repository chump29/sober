import js from "@eslint/js"
import react from "eslint-plugin-react"
import { defineConfig, globalIgnores } from "eslint/config"
import globals from "globals"
import tseslint from "typescript-eslint"

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      js,
      react
    },
    extends: ["js/recommended"],
    languageOptions: {
      parserOptions: {
        emcaFeatures: {
          jsx: true
        }
      },
      ecmaVersion: 2020,
      globals: { ...globals.browser }
    },
    rules: {
      "no-console": ["error", { allow: ["error"] }],
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error"
    },
    settings: {
      react: {
        version: "detect"
      }
    }
  },
  tseslint.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"]
])
