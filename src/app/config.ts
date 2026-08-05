import type { FeedId, ItemType, Section, SourceKind, SpecialtyId } from './types'
export { feedRules, layout, relevance, viewportWidth } from '../config/design-contract'

export const specialties: Array<{ id: SpecialtyId; label: string; short: string }> = [
  { id: 'therapist', label: 'Терапия', short: 'Терапевт' },
  { id: 'endocrinologist', label: 'Эндокринология', short: 'Эндокринолог' },
  { id: 'dentist', label: 'Стоматология', short: 'Стоматолог' },
  { id: 'obgyn', label: 'Акушерство и гинекология', short: 'Акушер-гинеколог' },
  { id: 'oncologist', label: 'Онкология', short: 'Онколог' },
  { id: 'dermatovenerologist', label: 'Дерматовенерология', short: 'Дерматовенеролог' },
]

export const feeds: Array<{ id: FeedId; label: string; title: string; note: string }> = [
  { id: 'A', label: 'Клиническая', title: 'Клиническая лента', note: 'Доказательная база и стандарты' },
  { id: 'B', label: 'Профессиональная', title: 'Профессиональная лента', note: 'События, обучение, индустрия' },
]

export const typeLabels: Record<ItemType, string> = {
  guideline_update: 'Рекомендации',
  research: 'Исследование',
  meta_analysis: 'Метаанализ',
  safety_alert: 'Безопасность',
  case_review: 'Клинический разбор',
  evidence_review: 'Обзор доказательств',
  conference: 'Конференция',
  webinar: 'Вебинар',
  pharma_medtech: 'Фарма и medtech',
  interview: 'Интервью',
  video: 'Видео',
  podcast: 'Подкаст',
}

export const typeFilters: Record<FeedId, ItemType[]> = {
  A: ['guideline_update', 'research', 'meta_analysis', 'safety_alert', 'case_review', 'evidence_review'],
  B: ['conference', 'webinar', 'pharma_medtech', 'interview', 'video', 'podcast'],
}

export const sourceKindLabels: Record<SourceKind, string> = {
  official: 'официальный источник',
  association: 'профессиональное сообщество',
  journal: 'рецензируемый журнал',
  clinic: 'клинический центр',
  media: 'отраслевое медиа',
  industry: 'коммерческий партнёр',
}

export const sections: Array<{ id: Section; label: string; icon: 'feed' | 'bookmark' | 'calendar' | 'user' }> = [
  { id: 'feed', label: 'Лента', icon: 'feed' },
  { id: 'saved', label: 'Сохранённое', icon: 'bookmark' },
  { id: 'events', label: 'События', icon: 'calendar' },
  { id: 'profile', label: 'Профиль', icon: 'user' },
]

/** Основное действие карточки — ровно одно. */
export function primaryActionLabel(type: ItemType, hasEvent: boolean): string {
  if (hasEvent) return 'Зарегистрироваться'
  if (type === 'video') return 'Смотреть'
  if (type === 'podcast') return 'Слушать'
  return 'Читать'
}

export const ui = {
  product: 'Яндекс Мед',
  section: 'Лента для врача',
  storageKey: 'medya.feed.v2',
  searchPlaceholder: 'Поиск по ленте: тема, источник, препарат',
  endTitle: 'Это вся подборка на сегодня',
  endBody: 'Следующее обновление — завтра в 8:00',
  emptyTitle: 'Ничего не нашли',
  emptyBody: 'Смените фильтр, ленту или специальность.',
  aiDisclaimer: 'Ответ собран по тексту материала. Прототип, не клиническая рекомендация.',
  privacy: 'Данные остаются на устройстве.',
  toast: {
    saved: 'Сохранено',
    unsaved: 'Убрано из сохранённого',
    useful: 'Отмечено как полезное',
    unuseful: 'Отметка снята',
    hidden: 'Материал скрыт',
    muted: 'Больше не показываем похожее',
    shared: 'Ссылка скопирована',
    reported: 'Спасибо, передадим редакции',
    registered: 'Регистрация подтверждена',
    reset: 'Состояние сброшено',
    undo: 'Вернуть',
  },
}

export function readQuery() {
  const q = new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search)
  const feed = (q.get('feed') ?? q.get('variant') ?? '').toUpperCase()
  const spec = q.get('specialty')
  return {
    feed: feed === 'A' || feed === 'B' ? (feed as FeedId) : null,
    specialty: specialties.some(s => s.id === spec) ? (spec as SpecialtyId) : null,
    session: q.get('session'),
    /** Панель исследователя: только в dev или по явному флагу. */
    research: q.get('research') === '1' || (typeof import.meta !== 'undefined' && import.meta.env?.DEV === true),
  }
}
