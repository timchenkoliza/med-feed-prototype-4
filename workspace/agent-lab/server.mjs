import http from 'node:http'
import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, extname } from 'node:path'
import { randomUUID } from 'node:crypto'
import { AGENTS, orchestrate } from './orchestrator.mjs'
import { providerConfig } from './provider.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const publicDir = join(here, 'public')
const runsDir = join(here, 'runs')
mkdirSync(runsDir, { recursive: true })

const PORT = Number(process.env.PORT || 8787)
const runs = new Map()

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
}

function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  res.end(JSON.stringify(body))
}

async function readJson(req) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > 100_000) throw new Error('Request body too large')
    chunks.push(chunk)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
}

function snapshot(run) {
  return {
    id: run.id,
    url: run.url,
    status: run.status,
    createdAt: run.createdAt,
    completedAt: run.completedAt || null,
    events: run.events,
    result: run.result || null,
    error: run.error || null,
  }
}

function emit(run, event) {
  run.events.push(event)
  for (const res of run.listeners) res.write(`data: ${JSON.stringify(event)}\n\n`)
}

function persist(run) {
  writeFileSync(join(runsDir, `${run.id}.json`), JSON.stringify(snapshot(run), null, 2) + '\n', 'utf8')
}

async function startRun(url) {
  const run = {
    id: randomUUID(),
    url,
    status: 'running',
    createdAt: new Date().toISOString(),
    events: [],
    listeners: new Set(),
  }
  runs.set(run.id, run)
  queueMicrotask(async () => {
    try {
      emit(run, { type: 'run', status: 'running', at: new Date().toISOString() })
      const result = await orchestrate(url, event => emit(run, { type: 'agent', ...event }))
      run.result = result
      run.status = 'done'
      run.completedAt = new Date().toISOString()
      emit(run, { type: 'run', status: 'done', decision: result.final.decision, at: run.completedAt })
      persist(run)
    } catch (err) {
      run.status = 'error'
      run.error = String(err?.message || err)
      run.completedAt = new Date().toISOString()
      emit(run, { type: 'run', status: 'error', error: run.error, at: run.completedAt })
      persist(run)
    } finally {
      for (const res of run.listeners) res.end()
      run.listeners.clear()
    }
  })
  return run
}

function serveStatic(req, res) {
  const pathname = new URL(req.url, `http://${req.headers.host || 'localhost'}`).pathname
  const rel = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '')
  const safe = rel.replace(/\.\./g, '')
  const path = join(publicDir, safe)
  if (!path.startsWith(publicDir) || !existsSync(path)) return false
  const content = readFileSync(path)
  res.writeHead(200, { 'content-type': mime[extname(path)] || 'application/octet-stream' })
  res.end(content)
  return true
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)

    if (req.method === 'GET' && url.pathname === '/api/health') {
      return json(res, 200, { ok: true, provider: providerConfig(), agents: AGENTS.length })
    }
    if (req.method === 'GET' && url.pathname === '/api/agents') {
      return json(res, 200, { agents: AGENTS })
    }
    if (req.method === 'POST' && url.pathname === '/api/runs') {
      const body = await readJson(req)
      if (!body.url || typeof body.url !== 'string') return json(res, 400, { error: 'url is required' })
      const run = await startRun(body.url)
      return json(res, 202, { runId: run.id })
    }

    const runMatch = url.pathname.match(/^\/api\/runs\/([a-f0-9-]+)$/i)
    if (req.method === 'GET' && runMatch) {
      const run = runs.get(runMatch[1])
      if (!run) return json(res, 404, { error: 'run not found in current process' })
      return json(res, 200, snapshot(run))
    }

    const eventsMatch = url.pathname.match(/^\/api\/runs\/([a-f0-9-]+)\/events$/i)
    if (req.method === 'GET' && eventsMatch) {
      const run = runs.get(eventsMatch[1])
      if (!run) return json(res, 404, { error: 'run not found' })
      res.writeHead(200, {
        'content-type': 'text/event-stream',
        'cache-control': 'no-cache, no-transform',
        connection: 'keep-alive',
      })
      for (const event of run.events) res.write(`data: ${JSON.stringify(event)}\n\n`)
      if (run.status === 'running') run.listeners.add(res)
      else res.end()
      req.on('close', () => run.listeners.delete(res))
      return
    }

    if (req.method === 'GET' && serveStatic(req, res)) return
    json(res, 404, { error: 'not found' })
  } catch (err) {
    json(res, 500, { error: String(err?.message || err) })
  }
})

server.listen(PORT, () => {
  const cfg = providerConfig()
  console.log(`Med Feed Agent Lab: http://localhost:${PORT}`)
  console.log(`Provider mode=${cfg.mode}, model=${cfg.model}`)
  if (cfg.mode === 'mock') console.log('Set LLM_API_KEY (and optionally LLM_BASE_URL / LLM_MODEL) for live generation.')
})
