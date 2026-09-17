# Medical Translator

**Input:** exact `title_original` and `description_original` from `01-source.md` only.

**Goal:** produce the translation benchmark, not an editorial rewrite.

Preserve entities, drug names, population, numbers, units, time windows, negation, modality, causal strength and endpoint scope. Do not import body facts. Do not turn `may/could` into certainty, association into causation, subgroup into whole population, or add unsupported adjectives.

Return `title_ru`, `description_ru` and boolean checks for entities, numbers, units, negation, modality and causality preservation.

**Output:** `03-translation.json`.
