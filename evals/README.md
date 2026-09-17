# Medical content evaluation harness

Harness для проверки пайплайна `source → facts → translation/generation → QA` для Ленты Яндекс Мед.

## Зачем

Один и тот же gold set используется для:

1. сравнения архитектур (`facts_to_summary`, `translate_to_summary`, `summary_to_translate`, `direct_cross_lingual`);
2. сравнения моделей и версий промптов;
3. regression-тестов после изменений;
4. QA продакшн-пайплайна;
5. подготовки задач для AI-тренеров и врачей-экспертов;
6. накопления воспроизводимого gold set.

## Принцип

Эталоном является не красивый русский текст, а структурированный `facts_gold` с evidence spans. Presentation layer проверяется против него.

```text
SOURCE
  ↓
FACTS GOLD + EVIDENCE
  ↓
TRANSLATION / SUMMARY / FOR PRACTICE / TAGS
  ↓
DETERMINISTIC GATES
  ↓
EXPERT / LLM JUDGE SCORES
  ↓
PASS / REVIEW / FAIL
```

## Структура

- `gold/*.json` — экспертно подтверждённые source + facts + translation/product gold;
- `candidates/*.json` — ответы конкретного pipeline/model/prompt;
- `rules/*.json` — продуктовые правила и critical-error taxonomy;
- `reports/` — локальные отчёты прогона, не обязательны к коммиту;
- `scripts/harness/*.mjs` — CLI и deterministic checks.

## Запуск

```bash
npm run harness:validate
npm run harness:score
```

`harness:validate` проверяет структуру gold/candidate fixtures и evidence links.

`harness:score` применяет hard gates и пишет human-readable отчёт в stdout.

## Hard gates v0.1

Любой critical error переводит candidate в `FAIL` независимо от readability/usefulness:

- неверный препарат / вмешательство;
- неверная population;
- неверный comparator;
- неверное направление эффекта;
- искажённая доза / единица / срок / размер выборки;
- потерянное отрицание;
- association → causation;
- unsupported clinical recommendation;
- claim без evidence ref в gold fact layer.

## Soft dimensions

Они нужны для SBS и выбора среди кандидатов, прошедших hard gates:

- groundedness;
- completeness;
- medical correctness;
- translation fidelity;
- usefulness;
- readability.

Шкала: 1–5. Врачебная/AI-trainer оценка хранится рядом с candidate, но не подменяет hard gates.

## Translation policy v0.1

Перевод — отдельный benchmark. Он не должен одновременно выполнять редактуру или саммаризацию.

Обязательные свойства:

- семантическая эквивалентность без добавления новых фактов;
- сохранение modality/epistemic strength (`may` ≠ `does`);
- сохранение causality (`associated with` ≠ `caused`);
- числа, единицы, дозы, CI, p-values, сроки и размеры выборки — protected values;
- отрицания и ограничения должны сохраняться;
- названия препаратов и организаций нормализуются только по явно заданной policy.

## `Для практики`

Каждый bullet должен быть одного из типов:

- `applicability`;
- `practice_change`;
- `limitation`;
- `monitoring_consideration`.

Каждый bullet обязан ссылаться на один или несколько `fact_id`. Если источник не поддерживает клиническое действие, генератор должен дать applicability/limitation, а не выдумывать рекомендацию.
