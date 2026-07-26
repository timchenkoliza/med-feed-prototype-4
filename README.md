# Яндекс Мед — Лента (прототип)

Интерактивный прототип раздела «Лента» для Яндекс Мед — профессиональной ленты для врачей, встроенной в существующий shell продукта. Две адаптации из одной модели данных: **Desktop web** и **iPhone 15 Pro Max**.

Работает без backend: mock-данные в `src/data/*.json`, действия пользователя (сохранения, доски, скрытия, «полезно для практики») персистятся в `localStorage`.

## Технологии

- React 18 + TypeScript + Vite 5
- React Router (`HashRouter` — совместимо с GitHub Pages без server rewrite)
- CSS Modules + централизованные design tokens (`src/styles/tokens.css`)
- Локальные mock-данные, `localStorage` для персистенции
- Без внешних UI-китов, без иконочных библиотек, без backend

## Запуск

```bash
npm install
npm run dev
```

Открыть [http://localhost:5173](http://localhost:5173) — редиректит на `/#/web`.

Сборка и превью:

```bash
npm run build
npm run preview
```

Проверка типов без сборки: `npm run typecheck`.

## Маршруты

| Path       | Что показывает                                                   |
|------------|------------------------------------------------------------------|
| `/#/web`   | Desktop композиция: sticky sidebar + лента + правая колонка      |
| `/#/ios`   | iPhone 15 Pro Max композиция: sticky header + tab bar + карточки |
| `/` и `*`  | Redirect на `/#/web`                                             |

Переключатель между режимами — плавающая пилюля в правом нижнем углу. Только для демонстрации: в проде убрать (см. `DevicePreviewSwitcher`).

## Что где менять

| Задача                                     | Файл(ы)                                     |
|--------------------------------------------|---------------------------------------------|
| Фильтры, тексты, доски, лимиты, feature flags | `src/config/productConfig.ts`             |
| Mock-контент ленты                          | `src/data/feed.json`                        |
| Источники                                   | `src/data/sources.json`                     |
| События (RightRail)                         | `src/data/events.json`                      |
| Профиль пользователя                        | `src/data/user.json`                        |
| Design tokens (цвета/типографика/радиусы)   | `src/styles/tokens.css`                     |
| Логика соответствия фильтров типам контента | `src/hooks/useFeedState.ts` → `matchesFilter` |
| Форматирование дат и «минут чтения»         | `src/utils/format.ts`                       |

## Реализованные сценарии

- Сохранение материала (в том числе выбор доски через toast-action)
- Отметка «Полезно для практики»
- Скрытие материала с причиной (`hideReasons`)
- Отмена скрытия через snackbar
- Поиск по mock-базе (по заголовку, источнику, автору, специальности, тегам)
- Фильтрация по темам (7 фильтров)
- Обновление ленты + skeleton-состояние
- Демонстрация ошибки загрузки
- Empty state при пустой выборке
- Конец новой выдачи («Вы просмотрели все новые материалы» + время следующего обновления)
- Режим «Посмотреть за пределами специальности» (`outOfSpecialtyMode`)
- iOS-композиция с полноэкранным `IosDetailScreen`, `MobileTabBar`, safe-area-aware layout
- Персистенция сохранений/оценок/скрытий в `localStorage` (`yandexMedFeed.saved.v1`)

## Точки расширения (mock / TBD)

- Аналитика (`analytics_events` описаны в `docs/components.md`, но не эмитятся)
- Настоящий focus-trap в overlays (`FeedDetailDrawer`, `SaveToBoardModal`, `SearchOverlay`)
- Возврат фокуса на исходную карточку при закрытии drawer
- Клавиатурная навигация стрелками по меню и результатам поиска
- Настоящий pull-to-refresh на iOS (сейчас — кнопка «Обновить»)
- Inline-поиск в iOS header (сейчас — общий `SearchOverlay`)
- Создание пользовательских досок
- Настоящее склонение специальности (см. `PersonalizationHint.notes`)
- Обработчики RightRail-виджетов (клик по событию / тегу / источнику)
- Настоящий бекенд (все ссылки на первоисточники — mock `example.org`)

Полный каталог компонентов с назначением, props, состояниями, зависимостями и `analytics_events` — в [`docs/components.md`](docs/components.md).

## Публикация на GitHub Pages

Репозиторий содержит workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). После push в `main`:

1. Settings → Pages → Source: **GitHub Actions**.
2. Workflow автоматически подставляет `VITE_BASE=/<repo-name>/`, чтобы ассеты грузились с подпути `/<repo-name>/`.
3. Если публикуете под кастомным доменом, задайте `VITE_BASE=/` через `Repository variables`.

Vite-конфиг читает `VITE_BASE` из env, default — `./` (относительный, работает и локально).

## Структура проекта

```
yandex-med-feed/
├── .github/workflows/deploy.yml
├── docs/components.md
├── public/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── styles/                 # tokens.css + global.css
│   ├── types/index.ts
│   ├── config/productConfig.ts
│   ├── data/                   # mock-данные
│   ├── hooks/                  # useFeedState, useToast, useLocalStorage
│   ├── utils/format.ts
│   ├── pages/                  # WebPage, IosPage
│   └── components/
│       ├── common/             # Toast, EmptyState, ErrorState, SkeletonCard, Icon
│       ├── web/                # WebShell, Sidebar, ChatStub, DevicePreviewSwitcher
│       ├── feed/               # FeedPage + FeedCard и overlays
│       └── ios/                # IosShell, IosFeed, IosDetailScreen, MobileTabBar
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

## Лицензия

Прототип для внутренней демонстрации. Все медицинские данные — синтетические, ссылки — mock `example.org`. Не для клинического применения.
