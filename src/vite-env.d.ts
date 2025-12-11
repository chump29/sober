interface ViteTypeOptions {
  strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
  readonly DEV: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
