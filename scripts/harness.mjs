#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const evalsDir = join(root, 'evals')
const goldDir = join(evalsDir, 'gold')
const candidateDir = join(evalsDir, 'candidates')
const rulesFile = join(evalsDir, 'rules', 'content-rules.json')

function fail(message) {
  console.error(`ERROR: ${message}`)
  process.exitCode = 1
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function jsonFiles(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter(name => name.endsWith('.json'))
    .sort()
    .map(name => ({ name, path: join(dir, name), data: readJson(join(dir, name)) }))
}

function assert(condition, message, errors) {
  if (!condition) errors.push(message)
}

function numericTokens(text) {
  const matches = String(text ?? '').match(/\d+(?:[.,]\d+)?/g) ?? []
  return matches.map(v => v.replace(',', '.'))
}

function allOutputText(candidate) {
  const practice = candidate.output?.forPractice?.map(x => x.text).join('\n') ?? ''
  return [
    candidate.translation?.titleRu,
    candidate.translation?.descriptionRu,
    candidate.output?.titleRu,
    candidate.output?.brief,
    practice,
  ].filter(Boolean).join('\n')
}

function validateGold(gold, rules) {
  const errors = []
  assert(gold.schemaVersion, 'schemaVersion is required', errors)
  assert(gold.articleId, 'articleId is required', errors)
  assert(gold.source?.url, 'source.url is required', errors)
  assert(gold.source?.originalTitle, 'source.originalTitle is required', errors)
  assert(Array.isArray(gold.factsGold) && gold.factsGold.length > 0, 'factsGold must be non-empty', errors)

  const ids = new Set()
  for (const fact of gold.factsGold ?? []) {
    assert(fact.factId, 'every fact requires factId', errors)
    assert(!ids.has(fact.factId), `duplicate factId ${fact.factId}`, errors)
    ids.add(fact.factId)
    assert(fact.value, `${fact.factId}: value is required`, errors)
    assert(fact.evidenceLocator, `${fact.factId}: evidenceLocator is required`, errors)
    assert(fact.evidenceAnchor, `${fact.factId}: evidenceAnchor is required`, errors)
  }

  for (const ref of gold.productGold?.briefFactRefs ?? []) {
    assert(ids.has(ref), `productGold.briefFactRefs references unknown ${ref}`, errors)
  }

  const allowedPractice = new Set(rules.forPractice.allowedTypes)
  for (const bullet of gold.productGold?.forPractice ?? []) {
    assert(allowedPractice.has(bullet.type), `productGold practice type is not allowed: ${bullet.type}`, errors)
    assert(Array.isArray(bullet.factRefs) && bullet.factRefs.length > 0, 'productGold practice bullet needs factRefs', errors)
    for (const ref of bullet.factRefs ?? []) {
      assert(ids.has(ref), `productGold practice bullet references unknown ${ref}`, errors)
    }
  }

  return errors
}

function collectCandidateRefs(candidate) {
  const refs = [
    ...(candidate.output?.titleFactRefs ?? []),
    ...(candidate.output?.briefFactRefs ?? []),
  ]
  for (const bullet of candidate.output?.forPractice ?? []) refs.push(...(bullet.factRefs ?? []))
  return refs
}

function scoreCandidate(candidate, gold, rules) {
  const structuralErrors = []
  const criticalErrors = []

  assert(candidate.candidateId, 'candidateId is required', structuralErrors)
  assert(candidate.articleId, 'articleId is required', structuralErrors)
  assert(rules.pipelines.includes(candidate.pipeline), `unknown pipeline ${candidate.pipeline}`, structuralErrors)
  assert(candidate.model, 'model is required', structuralErrors)
  assert(candidate.promptVersion, 'promptVersion is required', structuralErrors)
  assert(candidate.output?.titleRu, 'output.titleRu is required', structuralErrors)
  assert(candidate.output?.brief, 'output.brief is required', structuralErrors)

  const factIds = new Set((gold.factsGold ?? []).map(x => x.factId))
  for (const ref of collectCandidateRefs(candidate)) {
    if (!factIds.has(ref)) {
      criticalErrors.push({ code: 'ungrounded_claim', message: `unknown evidence ref ${ref}` })
    }
  }

  const allowedPractice = new Set(rules.forPractice.allowedTypes)
  for (const bullet of candidate.output?.forPractice ?? []) {
    if (!allowedPractice.has(bullet.type)) {
      structuralErrors.push(`practice type is not allowed: ${bullet.type}`)
    }
    if (!Array.isArray(bullet.factRefs) || bullet.factRefs.length === 0) {
      criticalErrors.push({ code: 'ungrounded_claim', message: `practice bullet has no factRefs: ${bullet.text}` })
    }
  }

  // Numbers are protected objects. A generated numeric value must already exist in gold protected values.
  // Omission is allowed: summaries are not required to reproduce every number in the source.
  const allowedNumbers = new Set((gold.protectedValues ?? []).flatMap(numericTokens))
  const outputNumbers = new Set(numericTokens(allOutputText(candidate)))
  for (const number of outputNumbers) {
    if (!allowedNumbers.has(number)) {
      criticalErrors.push({
        code: 'wrong_dose_unit_or_duration',
        message: `generated numeric value ${number} is absent from gold protectedValues`,
      })
    }
  }

  // Soft scores are deliberately external to deterministic gates.
  const softScoreErrors = []
  for (const scoreSetName of ['humanScores', 'judgeScores']) {
    const scoreSet = candidate[scoreSetName]
    if (!scoreSet) continue
    for (const dimension of rules.softDimensions) {
      if (scoreSet[dimension] == null) continue
      const value = Number(scoreSet[dimension])
      if (value < rules.softScale.min || value > rules.softScale.max) {
        softScoreErrors.push(`${scoreSetName}.${dimension} must be ${rules.softScale.min}..${rules.softScale.max}`)
      }
    }
  }
  structuralErrors.push(...softScoreErrors)

  let status = 'PASS'
  if (criticalErrors.length > 0 || structuralErrors.length > 0) status = 'FAIL'
  else if (gold.status !== 'reviewed' || !candidate.humanScores) status = 'REVIEW'

  return { status, structuralErrors, criticalErrors }
}

function loadHarness() {
  const rules = readJson(rulesFile)
  const goldFiles = jsonFiles(goldDir)
  const candidateFiles = jsonFiles(candidateDir)
  const goldById = new Map(goldFiles.map(x => [x.data.articleId, x]))
  return { rules, goldFiles, candidateFiles, goldById }
}

function validate() {
  const { rules, goldFiles, candidateFiles, goldById } = loadHarness()
  let problems = 0

  for (const file of goldFiles) {
    const errors = validateGold(file.data, rules)
    if (errors.length) {
      problems += errors.length
      console.error(`\n${file.name}`)
      errors.forEach(e => console.error(`  - ${e}`))
    }
  }

  for (const file of candidateFiles) {
    const goldFile = goldById.get(file.data.articleId)
    if (!goldFile) {
      problems++
      console.error(`\n${file.name}\n  - no gold fixture for articleId ${file.data.articleId}`)
      continue
    }
    const result = scoreCandidate(file.data, goldFile.data, rules)
    if (result.structuralErrors.length) {
      problems += result.structuralErrors.length
      console.error(`\n${file.name}`)
      result.structuralErrors.forEach(e => console.error(`  - ${e}`))
    }
  }

  if (problems) fail(`${problems} structural validation problem(s)`)
  else console.log(`OK: ${goldFiles.length} gold fixture(s), ${candidateFiles.length} candidate(s).`)
}

function score() {
  const { rules, candidateFiles, goldById } = loadHarness()
  let failed = 0

  for (const file of candidateFiles) {
    const goldFile = goldById.get(file.data.articleId)
    if (!goldFile) {
      failed++
      console.log(`${file.name}: FAIL — missing gold fixture`)
      continue
    }
    const result = scoreCandidate(file.data, goldFile.data, rules)
    console.log(`${file.data.candidateId}: ${result.status}`)
    console.log(`  pipeline=${file.data.pipeline} model=${file.data.model} prompt=${file.data.promptVersion}`)
    for (const error of result.structuralErrors) console.log(`  STRUCTURAL: ${error}`)
    for (const error of result.criticalErrors) console.log(`  CRITICAL ${error.code}: ${error.message}`)
    if (result.status === 'REVIEW') console.log('  Needs expert review / human SBS scores before promotion to PASS.')
    if (result.status === 'FAIL') failed++
  }

  if (failed) process.exitCode = 1
}

const command = process.argv[2] ?? 'score'
if (command === 'validate') validate()
else if (command === 'score') score()
else fail(`Unknown command "${command}". Use validate or score.`)
