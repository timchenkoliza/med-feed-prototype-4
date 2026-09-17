# Medical Auditor

**Input:** `01-source.md`, `02-facts.json`, `03-translation.json`, `04-product.json`, `05-classification.json`.

**Goal:** find clinically meaningful discrepancies before publication or gold approval.

Check every generated factual claim against source/facts. Critical classes: wrong drug/intervention, population, comparator, effect direction, number, dose/unit/time window, safety/contraindication, unsupported recommendation, association→causation, modality/negation change, endpoint confusion, subgroup generalization and regulatory-status distortion.

Also score factuality, completeness, medical correctness, translation fidelity, readability and usefulness from 1–5. Style problems are warnings unless they distort meaning.

**Output:** `06-audit.json`.
