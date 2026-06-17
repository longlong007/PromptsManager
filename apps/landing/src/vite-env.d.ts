/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Web 应用根地址，如 https://app.promptrepo.com 或 http://localhost:5173/PromptsManager */
  readonly VITE_APP_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
