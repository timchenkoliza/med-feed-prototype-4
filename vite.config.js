import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
var at = function (p) { return fileURLToPath(new URL(p, import.meta.url)); };
// Один прототип — одна сборка: pages/app -> dist/. Только относительные пути.
export default defineConfig({
    plugins: [react()],
    base: './',
    root: at('pages/app/'),
    publicDir: at('public/'),
    build: { outDir: at('dist/'), emptyOutDir: true, assetsDir: 'assets' },
    server: { port: 5173, host: true },
});
