import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
var host = process.env.TAURI_DEV_HOST;
var isTauri = !!(host || process.env.TAURI_ENV_PLATFORM);
/** Vercel 部署在域名根路径；GitHub Pages 一般为 /<仓库名>/；Tauri/Capacitor 使用根路径 */
var base = isTauri
    ? '/'
    : process.env.VITE_BASE ||
        (process.env.VERCEL ? '/' : '/PromptsManager/');
export default defineConfig({
    plugins: [react()],
    base: base,
    clearScreen: false,
    envPrefix: ['VITE_', 'TAURI_'],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@shared': path.resolve(__dirname, '../../packages/shared/src'),
        },
    },
    server: isTauri
        ? {
            port: 5173,
            strictPort: true,
            host: host || false,
            hmr: host
                ? {
                    protocol: 'ws',
                    host: host,
                    port: 1421,
                }
                : undefined,
            watch: {
                ignored: ['**/src-tauri/**'],
            },
        }
        : undefined,
});
