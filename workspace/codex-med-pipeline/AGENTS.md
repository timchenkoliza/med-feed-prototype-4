# Med Feed Codex Pipeline

These instructions apply to everything under `workspace/codex-med-pipeline/`.

## Mission

Turn one medical article URL into a traceable, reviewable content package for a professional physician feed. Do not optimize only for prose quality. Preserve source truth, translation fidelity, medical factuality, provenance and separable evaluation stages.

The user instruction always takes precedence over this file. If the user provides only a URL or says `run med pipeline`, execute the full workflow below without asking for an API key. This workspace is designed to run inside Codex using the user's ChatGPT/Codex session, not the OpenAI API.

## Orchestration model

Use named roles. If the current Codex surface supports subagents, delegate independent stages to subagents and give each subagent only the inputs allowed by its role. If subagents are unavailable, execute the same roles sequentially, but preserve isolation by reading only the artifacts listed under each role.

Pipeline:

`Source Guardian → (Fact Extractor || Medical Translator) → (Summary Editor || Clinical Classifier) → Medical Auditor → Editor in Chief`

Never collapse the workflow into one unconstrained summarization pass.

## Run directory

For every article create a new folder:

`runs/YYYY-MM-DD__<source>__<short-slug>/`

Write these files in order:

- `00-request.md` — URL, user constraints, run timestamp.
- `01-source.md` — source metadata and extracted source text/abstract relevant to the article.
- `02-facts.json` — structured fact layer with evidence spans.
- `03-translation.json` — translation benchmark for original title/description only.
- `04-product.json` — model headline, `Кратко`, `Для практики`.
- `05-classification.json` — study/content type, evidence label, specialties, topics, interventions, tags.
- `06-audit.json` — deterministic and semantic findings, critical errors, warnings.
- `07-final.md` — human-readable final table/card plus PASS/REVIEW/FAIL.
- `run.json` — provenance, role statuses, timestamps and final decision.

Never overwrite a previous run. If the same URL is rerun, append `__v2`, `__v3`, etc.

## Role 1 — Source Guardian

Read: URL and user constraints only.

Responsibilities:

1. Open the exact URL. Prefer the canonical publisher page. Use Codex web/site tools when available.
2. If the exact page cannot be opened, search for the canonical article by exact title/source before failing.
3. Do not silently substitute a secondary news article for a primary source.
4. Capture: canonical URL, source language, publisher, authors, publication date, exact original title, exact original description/deck if present, content type, and the relevant article/abstract text.
5. Clearly mark fields that are absent instead of inventing them.
6. Preserve original wording for `title_original` and `description_original`.

Output: `01-source.md`.

If the source remains inaccessible, stop with `REVIEW: source unavailable` and state what was tried. Do not fabricate downstream artifacts.

## Role 2 — Fact Extractor

Read: `01-source.md` only.

Extract only facts supported by the source. Do not use outside medical knowledge to fill gaps.

Required schema:

- `content_type`
- `study_type`
- `population`
- `sample_size`
- `intervention`
- `comparator`
- `primary_endpoint`
- `outcomes[]`
- `effect_sizes[]`
- `confidence_intervals[]`
- `p_values[]`
- `follow_up`
- `safety[]`
- `limitations[]`
- `regulatory_status`
- `key_claims[]`
- `evidence_spans[]`

Every high-value claim must have an `evidence_span` containing a short exact source fragment and a locator/section when available. If unsupported, use `null` or `[]`.

Output: `02-facts.json`.

## Role 3 — Medical Translator

Read: only the exact `title_original` and `description_original` from `01-source.md`.

Purpose: translation benchmark, not editorial rewriting.

Rules:

- natural professional Russian, but semantic equivalence is mandatory;
- do not add facts from the article body;
- preserve named entities, drug names, population, numbers, units and time windows;
- preserve negation and modality;
- `may/could` must not become certainty;
- association must not become causation;
- subgroup results must not become whole-population results;
- primary/secondary endpoint distinctions must not be changed;
- do not add adjectives such as `прорывной`, `эффективный`, `безопасный` unless source wording supports them;
- keep trade names unchanged unless an established Russian form is explicitly supported by the source/project terminology.

Output: `03-translation.json` with `title_ru` and `description_ru` plus a checklist: `entities_preserved`, `numbers_preserved`, `units_preserved`, `negation_preserved`, `modality_preserved`, `causality_preserved`.

## Role 4 — Summary Editor

Read: `02-facts.json` only. Do not reread the source while drafting product copy.

Output:

- `title_ru_model`
- `brief` — 2–3 concise sentences: what happened/studied, relevant population/sample, main result;
- `for_practice` — 0–3 bullets.

`Для практики` bullets may only be one of:

- applicability;
- source-supported practice change;
- limitation;
- monitoring/consideration.

Do not create treatment recommendations unsupported by the source. If the source does not justify a clinical action, prefer an applicability or limitation statement.

Headline rules: event/result first; no clickbait; no vague `ученые выяснили`; no unsupported superlatives; preserve uncertainty.

Output: `04-product.json`.

## Role 5 — Clinical Classifier

Read: `02-facts.json` only.

Return:

- `content_type`
- `study_type`
- `sample_size`
- `evidence_level`
- `specialties[]`
- `clinical_topics[]`
- `interventions[]`
- `tags[]`

Do not invent a formal evidence grade from journal prestige or regulator authority. If the project taxonomy cannot safely map the material, set `evidence_level: not_assessed` and explain why.

Output: `05-classification.json`.

## Role 6 — Medical Auditor

Read all previous artifacts plus the source.

Check each generated factual claim against the source/fact layer. Prioritize these critical errors:

- wrong drug/intervention;
- wrong population;
- wrong comparator;
- wrong direction of effect;
- invented or changed number;
- wrong dose/unit/time window;
- wrong contraindication/safety statement;
- unsupported clinical recommendation;
- association → causation;
- modality/negation change;
- endpoint confusion;
- subgroup generalization;
- regulatory-status distortion.

Also check translation fidelity, completeness, readability and whether `Для практики` is actually source-supported.

Output `06-audit.json` with:

- `critical_errors[]`
- `warnings[]`
- `factuality_1_5`
- `completeness_1_5`
- `medical_correctness_1_5`
- `translation_fidelity_1_5`
- `readability_1_5`
- `usefulness_1_5`

## Role 7 — Editor in Chief

Read all artifacts. Do not repair hidden factual errors silently; if editing copy, record the change.

Decision rules:

- `FAIL` if any unresolved critical medical error exists.
- `REVIEW` if source access is partial, evidence mapping is uncertain, or the output has not yet been human-reviewed for gold-set use.
- `PASS` only when source is accessible, no critical errors remain, and required fields are supported.

Write `07-final.md` containing:

1. source metadata;
2. original title/description;
3. Russian translation baseline;
4. model headline;
5. `Кратко`;
6. `Для практики`;
7. study/content type, sample size, evidence level, specialties, topics, interventions, tags;
8. audit summary and decision;
9. compact trace `generated claim → fact → evidence span` for every high-value generated claim.

## Product table mapping

The final artifact must be compatible with these product fields:

`author | publication_date | source | title_original | url | brief | for_practice | study_type | sample_size | evidence_level | specialty | clinical_topic | technologies_interventions | images | tags`

UI actions such as like/save/share/open-source are not generated facts and should not be populated by the content pipeline.

Evaluation fields are separate:

`summary_expertise | model_preference | source_trust | author_trust | summary_quality | usefulness | advertising_bias`.

## Gold-set rule

A model output is never automatically gold. Only after explicit human approval may Codex copy the reviewed artifact into `../../evals/gold/` and set `review_status: human_approved`.

## Standard user command

The minimal user instruction is:

`Run med pipeline for <URL>`

Optional additions may specify specialty, card format, or whether to run SBS. Do not ask for `OPENAI_API_KEY` or `LLM_API_KEY` in this Codex-native workflow.
