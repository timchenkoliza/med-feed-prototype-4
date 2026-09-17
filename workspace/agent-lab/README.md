# Med Feed Agent Lab

Независимое рабочее пространство для проверки одной медицинской статьи по URL и сборки продуктовой карточки Ленты через несколько специализированных агентов.

## Что делает

Пайплайн:

```text
URL
 ↓
Source Guardian
 ├─→ Fact Extractor ─→ Summary Editor ─┐
 └─→ Medical Translator               ├─→ Medical Auditor → Editor in Chief
                    Fact Extractor ─→ Clinical Classifier ┘
```

Результат хранит отдельно:

- исходник и метаданные;
- fact layer + evidence spans;
- переводный benchmark title/description;
- продуктовый title / «Кратко» / «Для практики»;
- тип материала/исследования, специальности, темы, вмешательства, теги;
- deterministic checks и LLM medical audit;
- финальное решение `PASS | REVIEW | FAIL`;
- provenance: pipeline, provider mode, model, timestamp.

## Роли

Роли и зависимости описаны в `agents.json`. Это не один «супер-промпт»: извлечение фактов, перевод, продуктовая генерация, классификация и аудит выполняются раздельно, чтобы ошибки можно было локализовать и измерять.

## Запуск

Требуется Node.js 20+.

```bash
cd workspace/agent-lab
node server.mjs
```

Открыть `http://localhost:8787`.

По умолчанию, если нет `LLM_API_KEY`, Lab запускается в **mock mode**. Он проверяет ingestion/UI/orchestration, но намеренно не имитирует качественную медицинскую генерацию.

Для live mode:

```bash
export LLM_API_KEY='...'
export LLM_BASE_URL='https://api.openai.com/v1'   # или совместимый внутренний gateway
export LLM_MODEL='gpt-5.6-sol'
export LLM_MODE='live'
node server.mjs
```

Провайдер вынесен в `provider.mjs`. Оркестратор не зависит от конкретного поставщика модели: нужен endpoint, совместимый с chat-completions контрактом. Для внутреннего Eliza/gateway можно заменить только provider adapter, не меняя роли и gold/eval структуру.

## API

### `POST /api/runs`

```json
{ "url": "https://www.fda.gov/..." }
```

Возвращает `runId` и запускает оркестрацию.

### `GET /api/runs/:id/events`

SSE-поток статусов агентов для Bazz-подобного интерфейса.

### `GET /api/runs/:id`

Текущее состояние и итоговый JSON.

### `GET /api/agents`

Роли и dependency graph.

## Quality gates v0

Сейчас реализованы два слоя проверки:

1. **Deterministic**: поиск чисел в сгенерированном переводе/саммари, которых нет в source; базовый сигнал наличия отрицаний; provenance.
2. **Semantic Medical Auditor**: отдельный агент проверяет критические классы ошибок: wrong drug/population/comparator, wrong direction of effect, dose/unit, contraindication, unsupported recommendation, association→causation, modality/negation change, endpoint confusion, subgroup generalization, invented number.

Любая critical error переводит live-run в `FAIL`. В mock mode решение всегда `REVIEW`.

## Связь с eval harness

Lab создан поверх ветки с `evals/` и не заменяет gold harness:

- **Agent Lab** — рабочее пространство: вставили URL → получили трассируемый run.
- **evals/** — контроль качества: reviewed gold fixtures, pipeline/model comparison, regression gates.

Следующий технический шаг: кнопка «Принять как gold» должна экспортировать итоговый run в `evals/gold/` после экспертного ревью, а не автоматически.

## Ограничения v0

- HTML extraction best-effort: `article/main` → fallback на очищенный HTML. Для production нужен специализированный parser/readability слой и отдельные адаптеры PDF/PMC/PubMed.
- URL fetch ограничивает очевидные localhost/private-network targets, но это ещё не полноценная production SSRF-защита.
- Run state живёт в памяти процесса; завершённые run сохраняются локально в `runs/*.json`.
- Нет аутентификации/ролей пользователей: это локальный R&D workspace, не production clinical tool.
- LLM judge не является единственным арбитром: reviewed gold и врачебная разметка остаются источником финальной оценки качества.
