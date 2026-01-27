import js from "@eslint/js"
import eslintPrettier from "eslint-config-prettier/flat"
import importPlugin from "eslint-plugin-import"
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
      "import/no-duplicates": "error",
      "import/no-named-as-default": "error",
      "import/no-named-as-default-member": "error",
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
      "import/resolver": {
        typescript: {}
      },
      react: {
        version: "detect"
      }
    }
  },
  eslintPrettier,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  tseslint.configs.recommended
])
