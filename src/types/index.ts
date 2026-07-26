export type ContentType =
  | 'clinical_guideline'
  | 'research'
  | 'meta_analysis'
  | 'case_report'
  | 'drug_update'
  | 'ministry_news'
  | 'international'
  | 'association'
  | 'conference'
  | 'webinar'
  | 'nmo_course'
  | 'expert_brief'

export type SourceStatus =
  | 'verified'
  | 'official'
  | 'peer_reviewed'
  | 'professional_association'

export interface Source {
  id: string
  name: string
  status: SourceStatus
  domain?: string
}

export interface FeedItem {
  id: string
  contentType: ContentType
  sourceId: string
  publishedAt: string // ISO date
  specialty: string
  tags: string[]
  title: string
  summary: string
  readingMinutes: number
  image?: string | null
  outOfSpecialty?: boolean
  author?: string
  organization?: string
  fullText?: string
  practiceImpact?: string
  primarySources?: Array<{ label: string; url: string }>
}

export interface BoardId {
  id: string
  label: string
}

export interface UserProfile {
  name: string
  specialty: string
  role: string
  interests: string[]
  avatarInitials: string
}

export interface FeedEvent {
  id: string
  title: string
  date: string
  location: string
  kind: 'conference' | 'webinar' | 'course'
}

export interface SavedState {
  savedItemIds: string[]
  boardAssignments: Record<string, string> // itemId -> boardId
  practiceUsefulIds: string[]
  hiddenItemIds: string[]
}

export type HideReason =
  | 'not_interested'
  | 'distrust_source'
  | 'already_seen'
  | 'hide_material'

export type FilterId =
  | 'for_you'
  | 'cardiology'
  | 'guidelines'
  | 'research'
  | 'drugs'
  | 'education'
  | 'conferences'
