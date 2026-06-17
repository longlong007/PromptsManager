import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
/** 营销站部署在域名根路径 promptrepo.com */
var base = process.env.VITE_BASE || (process.env.VERCEL ? '/' : '/');
export default defineConfig({
    plugins: [react()],
    base: base,
    envPrefix: ['VITE_'],
    server: {
        port: 5174,
        strictPort: true,
    },
});
