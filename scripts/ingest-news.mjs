#!/usr/bin/env node
/**
 * MVP news ingestion.
 *
 * - telegram / vk: no scraping, no auth bypass, no credentials in the frontend.
 *   Every such source is marked ingestionStatus = "requires_credentials".
 * - website: best-effort RSS/Atom discovery (HTML <link rel="alternate">, then
 *   a few conventional paths), fetch of up to 3 latest items, 8s timeout,
 *   max 2 retries, concurrency capped at 3. One source's failure never aborts
 *   the run.
 *
 * No LLM summarization, no MTProto/VK API, no generic HTML scraper, no ML
 * ranking — deliberately out of scope for this MVP.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const registryFile = join(root, 'src', 'data', 'generated', 'sourceRegistry.json')
const outDir = join(root, 'src', 'data', 'generated')
const itemsFile = join(outDir, 'feedItems.json')
const reportFile = join(outDir, 'ingestionReport.json')

const TIMEOUT_MS = 8000
const MAX_RETRIES = 2
const CONCURRENCY = 3
const RSS_PATHS = ['/feed', '/feed/', '/rss', '/rss.xml', '/feed.xml', '/atom.xml']

function loadRegistry() {
  try {
    return JSON.parse(readFileSync(registryFile, 'utf8'))
  } catch {
    return []
  }
}

async function fetchWithTimeout(url, ms) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), ms)
  try {
    return await fetch(url, { signal: ctrl.signal, redirect: 'follow' })
  } finally {
    clearTimeout(timer)
  }
}

async function fetchWithRetry(url) {
  let lastErr
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetchWithTimeout(url, TIMEOUT_MS)
      if (res.ok) return res
      lastErr = new Error(`HTTP ${res.status}`)
    } catch (err) {
      lastErr = err
    }
  }
  throw lastErr
}

function findFeedLinkInHtml(html, baseUrl) {
  const m = html.match(/<link[^>]+rel=["']alternate["'][^>]*>/i)
  if (!m) return null
  const tag = m[0]
  const typeMatch = tag.match(/type=["'](application\/(rss\+xml|atom\+xml))["']/i)
  const hrefMatch = tag.match(/href=["']([^"']+)["']/i)
  if (!typeMatch || !hrefMatch) return null
  try {
    return new URL(hrefMatch[1], baseUrl).toString()
  } catch {
    return null
  }
}

function parseFeedXml(xml) {
  const items = []
  const itemBlocks = [...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)]
  const entryBlocks = [...xml.matchAll(/<entry\b[\s\S]*?<\/entry>/gi)]
  const blocks = itemBlocks.length > 0 ? itemBlocks : entryBlocks
  for (const block of blocks.slice(0, 3)) {
    const s = block[0]
    const title = (s.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '').replace(/<!\[CDATA\[|\]\]>/g, '').trim()
    const linkTag = s.match(/<link[^>]*\/?>(?:([\s\S]*?)<\/link>)?/i)
    const link = (linkTag?.[1]?.trim()) || (s.match(/<link[^>]*href=["']([^"']+)["']/i)?.[1]) || null
    const pub = s.match(/<(pubDate|published|updated)[^>]*>([\s\S]*?)<\/\1>/i)?.[2]?.trim() ?? null
    const desc = (s.match(/<(description|summary)[^>]*>([\s\S]*?)<\/\2>/i)?.[2] ?? '').replace(/<!\[CDATA\[|\]\]>/g, '').trim()
    if (title) items.push({ title, link, publishedAt: pub, description: desc })
  }
  return items
}

async function ingestWebsite(source) {
  try {
    const homeRes = await fetchWithRetry(source.canonicalUrl)
    const html = await homeRes.text()
    let feedUrl = findFeedLinkInHtml(html, source.canonicalUrl)

    if (!feedUrl) {
      for (const path of RSS_PATHS) {
        const candidate = new URL(path, source.canonicalUrl).toString()
        try {
          const res = await fetchWithRetry(candidate)
          const text = await res.text()
          if (/<rss|<feed/i.test(text)) { feedUrl = candidate; break }
        } catch {
          /* try next path */
        }
      }
    }

    if (!feedUrl) return { status: 'failed', reason: 'no-feed-found', items: [] }

    const feedRes = await fetchWithRetry(feedUrl)
    const xml = await feedRes.text()
    const rawItems = parseFeedXml(xml)
    const items = rawItems.map((it, i) => ({
      id: `${source.id}-item-${i + 1}`,
      sourceId: source.id,
      title: it.title,
      summary: it.description || '',
      originalUrl: it.link || source.canonicalUrl,
      imageUrl: null,
      publishedAt: it.publishedAt ?? null,
      feedKind: 'B',
      contentType: 'news',
      specialties: [],
      ingestionStatus: 'success',
    }))
    return { status: 'success', feedUrl, items }
  } catch (err) {
    return { status: 'failed', reason: String(err?.message ?? err), items: [] }
  }
}

async function mapWithConcurrency(list, limit, fn) {
  const results = new Array(list.length)
  let next = 0
  async function worker() {
    while (next < list.length) {
      const idx = next++
      results[idx] = await fn(list[idx], idx)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, list.length) }, worker))
  return results
}

async function main() {
  mkdirSync(outDir, { recursive: true })
  const sources = loadRegistry()

  const results = await mapWithConcurrency(sources, CONCURRENCY, async source => {
    if (source.platform === 'telegram' || source.platform === 'vk') {
      return { source, status: 'requires_credentials', items: [] }
    }
    const r = await ingestWebsite(source)
    return { source, status: r.status, reason: r.reason, items: r.items }
  })

  const feedItems = results.flatMap(r => r.items)
  const counts = results.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1
      return acc
    },
    { success: 0, failed: 0, requires_credentials: 0 },
  )

  const report = {
    generatedAt: new Date().toISOString(),
    totalSources: sources.length,
    counts,
    perSource: results.map(r => ({
      id: r.source.id,
      platform: r.source.platform,
      canonicalUrl: r.source.canonicalUrl,
      status: r.status,
      reason: r.reason ?? null,
      itemsFetched: r.items.length,
    })),
  }

  writeFileSync(itemsFile, JSON.stringify(feedItems, null, 2) + '\n', 'utf8')
  writeFileSync(reportFile, JSON.stringify(report, null, 2) + '\n', 'utf8')

  console.log(`Ingestion done: ${counts.success} success, ${counts.requires_credentials} requires_credentials, ${counts.failed} failed.`)
  console.log(`Wrote ${itemsFile} (${feedItems.length} items) and ${reportFile}`)
}

main()
