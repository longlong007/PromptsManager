/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_SUPABASE_FUNCTION_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface VsCodeApi {
  postMessage(message: unknown): void
  getState(): unknown
  setState(state: unknown): void
}

declare function acquireVsCodeApi(): VsCodeApi
