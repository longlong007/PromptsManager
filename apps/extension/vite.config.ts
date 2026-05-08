import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { readFileSync } from 'fs'
function manifestPlugin() {
  return {
    name: 'copy-manifest',
    generateBundle() {
      const manifestPath = resolve(__dirname, 'manifest.json')
      this.emitFile({
        type: 'asset',
        fileName: 'manifest.json',
        source: readFileSync(manifestPath, 'utf-8'),
      })
    },
  }
}
export default defineConfig({
  plugins: [react(), manifestPlugin()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
        sidepanel: resolve(__dirname, 'sidepanel.html'),
        options: resolve(__dirname, 'options.html'),
      },
    },
  },
})