// Инлайнит JS и CSS прямо в index.html каждой ленты.
// Зачем: страница должна открываться и по http, и двойным кликом (file://),
// где браузер блокирует загрузку внешних ES-модулей.
import { readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const dist = fileURLToPath(new URL('../dist/', import.meta.url))

for (const feed of ['feed-a', 'feed-b']) {
  const dir = `${dist}${feed}/`
  const htmlPath = `${dir}index.html`
  if (!existsSync(htmlPath)) continue

  let html = readFileSync(htmlPath, 'utf8')
  const used = []

  html = html.replace(
    /<script[^>]*src="\.\/(assets\/[^"]+)"[^>]*><\/script>/g,
    (_m, src) => {
      used.push(src)
      const code = readFileSync(dir + src, 'utf8')
      return `<script type="module">\n${code}\n</script>`
    },
  )

  html = html.replace(
    /<link[^>]*rel="stylesheet"[^>]*href="\.\/(assets\/[^"]+)"[^>]*>/g,
    (_m, href) => {
      used.push(href)
      const css = readFileSync(dir + href, 'utf8')
      return `<style>\n${css}\n</style>`
    },
  )

  writeFileSync(htmlPath, html, 'utf8')
  for (const f of used) rmSync(dir + f, { force: true })
  console.log(`${feed}/index.html — inlined ${used.length} asset(s)`)
}
