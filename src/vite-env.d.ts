interface ViteTypeOptions {
  strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
  readonly DEV: boolean
  readonly VITE_DATE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
