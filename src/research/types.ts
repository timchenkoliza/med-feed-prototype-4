/** Типы контента для двух исследовательских лент (/feed-a, /feed-b). */

export type FeedVariant = 'A' | 'B'

export type SourceStatusR = 'peer_reviewed' | 'official' | 'association' | 'verified'

/* ---------- Feed A: строгая научно-клиническая лента ---------- */

export type FeedAType =
  | 'research'
  | 'meta_analysis'
  | 'clinical_guideline'
  | 'standard_change'
  | 'drug_safety'

export type EvidenceLevel = '1A' | '1B' | '2A' | '2B' | '3' | 'expert'

export interface FeedAItem {
  id: string
  type: FeedAType
  title: string
  source: string
  sourceStatus: SourceStatusR
  sourceUrl: string
  publishedAt: string
  specialty: string
  evidence: EvidenceLevel
  /** Пояснение к уровню: дизайн исследования, выборка. */
  evidenceNote: string
  summary: string
  whatChanged: string
  practiceImpact: string
  readingMinutes: number
  tags: string[]
  fullText?: string
}

/* ---------- Feed B: широкая профессиональная лента ---------- */

export type FeedBType =
  | 'pharma_news'
  | 'medtech'
  | 'conference'
  | 'webinar'
  | 'nmo'
  | 'video'
  | 'podcast'
  | 'expert'

export interface FeedBEvent {
  startsAt: string
  place: string
  online: boolean
  price: string
  nmoCredits?: number
}

export interface FeedBItem {
  id: string
  type: FeedBType
  title: string
  source: string
  sourceStatus: SourceStatusR
  sourceUrl: string
  publishedAt: string
  specialty: string
  summary: string
  /** «Статья», «Видео», «Подкаст», «Онлайн-вебинар», «Курс НМО»… */
  format: string
  durationMinutes?: number
  /** Обложка рисуется локально (без сети): tone задаёт градиент. */
  cover?: { tone: 1 | 2 | 3 | 4 | 5 | 6; caption: string } | null
  author?: string
  event?: FeedBEvent
  tags: string[]
  fullText?: string
}

export type AnyItem = FeedAItem | FeedBItem

export function isFeedB(item: AnyItem): item is FeedBItem {
  return (item as FeedBItem).format !== undefined
}

/* ---------- Локальное состояние исследования ---------- */

export interface ResearchState {
  savedIds: string[]
  hiddenIds: string[]
  usefulIds: string[]
  registeredIds: string[]
  /** Регистрации: id материала → отметка времени (ISO). Без ПДн. */
  registrationsAt: Record<string, string>
}

export const emptyResearchState: ResearchState = {
  savedIds: [],
  hiddenIds: [],
  usefulIds: [],
  registeredIds: [],
  registrationsAt: {},
}
