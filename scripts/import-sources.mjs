#!/usr/bin/env node
/**
 * Reads CSV files under data/sources/ (one file per original xlsx sheet) and
 * writes a normalized src/data/generated/sourceRegistry.json.
 *
 * Only Node built-ins are used — no xlsx/csv-parse dependency needed because
 * the input is already plain CSV.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const sourcesDir = join(root, 'data', 'sources')
const outDir = join(root, 'src', 'data', 'generated')
const outFile = join(outDir, 'sourceRegistry.json')

/** filename (without extension) -> human sheet name from the original xlsx workbook. */
const sheetNames = {
  blogery: 'Блогеры',
  medsoobshestva: 'Мед. сообщества',
  medportaly: 'Мед порталы и соцсети для врачей',
}

function parseCsv(text) {
  return text
    .split(/\r?\n/)
    .filter(line => line.length > 0)
    .map(line => line.split(';').map(cell => cell.trim()))
}

function toNumberOrNull(v) {
  if (v == null || v === '') return null
  const n = Number(v.replace(/[^\d.-]/g, ''))
  return Number.isFinite(n) ? n : null
}

function detectPlatform(url) {
  const u = url.toLowerCase()
  if (u.includes('t.me') || u.includes('telegram.me') || u.includes('telegram.org')) return 'telegram'
  if (u.includes('vk.com')) return 'vk'
  return 'website'
}

/**
 * Handles the malformed "Telegram: View @handle" value by normalizing it to a
 * canonical t.me URL built from the handle — simpler than dropping the row,
 * and the handle is unambiguous.
 */
function normalizeLink(raw) {
  const value = raw.trim()
  const malformed = value.match(/@([\w\d_]+)/)
  if (!/^https?:\/\//i.test(value) && malformed) {
    return { canonicalUrl: `https://t.me/${malformed[1]}`, wasMalformed: true }
  }
  let url = value
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`
  try {
    const u = new URL(url)
    u.hostname = u.hostname.toLowerCase()
    let canonical = `${u.protocol}//${u.hostname}${u.pathname.replace(/\/+$/, '')}`
    return { canonicalUrl: canonical, wasMalformed: false }
  } catch {
    return { canonicalUrl: null, wasMalformed: false }
  }
}

function importSheet(fileName) {
  const group = basename(fileName, '.csv')
  const filePath = join(sourcesDir, fileName)
  const rows = parseCsv(readFileSync(filePath, 'utf8'))
  if (rows.length === 0) return { group, sources: [], skipped: 0 }

  const [, ...dataRows] = rows // first row is the header
  const sources = []
  const seenCanonical = new Set()
  let skipped = 0

  dataRows.forEach((cols, idx) => {
    const sourceRow = idx + 2 // +1 for header, +1 for 1-based line numbers
    const [name, description, link, avgDailyReach, subscribers] = cols
    if (!name && !link) return // header-only / fully empty row
    if (!link || !link.trim()) { skipped++; return }

    const { canonicalUrl, wasMalformed } = normalizeLink(link)
    if (!canonicalUrl) { skipped++; return }
    if (seenCanonical.has(canonicalUrl)) { skipped++; return }
    seenCanonical.add(canonicalUrl)

    sources.push({
      id: `${group}-${sourceRow}`,
      name: name?.trim() || null,
      description: description?.trim() || null,
      originalUrl: link.trim(),
      canonicalUrl,
      platform: detectPlatform(canonicalUrl),
      sourceGroup: sheetNames[group] ?? group,
      averageDailyReach: toNumberOrNull(avgDailyReach),
      subscribers: toNumberOrNull(subscribers),
      reviewStatus: 'review_required',
      ingestionMethod: wasMalformed ? 'csv-import-normalized-handle' : 'csv-import',
      ingestionStatus: 'pending',
      sourceSheet: sheetNames[group] ?? group,
      sourceRow,
    })
  })

  return { group, sources, skipped }
}

function main() {
  mkdirSync(outDir, { recursive: true })

  let files = []
  try {
    files = readdirSync(sourcesDir).filter(f => f.endsWith('.csv'))
  } catch {
    files = []
  }

  const all = []
  const summary = []
  for (const file of files) {
    const { group, sources, skipped } = importSheet(file)
    all.push(...sources)
    const platforms = sources.reduce((acc, s) => {
      acc[s.platform] = (acc[s.platform] ?? 0) + 1
      return acc
    }, {})
    summary.push({ sheet: group, imported: sources.length, skipped, platforms })
  }

  writeFileSync(outFile, JSON.stringify(all, null, 2) + '\n', 'utf8')

  console.log(`Imported ${all.length} sources from ${files.length} sheet(s):`)
  for (const s of summary) {
    console.log(`  ${s.sheet}: ${s.imported} imported, ${s.skipped} skipped, platforms=${JSON.stringify(s.platforms)}`)
  }
  console.log(`Wrote ${outFile}`)
}

main()
