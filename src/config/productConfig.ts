import type { BoardId, ContentType, FilterId, HideReason, SourceStatus } from '../types'

export const filters: Array<{ id: FilterId; label: string }> = [
  { id: 'for_you', label: 'Для вас' },
  { id: 'cardiology', label: 'Кардиология' },
  { id: 'guidelines', label: 'Клинические рекомендации' },
  { id: 'research', label: 'Исследования' },
  { id: 'drugs', label: 'Лекарственные препараты' },
  { id: 'education', label: 'Образование' },
  { id: 'conferences', label: 'Конференции' },
]

export const contentTypeLabels: Record<ContentType, string> = {
  clinical_guideline: 'Клинические рекомендации',
  research: 'Исследование',
  meta_analysis: 'Метаанализ',
  case_report: 'Клинический случай',
  drug_update: 'Обновление инструкции',
  ministry_news: 'Минздрав',
  international: 'Международная публикация',
  association: 'Профессиональная ассоциация',
  conference: 'Конференция',
  webinar: 'Вебинар',
  nmo_course: 'Курс НМО',
  expert_brief: 'Экспертный разбор',
}

export const sourceStatusLabels: Record<SourceStatus, string> = {
  verified: 'Верифицированный источник',
  official: 'Официальный источник',
  peer_reviewed: 'Рецензируемое издание',
  professional_association: 'Профессиональная ассоциация',
}

export const boards: BoardId[] = [
  { id: 'read_later', label: 'Прочитать позже' },
  { id: 'for_practice', label: 'Для практики' },
  { id: 'research', label: 'Исследования' },
  { id: 'discuss', label: 'Обсудить с коллегами' },
]

export const hideReasons: Array<{ id: HideReason; label: string }> = [
  { id: 'not_interested', label: 'Не интересна тема' },
  { id: 'distrust_source', label: 'Не доверяю источнику' },
  { id: 'already_seen', label: 'Уже видел' },
  { id: 'hide_material', label: 'Скрыть материал' },
]

export const feedLimits = {
  maxNewItems: 10,
  nextRefreshAt: 'завтра в 8:00',
}

export const toastText = {
  saved: 'Сохранено',
  savedToBoard: (b: string) => `Сохранено в «${b}»`,
  unsaved: 'Сохранение отменено',
  practiceUseful: 'Учтём это при настройке ленты',
  hidden: 'Материал скрыт',
  refreshedCount: (n: number) => `Добавлено ${n} новых материала${n === 1 ? '' : 'ов'}`,
  errorLoad: 'Не удалось обновить ленту',
  endOfFeed: 'Вы просмотрели все новые материалы',
  nextRefresh: 'Следующее обновление подборки — завтра в 8:00',
  outOfSpecialty:
    'Материалы из других медицинских направлений. Они не влияют на основную персонализацию.',
}

export const featureFlags = {
  enableSavedBoards: true,
  enablePracticeReaction: true,
  enableOutOfSpecialtyMode: true,
  enableEvents: true,
  enableOfflineMock: true,
  enableSearch: true,
  enableSourceVerification: true,
}

export const breakpoints = {
  mobile: 640,
  tablet: 900,
  desktop: 1200,
  wide: 1440,
}
