const DEFAULT_TIMEOUT_MS = 90000

function extractJson(text) {
  if (!text) throw new Error('Empty LLM response')
  const trimmed = text.trim()
  try { return JSON.parse(trimmed) } catch {}
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]
  if (fenced) return JSON.parse(fenced)
  const start = trimmed.indexOf('{')
  const end = trimmed.lastIndexOf('}')
  if (start >= 0 && end > start) return JSON.parse(trimmed.slice(start, end + 1))
  throw new Error('LLM did not return valid JSON')
}

export function providerConfig() {
  return {
    mode: process.env.LLM_MODE || (process.env.LLM_API_KEY ? 'live' : 'mock'),
    baseUrl: (process.env.LLM_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, ''),
    model: process.env.LLM_MODEL || 'gpt-5.6-sol',
  }
}

export async function runJsonAgent({ system, user, schemaHint, temperature = 0 }) {
  const cfg = providerConfig()
  if (cfg.mode === 'mock') return mockAgent(system, user)

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), Number(process.env.LLM_TIMEOUT_MS || DEFAULT_TIMEOUT_MS))
  try {
    const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        'content-type': 'application/json',
        'authorization': `Bearer ${process.env.LLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: cfg.model,
        temperature,
        messages: [
          { role: 'system', content: `${system}\nReturn JSON only.${schemaHint ? `\nExpected shape:\n${schemaHint}` : ''}` },
          { role: 'user', content: user },
        ],
      }),
    })
    if (!res.ok) throw new Error(`LLM HTTP ${res.status}: ${(await res.text()).slice(0, 500)}`)
    const data = await res.json()
    const text = data?.choices?.[0]?.message?.content
    return extractJson(text)
  } finally {
    clearTimeout(timer)
  }
}

function mockAgent(system, user) {
  const tag = `${system}\n${user}`.toLowerCase()
  if (tag.includes('fact extractor')) return {
    study_type: 'not_assessed_in_mock_mode',
    population: null,
    sample_size: null,
    intervention: null,
    comparator: null,
    outcomes: [],
    safety: [],
    limitations: ['Mock mode: no medical facts inferred'],
    evidence_spans: [],
  }
  if (tag.includes('medical translator')) return {
    title_ru: '[MOCK] Перевод требует LLM_API_KEY',
    description_ru: '[MOCK] Перевод требует LLM_API_KEY',
  }
  if (tag.includes('summary editor')) return {
    title_ru: '[MOCK] Заголовок не сгенерирован',
    brief: ['Подключите LLM-провайдер для генерации.'],
    for_practice: [],
  }
  if (tag.includes('clinical classifier')) return {
    content_type: 'unknown',
    study_type: 'unknown',
    evidence_level: 'not_assessed',
    specialties: [],
    clinical_topics: [],
    interventions: [],
    tags: [],
  }
  if (tag.includes('medical auditor')) return {
    critical_errors: [],
    warnings: ['Mock mode: semantic audit not performed'],
    factuality: null,
    completeness: null,
    medical_correctness: null,
    translation_fidelity: null,
  }
  return {}
}
