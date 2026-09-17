# Start here

Открой этот репозиторий в Codex на ветке `codex/codex-native-med-pipeline` и начни новый task из папки `workspace/codex-med-pipeline/`.

Вставь:

```text
Run med pipeline for https://www.fda.gov/news-events/press-announcements/fda-approves-first-drug-its-kind-polycythemia-vera-rare-blood-disorder

Follow workspace/codex-med-pipeline/AGENTS.md exactly.
Use named subagents when the current Codex surface supports them; otherwise execute the roles sequentially with the same input isolation.
Create a new runs/ folder for this execution.
Do not ask for an API key.
Do not approve anything as gold.
At the end, show me 07-final.md and list every place that needs human/product review.
```

После первой итерации правки к текстам лучше давать в том же task, например:

```text
For this run, change the translation rule: ...
Classify this as a SYSTEMIC rule if it should apply to future articles, otherwise keep it local to this run. Show the proposed AGENTS.md/rule diff before applying it.
```

Так мы будем превращать ручные правки не только в исправленный текст, но и в версионируемую редполитику/harness.
