import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { runJsonAgent, providerConfig } from './provider.mjs'

const here = dirname(fileURLToPath(import.meta.url))
export const AGENTS = JSON.parse(readFileSync(join(here, 'agents.json'), 'utf8'))

const FACT_SCHEMA = JSON.stringify({
  content_type: 'news|research|guideline|regulatory|event|education|other',
  study_type: 'string|null',
  population: 'string|null',
  sample_size: 'number|string|null',
  intervention: 'string|null',
  comparator: 'string|null',
  outcomes: [{ name: 'string', result: 'string', endpoint_type: 'primary|secondary|other|unknown' }],
  safety: ['string'],
  limitations: ['string'],
  regulatory_status: 'string|null',
  key_claims: ['string'],
  evidence_spans: [{ claim: 'string', quote: 'exact source fragment, max 30 words' }]
}, null, 2)

function decodeEntities(s = '') {
  return s
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
}

function stripHtml(html = '') {
  return decodeEntities(html)
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/(p|div|section|article|main|li|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
    .trim()
}

function meta(html, names) {
  for (const name of names) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const patterns = [
      new RegExp(`<meta[^>]+(?:name|property)=["']${escaped}["'][^>]+content=["']([^"']*)["'][^>]*>`, 'i'),
      new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${escaped}["'][^>]*>`, 'i'),
    ]
    for (const p of patterns) {
      const v = html.match(p)?.[1]
      if (v) return decodeEntities(v.trim())
    }
  }
  return null
}

function tagText(html, tag) {
  const v = html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))?.[1]
  return v ? stripHtml(v) : null
}

function validateUrl(input) {
  const u = new URL(input)
  if (!['http:', 'https:'].includes(u.protocol)) throw new Error('Only http/https URLs are allowed')
  const h = u.hostname.toLowerCase()
  if (h === 'localhost' || h.endsWith('.local') || h === '0.0.0.0' || h === '127.0.0.1' || h === '::1') {
    throw new Error('Local/private targets are not allowed')
  }
  if (/^(10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(h)) {
    throw new Error('Private-network targets are not allowed')
  }
  return u
}

async function fetchArticle(url) {
  const u = validateUrl(url)
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 15000)
  try {
    const res = await fetch(u, {
      signal: ctrl.signal,
      redirect: 'follow',
      headers: { 'user-agent': 'YandexMedContentLab/0.1 (+evaluation prototype)' }
    })
    if (!res.ok) throw new Error(`Article fetch failed: HTTP ${res.status}`)
    const type = res.headers.get('content-type') || ''
    if (!type.includes('text/html') && !type.includes('application/xhtml+xml')) {
      throw new Error(`Unsupported content type: ${type || 'unknown'}`)
    }
    const html = await res.text()
    const bodyCandidate = html.match(/<(article|main)\b[^>]*>([\s\S]*?)<\/\1>/i)?.[2] || html
    const body = stripHtml(bodyCandidate).slice(0, 50000)
    return {
      url: res.url,
      language: (html.match(/<html[^>]+lang=["']([^"']+)["']/i)?.[1] || 'unknown').toLowerCase(),
      title_original: meta(html, ['og:title', 'twitter:title']) || tagText(html, 'title'),
      description_original: meta(html, ['description', 'og:description', 'twitter:description']),
      author_original: meta(html, ['author', 'article:author']),
      publication_date_original: meta(html, ['article:published_time', 'date', 'datePublished']),
      publisher: meta(html, ['og:site_name']) || u.hostname,
      body_text: body,
      extraction: {
        method: bodyCandidate === html ? 'html_fallback' : 'article_or_main',
        characters: body.length,
      },
    }
  } finally {
    clearTimeout(timer)
  }
}

function numbers(text = '') {
  return [...text.matchAll(/(?<!\w)(?:\d{1,3}(?:[\s,.]\d{3})+|\d+(?:[.,]\d+)?)(?:\s?%|\s?(?:mg|mcg|g|kg|ml|mmol|mmhg|years?|months?|days?))?/gi)]
    .map(m => m[0].replace(/\s+/g, ' ').trim())
}

function normalizeNumberToken(s) {
  return s.toLowerCase().replace(/\s/g, '').replace(',', '.')
}

function deterministicChecks(source, translation, summary) {
  const srcNumbers = new Set(numbers(`${source.title_original || ''} ${source.description_original || ''} ${source.body_text || ''}`).map(normalizeNumberToken))
  const outNumbers = numbers(JSON.stringify({ translation, summary })).map(normalizeNumberToken)
  const inventedNumbers = [...new Set(outNumbers.filter(n => !srcNumbers.has(n)))]
  const sourceHasNegation = /\b(no|not|without|did not|does not|не|нет|без)\b/i.test(source.body_text || '')
  return {
    invented_numbers: inventedNumbers,
    source_has_negation: sourceHasNegation,
    source_number_count: srcNumbers.size,
    output_number_count: outNumbers.length,
  }
}

const prompts = {
  facts: {
    system: `You are Fact Extractor in a medical-news evaluation harness. Extract only facts explicitly supported by the supplied source. Do not add medical knowledge. Preserve population, intervention, comparator, endpoint type, direction of effect, numbers, units, time windows, uncertainty, adverse events, limitations and regulatory status. Evidence spans must be verbatim source fragments and short enough for verification. If a field is not supported, return null/[] rather than infer.`,
  },
  translation: {
    system: `You are Medical Translator. Translate only the provided original title and original description into Russian. The translation is a benchmark, not editorial rewriting. Preserve medical meaning, named entities, drug names, numbers, units, negation, modality and causal strength. Never upgrade association to causation, possibility to certainty, subgroup results to the whole population, or add facts from the article body. Natural Russian is preferred over calque, but semantic equivalence is mandatory.`,
  },
  summary: {
    system: `You are Summary Editor for a professional physician feed. Write only from the supplied structured fact layer. Never use outside knowledge. title_ru must communicate the event/result without clickbait. brief must contain 2–3 concise sentences covering what happened/studied, population/sample when relevant, and the main result. for_practice may contain 0–3 bullets. A bullet may state applicability, a source-supported practice change, a limitation, or a monitoring/consideration point. Do not create clinical recommendations that are not supported by the source. If the source does not justify an action, prefer an applicability or limitation statement.`,
  },
  classify: {
    system: `You are Clinical Classifier. Classify the material strictly from the supplied fact layer. Do not infer an evidence grade from prestige or source type. If evidence level cannot be mapped safely, use not_assessed. Return specialties/topics/interventions only when supported.`,
  },
  audit: {
    system: `You are Medical Auditor. Compare the proposed translation, summary and classification against the original source and structured fact layer. Prioritize patient-safety and meaning-preservation errors: wrong drug, population, comparator, direction of effect, dose/unit, contraindication, unsupported recommendation, association->causation, modality/negation change, endpoint confusion, subgroup generalization, invented number. Do not score style as a critical medical error.`,
  },
}

function compactSource(source) {
  return JSON.stringify({
    url: source.url,
    language: source.language,
    publisher: source.publisher,
    title_original: source.title_original,
    description_original: source.description_original,
    author_original: source.author_original,
    publication_date_original: source.publication_date_original,
    body_text: source.body_text,
  }, null, 2)
}

export async function orchestrate(url, emit = () => {}) {
  const outputs = {}
  const update = (agentId, status, detail = null) => emit({ agentId, status, detail, at: new Date().toISOString() })

  update('source_guardian', 'running')
  const source = await fetchArticle(url)
  outputs.source_guardian = source
  update('source_guardian', 'done', { title: source.title_original, chars: source.extraction.characters })

  update('fact_extractor', 'running')
  update('translator', 'running')
  const [facts, translation] = await Promise.all([
    runJsonAgent({
      system: prompts.facts.system,
      schemaHint: FACT_SCHEMA,
      user: compactSource(source),
    }).then(v => { outputs.fact_extractor = v; update('fact_extractor', 'done'); return v })
      .catch(err => { update('fact_extractor', 'error', err.message); throw err }),
    runJsonAgent({
      system: prompts.translation.system,
      schemaHint: JSON.stringify({ title_ru: 'string|null', description_ru: 'string|null' }),
      user: JSON.stringify({ title_original: source.title_original, description_original: source.description_original }, null, 2),
    }).then(v => { outputs.translator = v; update('translator', 'done'); return v })
      .catch(err => { update('translator', 'error', err.message); throw err }),
  ])

  update('summary_editor', 'running')
  update('classifier', 'running')
  const [summary, classification] = await Promise.all([
    runJsonAgent({
      system: prompts.summary.system,
      schemaHint: JSON.stringify({ title_ru: 'string', brief: ['string'], for_practice: ['string'] }),
      user: JSON.stringify(facts, null, 2),
    }).then(v => { outputs.summary_editor = v; update('summary_editor', 'done'); return v })
      .catch(err => { update('summary_editor', 'error', err.message); throw err }),
    runJsonAgent({
      system: prompts.classify.system,
      schemaHint: JSON.stringify({ content_type: 'string', study_type: 'string|null', evidence_level: 'string', specialties: ['string'], clinical_topics: ['string'], interventions: ['string'], tags: ['string'] }),
      user: JSON.stringify(facts, null, 2),
    }).then(v => { outputs.classifier = v; update('classifier', 'done'); return v })
      .catch(err => { update('classifier', 'error', err.message); throw err }),
  ])

  update('medical_auditor', 'running')
  const deterministic = deterministicChecks(source, translation, summary)
  const semanticAudit = await runJsonAgent({
    system: prompts.audit.system,
    schemaHint: JSON.stringify({ critical_errors: [{ code: 'string', claim: 'string', reason: 'string', evidence: 'string|null' }], warnings: ['string'], factuality: '1-5|null', completeness: '1-5|null', medical_correctness: '1-5|null', translation_fidelity: '1-5|null' }),
    user: JSON.stringify({ source, facts, translation, summary, classification, deterministic }, null, 2),
  })
  const audit = { ...semanticAudit, deterministic }
  outputs.medical_auditor = audit
  update('medical_auditor', 'done', { criticalErrors: audit.critical_errors?.length || 0, inventedNumbers: deterministic.invented_numbers.length })

  update('editor_in_chief', 'running')
  const criticalErrors = Array.isArray(audit.critical_errors) ? audit.critical_errors : []
  if (deterministic.invented_numbers.length) {
    criticalErrors.push({ code: 'invented_number', claim: deterministic.invented_numbers.join(', '), reason: 'Number appears in generated output but not in source', evidence: null })
  }
  const provider = providerConfig()
  const decision = provider.mode === 'mock' ? 'REVIEW' : criticalErrors.length ? 'FAIL' : 'PASS'
  const final = {
    decision,
    source,
    translation,
    facts,
    product: { ...summary, ...classification },
    audit: { ...audit, critical_errors: criticalErrors },
    provenance: {
      provider_mode: provider.mode,
      model: provider.model,
      pipeline: 'source→facts || translation→summary/classification→audit→editor',
      generated_at: new Date().toISOString(),
    },
  }
  outputs.editor_in_chief = final
  update('editor_in_chief', 'done', { decision })
  return { outputs, final }
}
