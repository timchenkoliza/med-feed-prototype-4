# Codex-native Med Feed Pipeline

Этот workspace запускает тот же продуктовый пайплайн **внутри Codex**, без `LLM_API_KEY` и без отдельного API billing.

Codex должен быть авторизован через аккаунт ChatGPT. Вычисления идут в рамках доступного пользователю Codex usage, а не через `api.openai.com`.

## Как пользоваться

### Вариант A — Codex web / desktop

1. Открой репозиторий `timchenkoliza/med-feed-prototype-4` в Codex.
2. Выбери ветку `codex/codex-native-med-pipeline`.
3. Рабочая папка: `workspace/codex-med-pipeline/`.
4. Создай новый Codex task/chat для этого репозитория.
5. Отправь одну строку:

```text
Run med pipeline for https://example.com/article
```

Для первого кейса:

```text
Run med pipeline for https://www.fda.gov/news-events/press-announcements/fda-approves-first-drug-its-kind-polycythemia-vera-rare-blood-disorder
```

Codex прочитает `AGENTS.md`, откроет источник и создаст новый каталог `runs/...` с отдельными артефактами каждого этапа.

### Вариант B — Codex CLI

В корне локального репозитория:

```bash
git fetch
git checkout codex/codex-native-med-pipeline
cd workspace/codex-med-pipeline
codex
```

Авторизуй Codex через ChatGPT, если клиент попросит login. Затем в сессии:

```text
Run med pipeline for <URL>
```

Никакой `OPENAI_API_KEY` / `LLM_API_KEY` для этого workflow не нужен.

## Что считается отдельным «агентом»

Роли зафиксированы в `AGENTS.md`:

1. Source Guardian
2. Fact Extractor
3. Medical Translator
4. Summary Editor
5. Clinical Classifier
6. Medical Auditor
7. Editor in Chief

Если текущий Codex surface поддерживает subagents, независимые роли должны делегироваться subagents. Если нет — Codex выполняет те же роли последовательно с жёстким разделением входных артефактов. Поэтому продуктовая логика и eval остаются одинаковыми в обоих режимах.

## Артефакты одного run

```text
runs/YYYY-MM-DD__source__slug/
├── 00-request.md
├── 01-source.md
├── 02-facts.json
├── 03-translation.json
├── 04-product.json
├── 05-classification.json
├── 06-audit.json
├── 07-final.md
└── run.json
```

Это специально устроено не как один большой prompt: можно увидеть, на каком этапе возникла ошибка — source extraction, fact extraction, перевод, продуктовое саммари, классификация или аудит.

## Что делать, если сайт не открывается

Source Guardian обязан:

1. попробовать точный URL;
2. найти canonical publisher page по точному title/source;
3. не подменять primary source вторичным материалом;
4. если source всё равно недоступен — завершить run с `REVIEW: source unavailable`, а не придумывать материал.

Если у тебя есть PDF/текст статьи, можно приложить его в Codex task и написать:

```text
Run med pipeline using the attached article as the source of truth.
Original URL: <URL>
```

## Связь с eval harness

`workspace/codex-med-pipeline/` отвечает за интерактивное производство артефактов.

`evals/` отвечает за reviewed gold, comparison и regression tests.

Выход Codex **не становится gold автоматически**. После твоего/врачебного ревью можно дать отдельную команду:

```text
Approve the reviewed run as gold and update the matching eval fixture.
```

Codex обязан показать diff перед изменением gold fixture.

## SBS позже

Для сравнения архитектур будет использоваться команда вида:

```text
Run SBS for <URL> across:
1) facts → RU summary
2) translate → summary
3) summary → translate
4) direct cross-lingual summary
```

Все варианты должны оцениваться относительно одного source/fact truth.
