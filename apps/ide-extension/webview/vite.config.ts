import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

const webviewRoot = resolve(__dirname)
const extensionRoot = resolve(__dirname, '..')

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, extensionRoot, 'VITE_')
  return {
  plugins: [react()],
  root: webviewRoot,
  base: './',
  envDir: extensionRoot,
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL ?? ''),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY ?? ''),
    'import.meta.env.VITE_SUPABASE_FUNCTION_URL': JSON.stringify(env.VITE_SUPABASE_FUNCTION_URL ?? ''),
  },
  build: {
    outDir: resolve(__dirname, '../dist/webview'),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
  }
})
