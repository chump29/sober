interface ViteTypeOptions {
  strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
  readonly DEV: boolean
  readonly VITE_YEAR: number
  readonly VITE_MONTH: number
  readonly VITE_DAY: number
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
