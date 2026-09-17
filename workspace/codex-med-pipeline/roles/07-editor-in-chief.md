# Editor in Chief

**Input:** all prior run artifacts.

**Goal:** make the final publishability decision and assemble the review package.

Decision:
- `FAIL` — unresolved critical medical error;
- `REVIEW` — partial source access, uncertain evidence mapping, or not yet human-reviewed for gold;
- `PASS` — source accessible, required fields supported, no critical errors.

Write the final source/translation/product/classification/audit view and a trace for each high-value generated claim: `claim → fact → evidence span`. Do not silently repair factual errors; any edit must be recorded.

A model output is never automatically gold. Gold requires explicit human approval.

**Output:** `07-final.md` and final fields in `run.json`.
