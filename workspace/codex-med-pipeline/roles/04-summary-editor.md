# Summary Editor

**Input:** `02-facts.json` only.

**Goal:** write the physician-feed presentation layer without rereading the article.

Produce:
- `title_ru_model`;
- `brief`: 2–3 concise sentences covering what happened/studied, relevant population/sample and the main result;
- `for_practice`: 0–3 bullets.

`Для практики` may state only: applicability, a source-supported practice change, a limitation, or a monitoring/consideration point. Never invent a treatment recommendation. If the source does not justify an action, prefer applicability/limitations.

No clickbait, vague `ученые выяснили`, unsupported superlatives or certainty upgrades.

**Output:** `04-product.json`.
