import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages relative base; override via VITE_BASE if publishing under subpath.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE ?? './',
  server: { port: 5173, host: true },
})
