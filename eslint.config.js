import js from "@eslint/js"
import eslintPrettier from "eslint-config-prettier/flat"
import react from "eslint-plugin-react"
import { defineConfig, globalIgnores } from "eslint/config"
import globals from "globals"
import tseslint from "typescript-eslint"

export default defineConfig([
  globalIgnores(["dist/", ".pnpm-store/"]),
  {
    files: ["**/*.{html,ts,tsx}"],
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
      ecmaVersion: "latest",
      globals: { ...globals.browser }
    },
    rules: {
      "no-console": ["error", { allow: ["error"] }],
      "react/jsx-sort-props": [
        "error",
        {
          callbacksLast: true,
          shorthandFirst: true,
          multiline: "last",
          ignoreCase: true,
          reservedFirst: true
        }
      ],
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error"
    },
    settings: {
      react: {
        version: "detect"
      }
    }
  },
  eslintPrettier,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  tseslint.configs.recommended
])
