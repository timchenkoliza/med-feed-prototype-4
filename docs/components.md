# Компоненты Яндекс Мед — Лента (прототип)

Живой каталог. Пополняется по мере согласования интерфейса.

---

## AppRoot

**Файл:** `src/App.tsx` (точка входа — `src/main.tsx`)

**User purpose.** Роутинг верхнего уровня. Выбирает демо-композицию (Desktop web или iOS) по URL, без бизнес-логики.

**Input props.** Нет.

**Internal state.** Нет (только внутреннее состояние react-router).

**User actions.**
- Переход по `/#/web` → рендер `<WebPage/>`.
- Переход по `/#/ios` → рендер `<IosPage/>`.
- Любой другой путь → редирект на `/#/web`.

**Dependencies.**
- `react-router-dom` (`HashRouter`, `Routes`, `Route`, `Navigate`).
- `pages/WebPage`, `pages/IosPage`.
- `styles/global.css` (импорт в `main.tsx`).

**Analytics events.**
- `route_view { path }` — при смене маршрута. Точка расширения, не реализовано.

**Configuration keys.**
- `VITE_BASE` (env) — base path Vite, для публикации под подпутём GitHub Pages.
- Ключей в `productConfig.ts` нет.

**Notes.**
- `HashRouter` выбран для совместимости с GitHub Pages без server rewrite.
- `StrictMode` включён в `main.tsx`.

---

## WebShell

**Файл:** `src/components/web/WebShell.tsx` (+ `WebShell.module.css`)

**User purpose.** Композиция desktop-версии Яндекс Мед: закреплённый левый сайдбар + центральная область, в которой рендерится текущий раздел (AI-чат / Лента / Сохранённое).

**Input props.** Нет.

**Internal state.**
- `section: 'chat' | 'feed' | 'saved'` — активный раздел (по умолчанию `'feed'`).

**User actions.**
- Переключение раздела через клик по пункту `Sidebar` → `setSection`.
- Клик по «Новый чат» в `Sidebar` → `section='chat'`.
- Из режима «Сохранённое» кнопка «Назад к ленте» в `FeedPage` возвращает `section='feed'` (проброшено через `onLeaveSaved`).

**Dependencies.**
- `components/web/Sidebar`
- `components/web/ChatStub`
- `components/feed/FeedPage` (обычная лента и `showSaved`)

**Analytics events.**
- `section_change { from, to }` — при `setSection`. Точка расширения, не реализовано.

**Configuration keys.**
- Прямых ключей в `productConfig.ts` нет.
- Косвенно затрагивают вложенные компоненты (`filters`, `boards`, `feedLimits`, `toastText`).

**Notes.**
- Раздел «Сохранённое» реализован через `FeedPage(showSaved)` — общий рендер, другая выборка. Отдельного экрана нет.
- `Sidebar` остаётся видимым при любом `section` (соответствует спеке «сайдбар остаётся на месте»).
- Дефолтный раздел — `feed`, чтобы прототип открывался на новой функции.

---

## Sidebar

**Файл:** `src/components/web/Sidebar.tsx` (+ `Sidebar.module.css`)

**User purpose.** Основная навигация desktop-версии. Даёт доступ к трём разделам продукта (AI-чат, Лента, Сохранённое), быстрый вход в новый чат, список последних диалогов, статус лимита запросов, ссылки на юр.документы. Сохраняет визуальную совместимость со скриншотом текущего Яндекс Мед.

**Input props.**
- `active: 'chat' | 'feed' | 'saved'` — текущий раздел (управляемый).
- `onNavigate: (section) => void` — колбэк переключения раздела.

**Internal state.**
- `collapsed: boolean` (по умолчанию `false`) — ужать сайдбар до 68px.

**Sub-parts (inline, не отдельные компоненты).**
- Logo (Яндекс + orb + Мед + β)
- CollapseButton
- NewChatButton
- NavRow × 3 (chat / feed / saved)
- RecentChatsSection («Последние 7 дней» + mock-список)
- UsageCard
- UserRow (аватар + юр.ссылки)

**User actions.**
- Клик по логотипу — no-op.
- Клик по кнопке коллапса — toggle `collapsed`.
- Клик по «Новый чат» — `onNavigate('chat')`.
- Клик по пункту навигации — `onNavigate(id)`.
- Клик по mock-чату — `onNavigate('chat')` (открытие конкретного чата не реализовано).
- Клик по `UsageCard` — no-op (заглушка).
- Клик по юр.ссылкам — `preventDefault` (заглушка).

**Dependencies.**
- `components/common/Icon`
- `data/user.json` (`name`, `avatarInitials`)

**Analytics events.**
- `sidebar_collapse_toggle { collapsed }`
- `nav_click { section }`
- `new_chat_click`
- `recent_chat_open { chat_id }` — при реализации
- `usage_card_click`

(Не реализовано.)

**Configuration keys.**
- `user.avatarInitials` — `data/user.json`.
- Список `recentChats` — сейчас захардкожен внутри `Sidebar.tsx`, кандидат на вынос в `data/chats.json` или `productConfig`.

**Notes.**
- Активный пункт подсвечивается фоном `--color-surface-2` без агрессивного accent — по требованию спеки.
- При `collapsed` низ (Usage + userLinks) скрывается — иначе не помещается в 68px. Аватар остаётся.
- Логотип использует локальный orb (gradient div), внешнего asset нет.

---

## ChatStub

**Файл:** `src/components/web/ChatStub.tsx` (+ `ChatStub.module.css`)

**User purpose.** Визуальная заглушка раздела AI-чата. Воспроизводит исходное состояние центральной области со скриншота Яндекс Мед: приветствие + панель исчерпанного лимита сообщений + инпут промокода для повышения тарифа. Реальной AI-логики не содержит.

**Input props.** Нет.

**Internal state.** Нет. Инпут промокода — неуправляемый, значение никуда не отправляется.

**Sub-parts (inline).**
- Greeting («Добрый день»)
- Subtitle («С чем помочь сегодня?»)
- LimitPanel (текст + PromoCodeRow)
- PromoCodeRow (label + input + submit)
- CrossReferenceHint (про раздел Лента)

**User actions.**
- Ввод в инпут промокода — no-op на submit.
- Клик «Применить код» — no-op (заглушка).

**Dependencies.** Нет. Только CSS Module + tokens.

**Analytics events.**
- `promo_apply_click { code_length }` — при реализации.

**Configuration keys.**
- Тексты Greeting / Subtitle / LimitPanel / кнопки — сейчас захардкожены в JSX, кандидаты на вынос в `productConfig.chatStub` или i18n.

**Notes.**
- Дизайн-совместимость со скриншотом — сознательно 1:1 (плашка, инпут, кнопка).
- `CrossReferenceHint` добавлен для UX, не из спеки. Убрать по требованию.
- В разделе «Лента» сообщение о лимите не показывается — по спеке лимит относится только к AI-чату.

---

## FeedPage

**Файл:** `src/components/feed/FeedPage.tsx` (+ `FeedPage.module.css`)

**User purpose.** Главный экран раздела «Лента» на desktop. Оркестрирует чтение, поиск, фильтрацию, персонализационные действия (сохранить / полезно / скрыть), режим «за пределами специальности» и состояния загрузки. Также используется для отображения раздела «Сохранённое» в режиме `showSaved`.

**Input props.**
- `showSaved?: boolean` — режим «Сохранённое» вместо основной ленты.
- `onLeaveSaved?: () => void` — колбэк для кнопки «Назад к ленте».

**Internal state (только UI).**
- `openItem: FeedItem | null` — открытый в drawer материал.
- `searchOpen: boolean`.
- `boardModalItem: FeedItem | null` — материал, для которого выбираем доску.
- `pendingSkeletons: boolean` — принудительно показать скелетоны при рефреше.

**Business state (делегировано `useFeedState`).**
- `saved` / `hidden` / `practiceUseful` — `localStorage`.
- `activeFilter`, `query`, `outOfSpecialtyMode`, `loadState` — in-memory.

**Sub-parts.**
- `FeedHeader`
- `FeedFilters`
- `PersonalizationHint`
- `toolRow` (dev-кнопки: «Обновить ленту», «Показать ошибку»)
- `ErrorState`
- `ShakeFeedPanel`
- `SkeletonCard` × N
- `FeedCard` × N
- `endBanner` (inline)
- `RightRail` (в grid справа)
- Overlays: `SearchOverlay`, `FeedDetailDrawer`, `SaveToBoardModal`, `Toast`

**User actions.**
- Клик по карточке → `openItem = item`, открытие drawer.
- Клик по иконке поиска → `searchOpen = true`.
- Смена фильтра → `setActiveFilter` (в `useFeedState`).
- Клик «Обновить ленту» → `refresh` → скелетоны → toast «Добавлено N».
- Клик «Показать ошибку загрузки» → `simulateError` (демо).
- «Сохранить» в карточке → `toggleSave` + toast с action «Выбрать доску».
- «Выбрать доску» в toast → `boardModalItem = item`, открытие модалки.
- Выбор доски → `setBoardForItem` + toast «Сохранено в „…“».
- «Полезно для практики» → `togglePracticeUseful` + toast (при включении).
- Меню карточки → `hideItem` + toast «Материал скрыт» с «Отменить».
- «Посмотреть за пределами специальности» (в `RightRail`) → `setOutOfSpecialtyMode(true)`.
- В drawer: клик Сохранить / Полезно / Закрыть.
- В `SearchOverlay`: ввод запроса, клик по результату → закрытие overlay, `openItem`.
- «Назад к ленте» в режиме `showSaved` → `onLeaveSaved()`.

**Dependencies.**
- `hooks/useFeedState` — весь бизнес-стейт и данные.
- `hooks/useToast`.
- `config/productConfig` (`boards`, `feedLimits`, `toastText`).
- `components/feed/*` (Header, Filters, Hint, Card, Drawer, RightRail, SaveToBoardModal, SearchOverlay, ShakeFeedPanel).
- `components/common/*` (Toast, EmptyState, ErrorState, SkeletonCard, Icon).

**Analytics events.**
- `feed_view { filter, showSaved }`
- `filter_change { from, to }`
- `card_open { item_id, position }`
- `save_toggle { item_id, saved, source: 'card' | 'drawer' | 'toast' }`
- `board_assign { item_id, board_id }`
- `practice_useful_toggle { item_id, active }`
- `hide_click { item_id, reason }`
- `undo_hide { item_id }`
- `refresh_click { added, source: 'button' | 'pull_to_refresh' }`
- `search_open`, `search_query { q_length, result_count }`
- `out_of_specialty_open`, `out_of_specialty_close`

(Не реализовано.)

**Configuration keys.**
- `feedLimits.maxNewItems` — сколько карточек до `endBanner`.
- `toastText.*` — все пользовательские строки toast/banner.
- `boards` — состав досок в `SaveToBoardModal`.
- `featureFlags.enableSavedBoards`, `enablePracticeReaction`, `enableOutOfSpecialtyMode`, `enableSearch` — сейчас читаются формально; для отключения нужно обернуть соответствующие ветки условием.

**Notes.**
- Бизнес-стейт полностью в `useFeedState` — `FeedPage` можно перерендерить без потери сохранений/скрытий (они синкаются с `localStorage`).
- `toolRow` с dev-кнопками — временный, кандидат на удаление в проде.
- Toast локальный (`useToast`), не глобальный — согласовано с общей архитектурой прототипа (нет глобального стора).
- Режим `showSaved` — та же страница с другой выборкой; фильтры и `PersonalizationHint` скрыты.

---

## FeedHeader

**Файл:** `src/components/feed/FeedHeader.tsx` (+ `FeedHeader.module.css`)

**User purpose.** Верхний блок раздела «Лента». Задаёт заголовок («Для вас») + подзаголовок и даёт быстрый доступ к поиску, сохранённому и профилю. Не содержит фильтров и подсказок персонализации — они уровнем ниже.

**Input props.**
- `onOpenSearch: () => void` — открыть `SearchOverlay`.
- `onOpenSaved: () => void` — открыть раздел «Сохранённое» (сейчас no-op в `FeedPage`).

**Internal state.** Нет.

**Sub-parts (inline).**
- TitleBlock (`h1` «Для вас» + subtitle).
- SearchIconButton.
- SavedPill («Сохранённое» с иконкой bookmark).
- UserAvatar (инициалы из `data/user.json`).

**User actions.**
- Клик по поиску → `onOpenSearch()`.
- Клик по «Сохранённое» → `onOpenSaved()`.
- Клик по аватару — no-op (дизайн-элемент).

**Dependencies.**
- `components/common/Icon`.
- `data/user.json` (`avatarInitials`).

**Analytics events.**
- `search_open_click { source: 'header' }`.
- `saved_open_click { source: 'header' }`.
- `avatar_click` — при реализации меню профиля.

**Configuration keys.**
- Тексты заголовка/подзаголовка — сейчас захардкожены в JSX, кандидаты на `productConfig.feedHeader.{title, subtitle}`.
- `user.avatarInitials` — `data/user.json`.

**Notes.**
- Кнопка «Сохранённое» в текущем `FeedPage` привязана к `() => {}` (единственный вход в Saved — через `Sidebar`). Решение: TBD.
- Аватар не кликабельный — по спеке («компактный аватар пользователя» без явных действий).

---

## FeedFilters

**Файл:** `src/components/feed/FeedFilters.tsx` (+ `FeedFilters.module.css`)

**User purpose.** Горизонтальная лента тематических фильтров для персонализации выборки материалов. Реально меняет набор карточек в `FeedPage` / `IosFeed` через `useFeedState.setActiveFilter`. Одиночный выбор.

**Input props.**
- `active: FilterId` — текущий выбранный фильтр.
- `onChange: (id: FilterId) => void`.
- `variant?: 'web' | 'ios'` — визуальная адаптация (высота, padding, border).

**Internal state.** Нет.

**Sub-parts (inline).**
- Scroller (горизонтальный контейнер со `scroll-snap`).
- Chip × N (по элементу на каждый filter из `productConfig.filters`).

**User actions.**
- Клик по чипу → `onChange(id)`.
- Свайп / скролл горизонтально — навигация по фильтрам.

**Dependencies.**
- `config/productConfig` (`filters`, тип `FilterId`).

**Analytics events.**
- `filter_change { from, to, source: 'web' | 'ios' }`.
- `filter_scroll` — при реализации трекинга свайпа.

**Configuration keys.**
- `productConfig.filters` — состав, порядок и подписи фильтров.
- Логика соответствия `filter → contentType` — `hooks/useFeedState.ts` (`matchesFilter`), не в config; кандидат на вынос.

**Notes.**
- Активный чип оформлен тёмным фоном + белым текстом, а не accent-цветом — по требованию спеки «без агрессивного цветного фона».
- «Для вас» — виртуальный фильтр, не тег контента (исключает `outOfSpecialty`).
- `variant='ios'` скрывает нижнюю границу и укрупняет чипы для тач-таргетов.
- Соответствие `FilterId → критерий выборки` задано в коде `useFeedState`; добавление нового фильтра требует правки в двух местах.

---

## PersonalizationHint

**Файл:** `src/components/feed/PersonalizationHint.tsx` (+ `PersonalizationHint.module.css`)

**User purpose.** Ненавязчивая подсказка, что лента персонализирована под специальность пользователя, с быстрым переходом к настройкам специальности и интересов.

**Input props.**
- `onEdit?: () => void` — колбэк для кнопки «Изменить специальность и интересы» (сейчас в `FeedPage` не передаётся).

**Internal state.** Нет.

**Sub-parts (inline).**
- HintTitle («Лента настроена для <specialty_genitive>»).
- EditLink («Изменить специальность и интересы»).

**User actions.**
- Клик «Изменить специальность и интересы» → `onEdit?.()`.

**Dependencies.**
- `data/user.json` (`specialty`).

**Analytics events.**
- `personalization_edit_click { source: 'feed_hint' }`.

**Configuration keys.**
- `user.specialty` — `data/user.json`.
- Тексты «Лента настроена для …» и «Изменить …» — сейчас в JSX, кандидаты на `productConfig.personalizationHint` или i18n.

**Notes.**
- Оформлен как светло-серая плашка, не accent — по спеке «не большая рекламная плашка», «ненавязчиво».
- Склонение специальности сейчас через `${specialty}а` — сломается на ряде слов. Кандидат на замену полем `user.specialtyGenitive` или отказом от склонения («Лента настроена по вашей специальности»).
- Скрыт в режиме `showSaved`.

---

## FeedCard

**Файл:** `src/components/feed/FeedCard.tsx` (+ `FeedCard.module.css`)

**User purpose.** Основная единица потребления ленты — карточка материала первого уровня. Показывает тип, источник, дату, специальность, заголовок, краткий профессиональный summary, время чтения. Предоставляет действия «Сохранить», «Полезно для практики» и меню скрытия. Клик по карточке открывает детальный просмотр.

**Input props.**
- `item: FeedItem` — данные материала.
- `source: Source` — данные источника (уже разрезолвлен из `sourcesById`).
- `saved: boolean`.
- `practiceUseful: boolean`.
- `onOpen: () => void` — открыть детальный просмотр.
- `onSave: () => void`.
- `onPractice: () => void`.
- `onHide: (reason: HideReason) => void`.
- `variant?: 'web' | 'ios'` — плотность/размеры (по умолчанию `'web'`).

**Internal state.** Нет. Все состояния — снаружи через props. `CardOverflowMenu` держит своё локальное open/close отдельно.

**Sub-parts.**
- `ContentTypeBadge`.
- `SourceBadge`.
- `SaveButton`.
- `PracticeUsefulButton`.
- `CardOverflowMenu`.
- Inline reading-badge (`Icon 'clock'` + `readingLabel`).

**User actions.**
- Клик по карточке (не по интерактиву внутри) → `onOpen()`.
- Enter/Space по фокусу карточки → `onOpen()`.
- Клик «Сохранить» → `onSave()`.
- Клик «Полезно для практики» → `onPractice()`.
- Выбор пункта в меню три-точки → `onHide(reason)`.

**Dependencies.**
- `components/feed/ContentTypeBadge`, `SourceBadge`, `SaveButton`, `PracticeUsefulButton`, `CardOverflowMenu`.
- `components/common/Icon`.
- `utils/format` (`formatDate`, `readingLabel`).

**Analytics events.**
- `card_impression { item_id, position, source: 'feed' | 'search' | 'saved' | 'shake' }`.
- `card_open { item_id, source }`.
- `save_toggle { item_id, saved, source: 'card' }`.
- `practice_useful_toggle { item_id, active, source: 'card' }`.
- `hide_click { item_id, reason }`.

**Configuration keys.**
- Тексты действий и меню — через `productConfig` (`hideReasons`, `toastText`; сам компонент строк почти не хранит).
- `featureFlags.enablePracticeReaction` / `enableSavedBoards` — при отключении action-кнопки должны скрываться (пока не реализовано).

**Notes.**
- Клик по карточке фильтруется: если `e.target.closest('button, a')` — `onOpen` не срабатывает. Это предотвращает двойной эффект при клике по внутренним кнопкам.
- Focus-visible работает по всей карточке (accent-halo).
- Никаких социальных счётчиков (лайки/комменты/шеры) — сознательно по спеке.
- Поле `item.image` в типе есть, но не рендерится. Кандидат на будущее.
- `variant='ios'` уменьшает padding, radius, размер заголовка и включает compact `SourceBadge` (скрывает статус источника — он мешает по высоте).

---

## ContentTypeBadge

**Файл:** `src/components/feed/ContentTypeBadge.tsx` (+ `ContentTypeBadge.module.css`)

**User purpose.** Быстрое опознавание жанра материала (клинические рекомендации, исследование, метаанализ, клинический случай, обновление инструкции, новость Минздрава, международная публикация, ассоциация, конференция, вебинар, курс НМО, экспертный разбор). Спокойная приглушённая тональная палитра, без агрессивных цветов.

**Input props.**
- `type: ContentType` — один из 12 типов.

**Internal state.** Нет.

**Sub-parts.** Нет.

**User actions.** Нет — компонент не интерактивен.

**Dependencies.**
- `config/productConfig` (`contentTypeLabels`).
- `types` (`ContentType`).

**Analytics events.** Нет.

**Configuration keys.**
- `productConfig.contentTypeLabels` — подписи для каждого типа.
- Таблица `tone: ContentType → toneN` — сейчас внутри `ContentTypeBadge.tsx`, кандидат на вынос в `productConfig` или в централизованный `tokens.ts`.

**Notes.**
- 12 типов → 6 тональных пар (группировка по смыслу: норматив / наука / клин.мысль / лекарства / официоз / события).
- Все пары приглушённые, низкая сатурация.
- Отсутствие иконки в бейдже — сознательно, чтобы не увеличивать визуальный шум в мета-строке.

---

## SourceBadge

**Файл:** `src/components/feed/SourceBadge.tsx` (+ `SourceBadge.module.css`)

**User purpose.** Показывает пользователю источник материала и его статус верификации. Основной сигнал доверия в карточке. Спокойное оформление, без рекламных бейджей.

**Input props.**
- `source: Source` — `{ id, name, status, domain }`.
- `compact?: boolean` — сжатый режим (шрифт `--fs-xs`, без текста статуса).

**Internal state.** Нет.

**Sub-parts (inline).**
- VerifiedIcon (`Icon name="verified"`, `--color-verified`).
- SourceName.
- StatusLabel (скрыт в `compact`).

**User actions.** Нет — не интерактивен.

**Dependencies.**
- `components/common/Icon`.
- `config/productConfig` (`sourceStatusLabels`).
- `types` (`Source`, `SourceStatus`).

**Analytics events.** Нет.
- При реализации фильтра по источнику — `source_filter_click { source_id }`.

**Configuration keys.**
- `productConfig.sourceStatusLabels` — подписи 4 статусов.
- `data/sources.json` — сами источники и присвоенные им статусы.
- `featureFlags.enableSourceVerification` — при отключении бейдж должен показывать только имя без иконки/статуса (пока не реализовано).

**Notes.**
- Единая иконка на все 4 статуса. Различие только в тексте после «·». Альтернатива — разные иконки/цвета — сознательно не выбрана, чтобы не создавать иерархию «рецензируемое издание > ассоциация» визуально.
- Клик поглощается родительской карточкой для открытия детали.
- В `compact` режиме статус скрыт полностью — не помещается по высоте в iOS-карточке.
- Пятое возможное состояние «неверифицированный» в типах не заведено — в прототипе все источники проверены по определению.

---

## SaveButton

**Файл:** `src/components/feed/SaveButton.tsx` (общий CSS-модуль `IconAction.module.css`)

**User purpose.** Сохранить материал (или снять сохранение). Основной способ собрать коллекцию полезного профессионального контента для возврата позже — прочитать, обсудить с коллегами, использовать в практике.

**Input props.**
- `saved: boolean` — контролируемое состояние.
- `onClick: () => void` — toggle-обработчик.
- `compact?: boolean` — режим «только иконка» (для iOS).

**Internal state.** Нет.

**Sub-parts (inline).**
- Icon (`bookmark` / `bookmark-filled`).
- Label («Сохранить» / «Сохранено»).

**User actions.**
- Клик → `onClick()`.
- Enter/Space на фокусе → `onClick()` (нативное поведение `<button>`).

**Dependencies.**
- `components/common/Icon`.
- Общий CSS: `components/feed/IconAction.module.css`.

**Analytics events.**
- `save_toggle { item_id, saved, source: 'card' | 'drawer' | 'ios_detail' }` — эмитится на уровне вызывающего, кнопка сама только вызывает `onClick`.

**Configuration keys.**
- Тексты «Сохранить» / «Сохранено» — сейчас в JSX; кандидаты на `productConfig.actions` или i18n.
- `featureFlags.enableSavedBoards` — определяет, будет ли после save показан toast с выбором доски (логика в `FeedPage`, не в кнопке).

**Notes.**
- Разделяет CSS-модуль с `PracticeUsefulButton` (оба используют `.btn` / `.active`).
- Не открывает `SaveToBoardModal` самостоятельно — это делает `FeedPage` через toast-action.
- `aria-pressed` отражает `saved`. `aria-label` меняется в зависимости от состояния («Сохранить» / «Убрать из сохранённого»).

---

## PracticeUsefulButton

**Файл:** `src/components/feed/PracticeUsefulButton.tsx` (общий CSS `IconAction.module.css`)

**User purpose.** Профессиональная оценка материала как полезного для клинической практики. Сигнал для системы персонализации («показывай больше похожего»). Не социальный лайк: без публичных счётчиков, без сердечек.

**Input props.**
- `active: boolean` — контролируемое состояние.
- `onClick: () => void` — toggle-обработчик.
- `compact?: boolean` — только иконка (iOS).

**Internal state.** Нет.

**Sub-parts (inline).**
- Icon (`thumbs-up` / `thumbs-up-filled`).
- Label («Полезно для практики»).

**User actions.**
- Клик → `onClick()`.
- Enter/Space на фокусе → `onClick()`.

**Dependencies.**
- `components/common/Icon`.
- Общий CSS: `components/feed/IconAction.module.css`.

**Analytics events.**
- `practice_useful_toggle { item_id, active, source: 'card' | 'drawer' | 'ios_detail' }` — эмитится вызывающим; кнопка сама только вызывает `onClick`.

**Configuration keys.**
- Текст «Полезно для практики» — в JSX, кандидат на `productConfig.actions`.
- `toastText.practiceUseful` — сообщение «Учтём это при настройке ленты».
- `featureFlags.enablePracticeReaction` — при отключении кнопка должна исчезать (пока не реализовано).

**Notes.**
- Toast показывается только при включении, не при снятии — сознательно (снятие — молчаливая коррекция, а не действие с обратной связью).
- Внешне идентична `SaveButton` (общий CSS), различие семантическое.
- В web-варианте всегда с текстом — сокращение до иконки размывает смысл «профессиональной» оценки.
- Никакой шкалы, никакого «Не полезно» — только бинарный toggle, по спеке.

---

## CardOverflowMenu

**Файл:** `src/components/feed/CardOverflowMenu.tsx` (+ `CardOverflowMenu.module.css`)

**User purpose.** Единственная точка входа в сценарий «Не показывать подобное» на карточке. Даёт пользователю 4 явные причины скрытия, чтобы система могла улучшать персонализацию.

**Input props.**
- `onHide: (reason: HideReason) => void` — колбэк с выбранной причиной.

**Internal state.**
- `open: boolean` — открыто ли выпадающее меню.

**Sub-parts (inline).**
- TriggerButton (кнопка «три точки»).
- MenuPopover (позиционируется абсолютно относительно `.wrap`).
- MenuTitle («Не показывать подобное»).
- MenuItem × 4 (по `hideReasons`).

**User actions.**
- Клик по триггеру → `open = !open`.
- Клик по пункту меню → `onHide(reason)`, `open = false`.
- Клик вне меню (`mousedown` на `document`) → `open = false`.
- Escape → закрыть меню (TBD, не реализовано).

**Dependencies.**
- `components/common/Icon`.
- `config/productConfig` (`hideReasons`).
- `types` (`HideReason`).

**Analytics events.**
- `overflow_menu_open { item_id }`.
- `hide_click { item_id, reason }`.

**Configuration keys.**
- `productConfig.hideReasons` — состав и подписи причин.
- Тексты триггера и заголовка меню — в JSX, кандидаты на `productConfig`.

**Notes.**
- Меню не реализует полную WAI-ARIA menu-навигацию (стрелки/фокус). Пункты доступны через Tab по DOM-порядку.
- Escape для закрытия — не реализован, кандидат на добавление.
- Custom dropdown без библиотек, не переиспользуется. При появлении второго dropdown-меню — вынести в `common/Menu`.
- `aria-haspopup="menu"`, `aria-expanded` отражает `open`.

---

## RightRail

**Файл:** `src/components/feed/RightRail.tsx` (+ `RightRail.module.css`)

**User purpose.** Вспомогательная колонка справа от основной ленты. Даёт быстрый доступ к событиям, сохранённым темам, источникам и режиму «за пределами специальности». Вторичная по визуальному весу — не должна отвлекать от чтения основного потока.

**Input props.**
- `savedTagsSample: string[]` — уникальные теги из сохранённых материалов (для `SavedTopicsWidget`; собирается в `FeedPage` через `useFeedState`).
- `onShake: () => void` — включить `outOfSpecialtyMode`.
- `onEventClick?: (event_id) => void`.
- `onTagClick?: (tag) => void`.
- `onSourceClick?: (source_id) => void`.

**Internal state.** Нет.

**Sub-parts (внутренние компоненты в том же файле).**
- `EventsWidget`
- `SavedTopicsWidget`
- `SourcesWidget`
- `ShakeFeedTrigger`

**User actions.**
- Клик по событию → `onEventClick?(id)` (сейчас no-op).
- Клик по тегу → `onTagClick?(tag)` (сейчас no-op).
- Клик по источнику → `onSourceClick?(id)` (сейчас no-op).
- Клик «Посмотреть за пределами специальности» → `onShake()`.

**Dependencies.**
- `components/common/Icon`.
- `data/events.json`, `data/sources.json`.
- `utils/format` (`formatDateFull`).

**Analytics events.**
- `right_rail_view`.
- `event_click { event_id, kind }`.
- `saved_tag_click { tag }`.
- `source_click { source_id }`.
- `shake_feed_click { source: 'right_rail' }`.

**Configuration keys.**
- `featureFlags.enableEvents` — при отключении `EventsWidget` скрывается.
- `featureFlags.enableOutOfSpecialtyMode` — при отключении `ShakeFeedTrigger` скрывается.
- `data/events.json`, `data/sources.json` — контент виджетов.

**Notes.**
- Sticky `top: 24px` — колонка держится в поле зрения при скролле.
- На viewport < 1100px колонка скрывается целиком. Открытый вопрос: переносить ли виджеты под ленту / переносить только `ShakeFeedTrigger` в основную колонку / оставить как есть.
- «Источники недели» — статичная выборка первых 5, не реальная статистика. Точка расширения.
- Все виджеты — точки расширения (действия сейчас no-op).

---

## FeedDetailDrawer

**Файл:** `src/components/feed/FeedDetailDrawer.tsx` (+ `FeedDetailDrawer.module.css`)

**User purpose.** Второй уровень материала на desktop: полный просмотр карточки в боковой drawer-панели. Позволяет прочитать материал целиком без потери контекста ленты, увидеть автора, организацию, первоисточники, блок «Что это меняет в практике», и сохранить/оценить материал.

**Input props.**
- `item: FeedItem | null` — если `null`, drawer скрыт.
- `source: Source | null` — соответствующий источник.
- `saved: boolean`.
- `practiceUseful: boolean`.
- `onClose: () => void`.
- `onSave: () => void`.
- `onPractice: () => void`.

**Internal state.** Нет. Open/close выражено через `item !== null`. Фокус — TBD.

**Sub-parts (inline).**
- Backdrop.
- Header (`SourceBadge` + CloseButton).
- MetaRow (`ContentTypeBadge`, specialty, дата, время чтения).
- Title (`h1`).
- AuthorOrgRow.
- Summary.
- Fulltext.
- PracticeImpactBlock («Что это меняет в практике»).
- PrimarySourcesList.
- Footer (`SaveButton` + `PracticeUsefulButton`).

**User actions.**
- Клик по backdrop → `onClose()`.
- Клик по close-кнопке → `onClose()`.
- Escape → `onClose()`.
- Клик по ссылке в `PrimarySourcesList` → открытие в новой вкладке.
- Сохранить / Полезно → `onSave` / `onPractice`.

**Dependencies.**
- `components/feed/{SourceBadge, ContentTypeBadge, SaveButton, PracticeUsefulButton}`.
- `components/common/Icon`.
- `utils/format` (`formatDateFull`, `readingLabel`).
- `config/productConfig` (feature flags для action-кнопок).

**Analytics events.**
- `detail_view { item_id, source: 'card' | 'search' | 'saved' | 'shake' }`.
- `detail_close { item_id, dwell_ms }`.
- `primary_source_click { item_id, url }`.
- `save_toggle` / `practice_useful_toggle` (`source: 'drawer'`).

**Configuration keys.**
- Тексты «Что это меняет в практике» и «Первоисточники» — в JSX, кандидаты на `productConfig`.
- `featureFlags.enableSavedBoards` / `enablePracticeReaction`.

**Notes.**
- Backdrop-клик + ESC → close. Focus-trap не реализован — кандидат.
- Возврат фокуса на исходную карточку при close — не реализован.
- `primarySources` открываются в новой вкладке с `rel="noopener noreferrer"` (URL — mock `example.org`).
- Не грузит реальные страницы источников. Всё содержимое — из `FeedItem`.
- Sticky header/footer — action-панель и source всегда в поле зрения.

---

## SaveToBoardModal

**Файл:** `src/components/feed/SaveToBoardModal.tsx` (+ `SaveToBoardModal.module.css`)

**User purpose.** Уточнение «куда именно» сохранён материал. Открывается по toast-action после первого save; не блокирует основной поток. Даёт 4 фиксированных доски: «Прочитать позже» / «Для практики» / «Исследования» / «Обсудить с коллегами».

**Input props.**
- `item: FeedItem | null` — если `null`, модалка скрыта.
- `currentBoardId?: string` — текущая доска (для предвыбранного варианта).
- `onSelect: (board_id: string) => void`.
- `onClose: () => void`.

**Internal state.**
- `selectedBoard: string | null` — локальный выбор до подтверждения.

**Sub-parts (inline).**
- Backdrop.
- Header (Title + CloseButton).
- Subtitle (title материала, truncate).
- BoardOption × 4 (radio-подобные).
- Footer (Cancel + Save buttons).

**User actions.**
- Клик по backdrop → `onClose()`.
- Клик по close-кнопке → `onClose()`.
- Escape → `onClose()`.
- Клик по board-option → `selectedBoard = id`.
- Клик «Сохранить» → `onSelect(selectedBoard)`, `onClose()`.
- Клик «Не сейчас» → `onClose()` (без сохранения доски).

**Dependencies.**
- `components/common/Icon`.
- `config/productConfig` (`boards`).

**Analytics events.**
- `save_to_board_open { item_id }`.
- `board_assign { item_id, board_id }`.
- `save_to_board_cancel { item_id }`.

**Configuration keys.**
- `productConfig.boards` — состав, порядок, подписи досок.
- `featureFlags.enableSavedBoards` — при отключении модалка и toast-action не показываются вообще.

**Notes.**
- Открывается только через toast-action, не автоматически при save.
- Одна доска на материал. Переприсваивание — не создаёт дубль.
- Пользователь не может создать свою доску — сознательное ограничение прототипа.
- Focus-trap не реализован; ESC работает.
- При закрытии без выбора материал остаётся сохранённым без доски.

---

## SearchOverlay

**Файл:** `src/components/feed/SearchOverlay.tsx` (+ `SearchOverlay.module.css`)

**User purpose.** Единственная точка поиска по mock-базе материалов. Полноэкранный overlay с большим input, hint про области поиска и списком результатов первого уровня. Работает только по проверенным материалам.

**Input props.**
- `open: boolean`.
- `query: string` — контролируемое значение.
- `results: FeedItem[]` — список результатов (уже отфильтровано `useFeedState`).
- `sourcesById: Record<string, Source>`.
- `onQueryChange: (q: string) => void`.
- `onSelect: (item: FeedItem) => void` — закрыть + открыть drawer.
- `onClose: () => void`.

**Internal state.**
- `inputRef` — фокус при открытии.

**Sub-parts (inline).**
- Backdrop.
- SearchInputRow (`Icon 'search'` + input + CloseButton).
- HintUnderInput.
- ResultsList (SearchResultRow × N).
- EmptyState (при пустом `results` и непустом `query`).

**User actions.**
- Ввод в input → `onQueryChange(q)`.
- Клик по результату → `onSelect(item)`, `onClose()`.
- Клик по close-кнопке / backdrop / Escape → `onClose()`.
- Enter при активном первом результате → `onSelect(result[0])` (TBD, не реализовано).

**Dependencies.**
- `components/common/Icon`, `components/common/EmptyState`.
- `components/feed/{ContentTypeBadge, SourceBadge}`.
- `hooks/useFeedState` (снаружи, через `FeedPage`).

**Analytics events.**
- `search_open { source: 'header' | 'saved' }`.
- `search_query { q_length, result_count }`.
- `search_result_click { item_id, position, q_length }`.
- `search_close { dwell_ms, resulted_in_open: boolean }`.

**Configuration keys.**
- `featureFlags.enableSearch` — при отключении иконки поиска и overlay не появляются.
- Placeholder-текст и hint — в JSX, кандидаты на `productConfig`.
- Логика `matchesQuery` — `hooks/useFeedState.ts`, кандидат на вынос.

**Notes.**
- Дебаунса нет — mock-база маленькая. Для реального поиска нужен debounce 200-300 ms.
- Простое `includes` без лемматизации.
- Поиск не отсекает out-of-specialty (в отличие от основного режима), т.к. пользователь явно ищет. Открытый вопрос.
- Focus-trap не реализован; фокус на input при открытии.
- Клавиатурная навигация по результатам стрелками — не реализована.

---

## ShakeFeedPanel

**Файл:** `src/components/feed/ShakeFeedPanel.tsx` (+ `ShakeFeedPanel.module.css`)

**User purpose.** Реализация сценария «Встряхнуть ленту». Показывает материалы из смежных медицинских направлений в отдельной секции над основной лентой. Явно помеченная как out-of-specialty, не влияющая на персонализацию.

**Input props.**
- `items: FeedItem[]` — `outOfSpecialtyItems` из `useFeedState`.
- `sourcesById: Record<string, Source>`.
- `savedIds: Set<string>`.
- `practiceIds: Set<string>`.
- `onOpen: (item: FeedItem) => void`.
- `onSave: (item: FeedItem) => void`.
- `onPractice: (item: FeedItem) => void`.
- `onHide: (item: FeedItem, reason: HideReason) => void`.
- `onClose: () => void`.

**Internal state.** Нет.

**Sub-parts (inline).**
- Header (Title + CloseButton).
- Disclaimer.
- `FeedCard` × N.
- FooterCTA («Вернуться в основную ленту»).

**User actions.**
- Клик по карточке → `onOpen(item)`.
- Сохранить / Полезно / скрыть → соответствующие колбэки.
- Клик по close-кнопке или FooterCTA → `onClose()`.

**Dependencies.**
- `components/feed/FeedCard`.
- `config/productConfig` (`toastText.outOfSpecialty`).
- `types` (`FeedItem`, `HideReason`).

**Analytics events.**
- `out_of_specialty_open { source: 'right_rail' | 'other' }`.
- `out_of_specialty_close { dwell_ms, items_opened }`.
- `card_open` / `save_toggle` / `practice_useful_toggle` (`source: 'shake'` — эмитятся вызывающим).

**Configuration keys.**
- `toastText.outOfSpecialty` — текст disclaimer.
- `featureFlags.enableOutOfSpecialtyMode` — при отключении режим недоступен полностью.

**Notes.**
- Материалы с флагом `outOfSpecialty` никогда не попадают в основную ленту, независимо от режима.
- Основная лента остаётся видимой ниже панели.
- Сохранение из этой панели работает как обычно.
- Персонализация из «Полезно для практики» на этих материалах — открытый вопрос: договориться на уровне бэкенда. Сейчас в mock сохраняется как обычная реакция.

---

## Toast

**Файлы:** `src/components/common/Toast.tsx` (+ `Toast.module.css`), `src/hooks/useToast.ts`.

**User purpose.** Единая точка коротких неблокирующих feedback-сообщений о выполненном действии. Опционально с одной action-кнопкой («Отменить» / «Выбрать доску» и т.п.). Автоскрытие через ~3.6 сек.

**Input props.**
- `toast: ToastState | null` — `{ id, message, action? }`.
- `onDismiss: () => void`.
- `variant?: 'web' | 'ios'` — позиционирование (bottom-center vs выше tab bar с учётом safe-area).

**Internal state.** Нет в самом компоненте; логика показа / таймаута — в `useToast`.

**Sub-parts (inline).**
- Message.
- ActionButton (опционально).

**User actions.**
- Клик по action → `action.onClick()`, затем `onDismiss()`.
- Swipe-to-dismiss на iOS — не реализовано.
- Escape не закрывает (сознательно, чтобы не сбивать ввод).

**Dependencies.**
- `hooks/useToast` (снаружи).
- Собственный CSS-модуль.

**Analytics events.**
- `toast_show { message_key }`.
- `toast_action_click { message_key, action_key }`.
- `toast_auto_dismiss { message_key }`.

**Configuration keys.**
- `toastText.*` — все пользовательские строки.
- Длительность `3600 ms` — hardcoded в `useToast.show()`; кандидат на `productConfig.toast.durationMs`.

**Notes.**
- Один toast за раз, новый вытесняет предыдущий.
- Не глобальный: каждый экран (`FeedPage` / `IosFeed` / `IosSavedScreen`) держит свой `useToast`. При появлении глобального стора — вынести.
- Клик по самому toast (мимо action) не закрывает — сознательно, чтобы случайный клик при чтении не смахивал сообщение.
- `variant='ios'` учитывает высоту tab bar и `safe-area-bottom`.
- Максимум одна action-кнопка в toast (нет мультиэкшна).

---

## EmptyState

**Файл:** `src/components/common/EmptyState.tsx` (+ `EmptyState.module.css`)

**User purpose.** Универсальный «пустой» плейсхолдер. Спокойный, без иллюстраций и восклицаний. Показывается при пустом результате поиска / пустой выборке фильтра / пустом разделе «Сохранённое».

**Input props.**
- `title: string`.
- `description?: string`.
- `action?: ReactNode` — слот для CTA (кнопка/ссылка).

**Internal state.** Нет.

**Sub-parts (inline).**
- Dot (нейтральный серый круг).
- Title (h-level не задан — использует `role="status"` на wrap).
- Description.
- ActionSlot.

**User actions.** Нет напрямую. Действие приходит через action-slot от вызывающего.

**Dependencies.** Нет. Только CSS Module + tokens.

**Analytics events.**
- `empty_state_view { context: 'search' | 'feed' | 'saved', reason? }` — эмитится вызывающим.

**Configuration keys.**
- Тексты `title` / `description` задаёт вызывающий; строки вроде «Ничего не нашли по запросу „…“» — кандидаты на `productConfig`.

**Notes.**
- Dot — нейтральный, не иконка по контексту. Альтернатива — принимать `icon`-name prop.
- `role="status"` на wrap для screen reader.
- Не отвечает за действие «Обновить» — это `ErrorState`.

---

## ErrorState

**Файл:** `src/components/common/ErrorState.tsx` (+ `ErrorState.module.css`)

**User purpose.** Спокойное сообщение об ошибке загрузки ленты с одной primary-кнопкой «Попробовать снова». Не блокирует остальной контент.

**Input props.**
- `title?: string` — по умолчанию «Не удалось обновить ленту».
- `onRetry: () => void`.

**Internal state.** Нет.

**Sub-parts (inline).**
- Title.
- RetryButton.

**User actions.**
- Клик «Попробовать снова» → `onRetry()`.

**Dependencies.** Нет. Только CSS Module + tokens.

**Analytics events.**
- `error_state_view { source: 'feed_refresh' | 'other', reason? }`.
- `error_retry_click { source }`.

**Configuration keys.**
- `toastText.errorLoad` — дефолтный title.
- Feature flags не влияют.

**Notes.**
- `role="alert"` на wrap.
- Не показывает деталей ошибки (только человекочитаемое сообщение).
- Retry вызывает тот же путь, что и обычный refresh.
- В прототипе включается вручную через дев-кнопку «Показать ошибку загрузки»; настоящей сетевой эмуляции нет.

---

## SkeletonCard

**Файл:** `src/components/common/SkeletonCard.tsx` (+ `SkeletonCard.module.css`)

**User purpose.** Placeholder для карточки ленты во время загрузки / рефреша. Даёт визуальный сигнал «сюда придут материалы», повторяет структуру `FeedCard`, чтобы не было layout shift.

**Input props.** Нет.

**Internal state.** Нет.

**Sub-parts (inline).**
- MetaRow (chip × 3).
- TitleLine, TitleShortLine.
- BodyLine × 2.

**User actions.** Нет.

**Dependencies.** Нет. Только CSS Module.

**Analytics events.**
- Не эмитятся. Опционально `skeleton_view` — для метрики TTI.

**Configuration keys.**
- Количество скелетонов на экран — сейчас 3, хардкод в `FeedPage`; кандидат на `productConfig.skeleton.count`.
- Длительность shimmer `1.4s` — hardcoded в CSS; кандидат на CSS-переменную.

**Notes.**
- `aria-hidden` — скринридер не читает.
- Ширины линий подобраны под средний размер title/summary.
- `prefers-reduced-motion` не учитывается сейчас. Кандидат на добавление (заменить shimmer на статичную заливку).

---

## Icon

**Файл:** `src/components/common/Icon.tsx` (без CSS-модуля).

**User purpose.** Единый inline-SVG иконочный компонент. Один `<svg viewBox="0 0 24 24">`, цвет через `currentColor`, штрих 1.7, наследование от родителя. Замена внешним иконочным библиотекам.

**Input props.**
- `name: IconName` — имя иконки из внутреннего справочника.
- `size?: number` — по умолчанию 20 (px).
- `strokeWidth?: number` — по умолчанию 1.7.
- `style?: CSSProperties` — inline-стили (обычно color override).
- `aria-hidden?: boolean` — по умолчанию `true`.

**Internal state.** Нет.

**Sub-parts.** Нет.

**User actions.** Нет — декоративный компонент.

**Dependencies.** Нет — нет иконочных библиотек.

**Analytics events.** Нет.

**Configuration keys.**
- Каталог иконок `paths` внутри `Icon.tsx` — не в config; кандидат на вынос при разрастании (> 50 иконок) в `icons/paths.ts`.

**Notes.**
- Экспортирует тип `IconName` (union) — источник правды для остальных компонентов.
- `aria-hidden=true` по умолчанию (декоративность).
- Filled-варианты (`bookmark-filled`, `thumbs-up-filled`) — отдельные entries, `fill="currentColor"` в path.
- Не поддерживает анимации, dual-tone.
- Добавление иконки: расширить `IconName` + добавить `<path/>` в `paths`. Никаких плагинов сборки.

---

## DevicePreviewSwitcher

**Файл:** `src/components/web/DevicePreviewSwitcher.tsx` (+ `DevicePreviewSwitcher.module.css`)

**User purpose.** Демо-переключатель между Desktop web и iPhone-композициями прототипа. Не часть продукта. Для показа заказчику. Кандидат на удаление в проде.

**Input props.** Нет.

**Internal state.** Нет. Активный определяет `react-router`.

**Sub-parts (inline).**
- Label («Прототип»).
- `NavLink` «Desktop Web» (`/web`).
- `NavLink` «iPhone 15 Pro Max» (`/ios`).

**User actions.**
- Клик по «Desktop Web» → navigate `/web`.
- Клик по «iPhone 15 Pro Max» → navigate `/ios`.

**Dependencies.**
- `react-router-dom` (`NavLink`).

**Analytics events.**
- `device_preview_switch { to: 'web' | 'ios' }` — для аналитики демо-сессий.

**Configuration keys.**
- `featureFlags` — не покрывает пока; кандидат на добавление `featureFlags.showDevicePreviewSwitcher`.
- `VITE_SHOW_DEVICE_SWITCHER` (env) — альтернатива для сборки без свитчера.

**Notes.**
- `z-index=70` — поверх toast и drawer.
- Перекрывает `MobileTabBar` на iOS-маршруте (визуально сверху). Открытый вопрос: сместить, спрятать за hotkey или оставить.
- В прод-версии продукта убрать полностью.
- Позиция bottom-right фиксированная; при resize не мигрирует.

---

## IosShell

**Файл:** `src/components/ios/IosShell.tsx` (+ `IosShell.module.css`)

**User purpose.** Композиция iOS-версии Яндекс Мед. Держит табы (Лента / AI-чат / Сохранённое / Профиль) и sticky `MobileTabBar`. На desktop-viewport оборачивается в `DeviceFrame` (макет iPhone) для демо; на touch-устройстве фрейм скрыт.

**Input props.** Нет.

**Internal state.**
- `tab: 'feed' | 'chat' | 'saved' | 'profile'` (по умолчанию `'feed'`).

**Sub-parts.**
- DeviceFrame (visual chrome, только для desktop viewport).
- Screen (inner content, safe-area aware).
- `IosFeed` / `IosChatStub` / `IosSavedScreen` / `IosProfileScreen` — по `tab`.
- `MobileTabBar` (sticky bottom, 4 таба).

**User actions.**
- Клик по табу в `MobileTabBar` → `setTab(id)`.
- Клик по фрейму — no-op (декоративный).

**Dependencies.**
- `components/ios/{IosFeed, IosChatStub, IosSavedScreen, IosProfileScreen, MobileTabBar}`.

**Analytics events.**
- `tab_change { from, to, device: 'ios' }`.
- `ios_shell_view`.

**Configuration keys.**
- Не влияют напрямую. `DeviceFrame` показывается через media-query, кандидат на `productConfig.ios.showDeviceFrame`.

**Notes.**
- `DeviceFrame` — часть демо, не продукта. Убрать при реальной сборке.
- Safe-area: `env(safe-area-inset-*)` в screen. На desktop-макете фиксированные значения через `:root` fallback.
- Свайпы назад / home-indicator — не эмулируются.
- Дефолтный tab — `feed` (открывается на новой функции).

---

## IosHeader

**Файл:** `src/components/ios/IosHeader.tsx` (+ `IosHeader.module.css`)

**User purpose.** Верхняя панель iOS-ленты. Заголовок («Для вас»), доступ к поиску, аватар. В режиме поиска — inline-поиск, без полноэкранного overlay.

**Input props.**
- `title: string` — по умолчанию «Для вас».
- `searchActive: boolean`.
- `query: string`.
- `onQueryChange: (q: string) => void`.
- `onOpenSearch: () => void`.
- `onCloseSearch: () => void`.
- `onAvatarClick: () => void` — по умолчанию переход в таб `profile`.

**Internal state.**
- `inputRef` — фокус при переходе в `searchActive`.

**Sub-parts (inline).**
- TitleRow (`title` + SearchIconButton + Avatar).
- SearchRow (BackButton + Input + ClearButton) — при `searchActive`.
- `IosFilters` (внизу, вне `searchActive`).

**User actions.**
- Тап по SearchIconButton → `onOpenSearch()`.
- Тап по Avatar → `onAvatarClick()` (переход в таб `profile`).
- Ввод в input → `onQueryChange`.
- Тап по BackButton → `onCloseSearch()`, `query = ''`.
- Тап по ClearButton → `onQueryChange('')`.

**Dependencies.**
- `components/common/Icon`.
- `components/ios/IosFilters` (композитно).
- `data/user.json` (`avatarInitials`).

**Analytics events.**
- `ios_header_view`.
- `search_open { source: 'ios_header' }`.
- `search_close { source: 'ios_header' }`.
- `avatar_click { source: 'ios_header' }`.

**Configuration keys.**
- Тексты title/placeholder — в JSX, кандидат на `productConfig`.
- Blur-параметры — в CSS.

**Notes.**
- Sticky `top: 0` с blur, отделено от контента прозрачным фоном `0.92`.
- Safe-area-top учитывается через `var(--ios-safe-top)`.
- Inline-поиск вместо overlay — нативнее для iOS.
- Avatar дублирует таб Профиль — сознательное дублирование доступа.

---

## IosFilters

**Файл:** `src/components/ios/IosFilters.tsx`

**User purpose.** iOS-обёртка над `FeedFilters` с `variant='ios'`. Существует для читаемости импортов в `IosHeader`; функционально идентична `FeedFilters`.

**Input props.**
- `active: FilterId`.
- `onChange: (id: FilterId) => void`.
- (те же, что у `FeedFilters`, минус `variant`).

**Internal state.** Нет.

**Sub-parts.**
- `FeedFilters` (полностью делегирует).

**User actions.** См. `FeedFilters`.

**Dependencies.**
- `components/feed/FeedFilters`.

**Analytics events.**
- `filter_change { from, to, source: 'ios' }` — эмитится вызывающим.

**Configuration keys.**
- `productConfig.filters` (через `FeedFilters`).

**Notes.**
- Тонкая обёртка. Кандидат на удаление, если решим импортировать `FeedFilters` напрямую в `IosHeader`.
- `variant='ios'` в `FeedFilters`: скрыт нижний border, увеличены padding и шрифт чипов до 44px min-height.

---

## IosFeed

**Файл:** `src/components/ios/IosFeed.tsx` (+ `IosFeed.module.css`)

**User purpose.** iOS-экран ленты. Та же бизнес-модель, что `FeedPage`, другая композиция: без right rail, с pull-to-refresh, полноэкранным `IosDetailScreen`, toast над tab bar.

**Input props.**
- `onOpenProfile: () => void` — тап по аватару → `tab='profile'` в `IosShell`.

**Internal state (UI).**
- `openItem: FeedItem | null`.
- `searchActive: boolean`.
- `pendingSkeletons: boolean`.
- `refreshBadge: { visible: boolean, count: number }`.

**Business state.** См. `useFeedState`.

**Sub-parts.**
- `IosHeader`.
- PullToRefreshArea (touch handlers on scroll container).
- `PersonalizationHint`.
- RefreshBadge.
- `ErrorState`.
- `ShakeFeedPanel`.
- `SkeletonCard` × N.
- `FeedCard variant='ios'` × N.
- `endBanner`.
- Overlays: `IosDetailScreen`, `SaveToBoardModal` (iOS bottom-sheet), `Toast variant='ios'`.

**User actions.**
- Pull-to-refresh (touch): drag сверху вниз при `scrollTop=0`, threshold 60px → `refresh()`.
- Тап по карточке → `openItem = item`, показ `IosDetailScreen`.
- Тап по SearchIconButton → `searchActive = true`.
- Ввод в inline-search → filter items in-place.
- «Сохранить» → `toggleSave`, toast с action «Выбрать доску».
- «Выбрать доску» → показ `SaveToBoardModal` (bottom-sheet).
- «Полезно» → `togglePracticeUseful`, toast.
- Меню карточки → `hideItem`, toast «Отменить».
- Тап по аватару → `onOpenProfile()`.

**Dependencies.**
- `hooks/useFeedState`, `hooks/useToast`.
- `components/ios/{IosHeader, IosDetailScreen, MobileTabBar}`.
- `components/feed/{FeedCard, ShakeFeedPanel, SaveToBoardModal, PersonalizationHint}`.
- `components/common/{Toast, EmptyState, ErrorState, SkeletonCard}`.

**Analytics events.**
- `feed_view { device: 'ios', filter }`.
- `pull_to_refresh { added }`.
- `card_open { item_id, source: 'ios_feed' }`.
- `inline_search_query { q_length, result_count }`.
- Остальные — см. `FeedPage`.

**Configuration keys.**
- `feedLimits.maxNewItems`.
- `toastText.refreshedCount`, `endOfFeed`, `nextRefresh`, `outOfSpecialty`.
- `featureFlags.*`.
- Pull-to-refresh threshold (60px) — hardcoded, кандидат на `productConfig`.

**Notes.**
- Pull-to-refresh — тач-only. На desktop-viewport (макет iPhone внутри web) — работает по mouse-drag эмуляции, но UX не идеален. Кандидат на кнопку «Обновить» в overflow-меню как fallback.
- Right rail отсутствует полностью. `ShakeFeedTrigger` — TBD: в конец ленты / в профиль / в фильтры.
- `IosDetailScreen` открывается полноэкранно с slide-from-right.
- RefreshBadge появляется на 2 сек и исчезает автоматически.

---

## IosDetailScreen

**Файл:** `src/components/ios/IosDetailScreen.tsx` (+ `IosDetailScreen.module.css`)

**User purpose.** Полноэкранный просмотр материала на iOS. Второй уровень контента: автор, организация, summary, fulltext, «Что это меняет в практике», первоисточники. Стандартный iOS push-паттерн — slide-from-right, кнопка «Назад» слева.

**Input props.**
- `item: FeedItem`.
- `source: Source`.
- `saved: boolean`.
- `practiceUseful: boolean`.
- `onClose: () => void`.
- `onSave: () => void`.
- `onPractice: () => void`.
- `onHide: (reason: HideReason) => void`.

**Internal state.** Нет.

**Sub-parts (inline).**
- NavBar (BackButton + SaveIconBtn + OverflowMenu).
- MetaSection (`SourceBadge` + дата + reading).
- `ContentTypeBadge`.
- Title (`h1`).
- AuthorOrgRow.
- Summary.
- Fulltext.
- PracticeImpactBlock.
- PrimarySourcesList.
- Footer (`SaveButton` + `PracticeUsefulButton`, 2 колонки).

**User actions.**
- Тап «Назад» → `onClose()`.
- Swipe-from-left-edge → `onClose()` (TBD, не реализовано).
- Save / Practice / Hide → соответствующие колбэки.
- Тап по ссылке в PrimarySourcesList → открытие в новой вкладке.

**Dependencies.**
- `components/feed/{SourceBadge, ContentTypeBadge, SaveButton, PracticeUsefulButton, CardOverflowMenu}`.
- `components/common/Icon`.
- `utils/format`.

**Analytics events.**
- `detail_view { item_id, device: 'ios', source: 'ios_feed' | 'ios_search' | 'ios_saved' | 'shake' }`.
- `detail_close { item_id, dwell_ms, method: 'back' | 'swipe' }`.
- `primary_source_click`.

**Configuration keys.**
- `featureFlags.enableSavedBoards` / `enablePracticeReaction`.
- `toastText` — на уровне вызывающего `IosFeed` / `IosSavedScreen`.

**Notes.**
- При открытии `MobileTabBar` скрыт (сфокусироваться на чтении). Открытый вопрос: оставить видимым или нет.
- Дублирование `SaveButton` в NavBar и Footer — сознательно (доступ большим пальцем + видимость при разной длине материала).
- Swipe-back жест не реализован; кнопка «Назад» — единственный путь.
- Slide-from-right анимация 280 ms ease-out.
- Safe-area-bottom учтена в footer.

---

## MobileTabBar

**Файл:** `src/components/ios/MobileTabBar.tsx` (+ `MobileTabBar.module.css`)

**User purpose.** Основная нижняя навигация iOS-версии. 4 таба: Лента, AI-чат, Сохранённое, Профиль. Sticky, с учётом safe-area, blur-фон.

**Input props.**
- `active: 'feed' | 'chat' | 'saved' | 'profile'`.
- `onChange: (tab) => void`.
- `visible?: boolean` — по умолчанию `true`; при `false` плавно уезжает вниз (для `IosDetailScreen`).

**Internal state.** Нет.

**Sub-parts (inline).**
- TabButton × 4 (Icon + Label).

**User actions.**
- Тап по табу → `onChange(id)`.

**Dependencies.**
- `components/common/Icon`.

**Analytics events.**
- `tab_change { from, to, device: 'ios' }`.

**Configuration keys.**
- Список табов — сейчас захардкожен в `MobileTabBar.tsx`, кандидат на `productConfig.ios.tabs`.

**Notes.**
- Blur-фон `0.94` + safe-area-bottom.
- Активный таб — accent-strong (тёмный лавандовый).
- Badge-уведомления не реализованы.
- Скрывается через prop `visible` при открытом `IosDetailScreen`.
- `min-height` content 49px (без safe-area).

---

## IosSavedScreen

**Файл:** `src/components/ios/IosSavedScreen.tsx` (+ `IosSavedScreen.module.css`)

**User purpose.** iOS-экран раздела «Сохранённое». Список сохранённых материалов с фильтрацией по доскам (Прочитать позже / Для практики / Исследования / Обсудить с коллегами). Открывает те же карточки в `IosDetailScreen`.

**Input props.** Нет.

**Internal state.**
- `activeBoard: string | 'all'` (по умолчанию `'all'`).
- `openItem: FeedItem | null`.
- `query?: string` (при реализации inline-search по сохранённым).

**Sub-parts.**
- Header (Title + SearchIconButton).
- BoardTabs (`FeedFilters`-подобные чипы с другим составом).
- `FeedCard variant='ios'` × N.
- `EmptyState` (при пустом списке).
- Overlays: `IosDetailScreen`, `Toast variant='ios'`, `SaveToBoardModal` (при переприсваивании).

**User actions.**
- Смена доски → `setActiveBoard(id)`.
- Тап по карточке → `openItem = item`.
- Тап по SaveButton в карточке → `toggleSave` (снятие сохранения).
- Inline-поиск (при реализации) → фильтр по `query`.

**Dependencies.**
- `hooks/useFeedState` (`savedItems`, `savedRaw.boardAssignments`).
- `hooks/useToast`.
- `components/ios/IosDetailScreen`.
- `components/feed/{FeedCard, SaveToBoardModal}`.
- `components/common/EmptyState`, `components/common/Toast`.
- `config/productConfig` (`boards`).

**Analytics events.**
- `saved_view { device: 'ios', board }`.
- `board_filter_change { from, to, source: 'ios_saved' }`.
- `card_open { item_id, source: 'ios_saved' }`.
- `save_toggle { source: 'ios_saved' }` (снятие).

**Configuration keys.**
- `productConfig.boards` — состав досок.
- `featureFlags.enableSavedBoards` — при отключении BoardTabs скрыт, показываем плоский список.

**Notes.**
- «Все» — виртуальный board, не в `productConfig.boards`.
- Материалы без назначенной доски видны только в «Все».
- Изменение доски у уже сохранённого — только через toast после новой попытки save. Прямого «Изменить доску» из saved пока нет (кандидат на overflow-menu в saved-режиме).

---

## IosProfileScreen

**Файл:** `src/components/ios/IosProfileScreen.tsx` (+ `IosProfileScreen.module.css`)

**User purpose.** iOS-таб профиля пользователя. Показывает специальность, интересы, ссылки на настройки, юр.документы и выход. Все пункты — no-op в прототипе.

**Input props.** Нет.

**Internal state.** Нет.

**Sub-parts (inline).**
- HeaderTitle («Профиль»).
- UserCard (Avatar + Name + Role).
- InterestsSection (заголовок + чипы интересов).
- SettingsListRow × N.
- BottomDisclaimer.

**User actions.**
- Тап по любому пункту — no-op (заглушка).
- Тап по интересу — no-op (кандидат на «удалить»).

**Dependencies.**
- `components/common/Icon`.
- `data/user.json`.

**Analytics events.**
- `profile_view`.
- `settings_row_click { row_id }` — пока не эмитится, точки расширения.

**Configuration keys.**
- `user.*` — `data/user.json` (`name`, `specialty`, `role`, `interests`, `avatarInitials`).
- Список пунктов настроек — сейчас захардкожен в компоненте, кандидат на `productConfig.ios.profileSettings`.

**Notes.**
- Ни один пункт не работает — прототип демонстрации.
- «Выйти» стилизован `--color-danger`, но не выходит никуда.
- Interests-чипы неудаляемые. Кандидат на CRUD.
- iOS large-title стиль header (переход в compact при скролле — не реализован).

---

## IosChatStub

**Файл:** `src/components/ios/IosChatStub.tsx` (+ `IosChatStub.module.css`)

**User purpose.** iOS-заглушка раздела AI-чата. Воспроизводит визуальный минимум: приветствие, панель лимита, sticky input внизу. Функциональной AI-логики нет.

**Input props.** Нет.

**Internal state.** Нет. Инпут неуправляемый.

**Sub-parts (inline).**
- Header (Title + NewChatButton).
- EmptyState (Sparkle + Greeting + Subtitle).
- LimitBanner (текст + PromoCodeRow).
- StickyInputRow (Input + SendButton disabled).

**User actions.**
- Тап «Новый чат» — no-op.
- Ввод в инпут — no-op (нет отправки).
- Клик «Применить код» — no-op.

**Dependencies.**
- `components/common/Icon`.

**Analytics events.**
- `chat_stub_view { device: 'ios' }`.
- `new_chat_click { device: 'ios' }`.
- `promo_apply_click { device: 'ios' }`.

**Configuration keys.**
- Тексты — в JSX, кандидаты на `productConfig.chatStub`.

**Notes.**
- StickyInputRow позиционируется над `MobileTabBar` с учётом safe-area.
- SendButton disabled — нет функциональности.
- Кандидат на удаление таба AI-чата из iOS-версии, если решим, что лента — единственная новая функция для iOS.
