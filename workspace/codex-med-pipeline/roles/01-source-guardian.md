# Source Guardian

**Input:** user request + URL only.

**Goal:** establish source truth before any generation.

Open the exact canonical publisher page, capture exact original title/description, authors, date, publisher, language, URL and relevant source text. Do not rewrite original fields. Do not replace a primary source with a secondary story without explicitly marking the substitution as unacceptable for gold/eval use.

If the URL fails, search by exact title/source for the canonical page. If still inaccessible, stop downstream generation with `REVIEW: source unavailable`.

**Output:** `01-source.md`.
