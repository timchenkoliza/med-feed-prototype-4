import type { EvidenceLevel, FeedAType, FeedBType, FeedVariant, SourceStatusR } from './types'

/** Единая точка правки текстов, фильтров и параметров исследования. */

export const feedMeta: Record<FeedVariant, { title: string; subtitle: string; storageKey: string }> = {
  A: {
    title: 'Клиническая лента',
    subtitle: 'Доказательные материалы по вашей специальности',
    storageKey: 'medfeed.research.a.v1',
  },
  B: {
    title: 'Профессиональная лента',
    subtitle: 'Индустрия, обучение и события для врачей',
    storageKey: 'medfeed.research.b.v1',
  },
}

export const feedATypeLabels: Record<FeedAType, string> = {
  research: 'Исследование',
  meta_analysis: 'Метаанализ',
  clinical_guideline: 'Клинические рекомендации',
  standard_change: 'Изменение стандартов',
  drug_safety: 'Безопасность препаратов',
}

export const feedBTypeLabels: Record<FeedBType, string> = {
  pharma_news: 'Фарма',
  medtech: 'Medtech',
  conference: 'Конференция',
  webinar: 'Вебинар',
  nmo: 'НМО',
  video: 'Видео',
  podcast: 'Подкаст',
  expert: 'Мнение эксперта',
}

export const evidenceLabels: Record<EvidenceLevel, string> = {
  '1A': 'Уровень 1A',
  '1B': 'Уровень 1B',
  '2A': 'Уровень 2A',
  '2B': 'Уровень 2B',
  '3': 'Уровень 3',
  expert: 'Мнение экспертов',
}

export const sourceStatusLabelsR: Record<SourceStatusR, string> = {
  peer_reviewed: 'рецензируемое издание',
  official: 'официальный источник',
  association: 'профессиональная ассоциация',
  verified: 'верифицированный источник',
}

export const feedAFilters: Array<{ id: 'all' | FeedAType | 'saved'; label: string }> = [
  { id: 'all', label: 'Все' },
  { id: 'clinical_guideline', label: 'Рекомендации' },
  { id: 'research', label: 'Исследования' },
  { id: 'meta_analysis', label: 'Метаанализы' },
  { id: 'standard_change', label: 'Стандарты' },
  { id: 'drug_safety', label: 'Безопасность' },
  { id: 'saved', label: 'Сохранённое' },
]

export const feedBFilters: Array<{ id: 'all' | FeedBType | 'saved'; label: string }> = [
  { id: 'all', label: 'Все' },
  { id: 'pharma_news', label: 'Фарма' },
  { id: 'medtech', label: 'Medtech' },
  { id: 'conference', label: 'Конференции' },
  { id: 'webinar', label: 'Вебинары' },
  { id: 'nmo', label: 'НМО' },
  { id: 'video', label: 'Видео' },
  { id: 'podcast', label: 'Подкасты' },
  { id: 'expert', label: 'Эксперты' },
  { id: 'saved', label: 'Сохранённое' },
]

export const specialties: Array<{ id: string; label: string }> = [
  { id: 'cardiologist', label: 'Кардиология' },
  { id: 'therapist', label: 'Терапия' },
  { id: 'neurologist', label: 'Неврология' },
  { id: 'endocrinologist', label: 'Эндокринология' },
]

export const researchText = {
  saved: 'Сохранено',
  unsaved: 'Убрано из сохранённого',
  useful: 'Отмечено как полезное',
  unuseful: 'Отметка снята',
  hidden: 'Материал скрыт',
  undo: 'Вернуть',
  reset: 'Состояние сброшено',
  end: 'Вы просмотрели все материалы подборки',
  endSub: 'Следующее обновление — завтра в 8:00',
  emptyTitle: 'Здесь пока пусто',
  emptyBody: 'Смените фильтр или сбросьте состояние сессии.',
  aiDisclaimer: 'Ответ сгенерирован по тексту материала. Демонстрационный прототип, не клиническая рекомендация.',
  registerDone: 'Вы зарегистрированы',
  privacyNote: 'Данные остаются на устройстве и никуда не отправляются.',
}

export const askAiSuggestions = {
  A: [
    'Кратко: что изменилось?',
    'Как это применить на приёме?',
    'Каким пациентам это не подходит?',
  ],
  B: [
    'О чём этот материал за 30 секунд?',
    'Кому будет полезно?',
    'Что стоит посмотреть дальше?',
  ],
}

/* ---------- Параметры сессии исследования из query-строки ---------- */

export interface ResearchSession {
  variant: FeedVariant
  specialty: string | null
  session: string | null
}

export function readSession(defaultVariant: FeedVariant): ResearchSession {
  const q = new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search)
  const raw = (q.get('variant') ?? '').toUpperCase()
  return {
    variant: raw === 'A' || raw === 'B' ? (raw as FeedVariant) : defaultVariant,
    specialty: q.get('specialty'),
    session: q.get('session'),
  }
}
