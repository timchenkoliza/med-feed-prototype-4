// Инлайнит JS и CSS в dist/index.html: прототип должен открываться и по http,
// и двойным кликом (file://), где внешние ES-модули блокируются браузером.
import { readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const dir = fileURLToPath(new URL('../dist/', import.meta.url))
const htmlPath = `${dir}index.html`
if (!existsSync(htmlPath)) process.exit(0)

let html = readFileSync(htmlPath, 'utf8')
const used = []

html = html.replace(/<script[^>]*src="\.\/(assets\/[^"]+)"[^>]*><\/script>/g, (_m, src) => {
  used.push(src)
  return `<script type="module">\n${readFileSync(dir + src, 'utf8')}\n</script>`
})
html = html.replace(/<link[^>]*rel="stylesheet"[^>]*href="\.\/(assets\/[^"]+)"[^>]*>/g, (_m, href) => {
  used.push(href)
  return `<style>\n${readFileSync(dir + href, 'utf8')}\n</style>`
})

writeFileSync(htmlPath, html, 'utf8')
for (const f of used) rmSync(dir + f, { force: true })
console.log(`dist/index.html — inlined ${used.length} asset(s)`)
