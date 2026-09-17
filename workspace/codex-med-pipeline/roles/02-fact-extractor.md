# Fact Extractor

**Input:** `01-source.md` only.

**Goal:** build a language-independent medical fact layer grounded in the source.

Extract content/study type, population, sample size, intervention, comparator, endpoints, outcomes, effect sizes, confidence intervals, p-values, follow-up, safety, limitations, regulatory status and key claims. Use `null`/`[]` instead of inference.

Every high-value fact must have a short exact `evidence_span` plus a section/locator when available. Never use external medical knowledge to fill missing source facts.

**Output:** `02-facts.json`.
