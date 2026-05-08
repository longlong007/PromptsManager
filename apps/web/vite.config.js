import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
/** Vercel 部署在域名根路径；GitHub Pages 一般为 /<仓库名>/ */
var base = process.env.VITE_BASE ||
    (process.env.VERCEL ? '/' : '/PromptsManager/');
export default defineConfig({
    plugins: [react()],
    base: base,
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@shared': path.resolve(__dirname, '../../packages/shared/src'),
        },
    },
});
