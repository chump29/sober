interface ViteTypeOptions {
  strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
  readonly DEV: boolean
  readonly VITE_SOBER_DATE: string
  readonly PACKAGE_VERSION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
