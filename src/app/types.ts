export type FeedId = 'A' | 'B'

export type SpecialtyId =
  | 'therapist' | 'endocrinologist' | 'dentist'
  | 'obgyn' | 'oncologist' | 'dermatovenerologist'

export type TypeA =
  | 'guideline_update' | 'research' | 'meta_analysis'
  | 'safety_alert' | 'case_review' | 'evidence_review'

export type TypeB =
  | 'conference' | 'webinar' | 'pharma_medtech'
  | 'interview' | 'video' | 'podcast'

export type ItemType = TypeA | TypeB

export type SourceKind = 'official' | 'association' | 'journal' | 'clinic' | 'media' | 'industry'

/** Обложка — только реальная фотография из public/media. Генеративных заглушек нет. */
export interface Media {
  kind: 'cover' | 'video'
  src: string
  alt: string
  credit?: string
  duration?: string
}

export interface EventInfo {
  startsAt: string
  endsAt?: string
  place: string
  online: boolean
  price: string
  nmo?: number
  deadline?: string
  organizer?: string
  program?: string[]
  speakers?: Array<{ name: string; role: string }>
  audience?: string
}

export interface VideoInfo {
  transcript: string
  timecodes: Array<{ at: string; label: string }>
}

export type Block =
  | { t: 'p'; v: string }
  | { t: 'h'; v: string }
  | { t: 'ul'; v: string[] }
  | { t: 'quote'; v: string; by?: string }
  | { t: 'table'; head: string[]; rows: string[][] }

export interface FeedItem {
  id: string
  feed: FeedId
  type: ItemType
  /** Профиль, для которого материал написан. */
  primary: SpecialtyId[]
  /** Профили, которым материал полезен как смежный. */
  secondary?: SpecialtyId[]
  /** Материал общего профессионального интереса. */
  general?: boolean
  title: string
  source: { name: string; kind: SourceKind }
  url: string
  date: string
  readMin: number
  evidence?: string
  evidenceNote?: string
  limitations?: string
  primarySources?: Array<{ label: string; url: string }>
  summary: string
  why: string
  media?: Media | null
  event?: EventInfo
  video?: VideoInfo
  author?: string
  ad?: { advertiser: string; disclaimer: string }
  detail: { lead: string; blocks: Block[] }
}

export interface UserState {
  saved: string[]
  hidden: string[]
  useful: string[]
  registered: string[]
  muted: string[]
  reported: string[]
}

export const emptyUserState: UserState = {
  saved: [], hidden: [], useful: [], registered: [], muted: [], reported: [],
}

export type Viewport = 'phone' | 'tablet' | 'desktop'
/** Раскладка вычисляется от полезной ширины приложения. */
export type LayoutMode = 'mobile' | 'tablet' | 'compact' | 'wide'
export type Section = 'feed' | 'saved' | 'events' | 'profile'
