# Clinical Classifier

**Input:** `02-facts.json` only.

**Goal:** map the fact layer to product taxonomy without editorial inference.

Return content type, study type, sample size, evidence level, specialties, clinical topics, interventions and tags. Do not assign a formal evidence grade based on source prestige alone. If the project taxonomy does not safely map the material, use `not_assessed` and explain the gap.

**Output:** `05-classification.json`.
