import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const rootDir = fileURLToPath(new URL('.', import.meta.url))
const at = (p: string) => fileURLToPath(new URL(p, import.meta.url))

/**
 * FEED=a | FEED=b — сборка отдельной статической страницы исследования
 * в dist/feed-a или dist/feed-b. Каждая папка самодостаточна:
 * собственный index.html + assets, только относительные пути.
 *
 * Без FEED собирается прежний прототип (dist/prototype).
 */
const feed = process.env.FEED

export default defineConfig(() => {
  if (feed === 'a' || feed === 'b') {
    return {
      plugins: [react()],
      base: './',
      root: at(`pages/feed-${feed}/`),
      publicDir: at('public/'),
      build: {
        outDir: at(`dist/feed-${feed}/`),
        emptyOutDir: true,
        assetsDir: 'assets',
      },
      server: { port: feed === 'a' ? 5174 : 5175, host: true },
    }
  }

  return {
    plugins: [react()],
    base: process.env.VITE_BASE ?? './',
    root: rootDir,
    build: { outDir: at('dist/prototype/'), emptyOutDir: true },
    server: { port: 5173, host: true },
  }
})
