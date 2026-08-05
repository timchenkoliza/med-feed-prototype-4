import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { breakpoint, feedRules, relevance, viewportWidth } from '../config/design-contract'
import { readQuery, ui } from './config'
import feedAData from './data/feedA.json'
import feedBData from './data/feedB.json'
import generatedFeedItems from '../data/generated/feedItems.json'
import type { FeedId, FeedItem, LayoutMode, Section, SpecialtyId, UserState, Viewport } from './types'
import { emptyUserState } from './types'

interface GeneratedFeedItem {
  id: string
  sourceId?: string
  title?: string
  summary?: string
  originalUrl?: string
  imageUrl?: string | null
  publishedAt?: string | null
  feedKind?: FeedId
  contentType?: string
  specialties?: SpecialtyId[]
  ingestionStatus?: string
}

/** Best-effort mapping from the ingestion pipeline's normalized shape to the UI's FeedItem. */
function fromGenerated(g: GeneratedFeedItem): FeedItem {
  return {
    id: g.id,
    feed: g.feedKind ?? 'B',
    type: 'pharma_medtech',
    primary: g.specialties && g.specialties.length > 0 ? g.specialties : [],
    general: !g.specialties || g.specialties.length === 0,
    title: g.title ?? '',
    source: { name: g.sourceId ?? 'Внешний источник', kind: 'media' },
    url: g.originalUrl ?? '#',
    date: g.publishedAt ?? new Date().toISOString(),
    readMin: 3,
    summary: g.summary ?? '',
    why: g.summary ?? '',
    media: g.imageUrl ? { kind: 'cover', src: g.imageUrl, alt: g.title ?? '' } : null,
    detail: { lead: g.summary ?? '', blocks: g.summary ? [{ t: 'p', v: g.summary }] : [] },
  }
}

/** Generated data (real ingestion) takes over only once it produces actual items; empty/absent → mock fixtures. */
const generated = (generatedFeedItems as GeneratedFeedItem[] | undefined) ?? []
const pool =
  generated.length > 0
    ? generated.map(fromGenerated)
    : [...(feedAData as FeedItem[]), ...(feedBData as FeedItem[])]

const TODAY = new Date('2026-08-02T00:00:00')

function detectViewport(): Viewport {
  if (typeof window === 'undefined') return 'desktop'
  const w = window.innerWidth
  if (w < breakpoint.tablet) return 'phone'
  if (w < breakpoint.compact) return 'tablet'
  return 'desktop'
}

/** Раскладка решается полезной шириной: min(окно, ограничение пресета). */
function resolveLayout(usable: number): LayoutMode {
  if (usable >= breakpoint.wide) return 'wide'
  if (usable >= breakpoint.compact) return 'compact'
  if (usable >= breakpoint.tablet) return 'tablet'
  return 'mobile'
}

/** Вес материала для конкретной специальности. */
function score(item: FeedItem, spec: SpecialtyId): number {
  let s: number = relevance.adjacent
  if (item.primary?.includes(spec)) s = relevance.primary
  else if (item.secondary?.includes(spec)) s = relevance.secondary
  else if (item.general) s = relevance.general
  const days = Math.max(0, (TODAY.getTime() - new Date(item.date).getTime()) / 86_400_000)
  return s + days * relevance.freshnessPerDay
}

/**
 * Редакционный ритм: hero, затем две преимущественно текстовые карточки,
 * затем одна с медиа. Две медиа-карточки подряд не ставим.
 */
function arrange(items: FeedItem[], feed: FeedId): FeedItem[] {
  const limit = feedRules[feed].maxMediaItems
  const withMedia: FeedItem[] = []
  const textOnly: FeedItem[] = []
  for (const it of items) {
    if (it.media && withMedia.length < limit) withMedia.push(it)
    else textOnly.push({ ...it, media: null })
  }

  /** Реклама не попадает на первый экран: минимум седьмая позиция. */
  const ads = items.filter(i => i.ad)
  const adIds = new Set(ads.map(i => i.id))
  const stripAds = (arr: FeedItem[]) => arr.filter(i => !adIds.has(i.id))

  const out: FeedItem[] = []
  const heroFromMedia = feedRules[feed].heroAllowsCover && withMedia.length > 0
  if (heroFromMedia) out.push(withMedia.shift()!)
  else if (textOnly.length) out.push(textOnly.shift()!)

  let sinceMedia = 0
  while (textOnly.length || withMedia.length) {
    const wantMedia = sinceMedia >= feedRules.rhythm.textRun && withMedia.length > 0
    if (wantMedia) {
      out.push(withMedia.shift()!)
      sinceMedia = 0
    } else if (textOnly.length) {
      out.push(textOnly.shift()!)
      sinceMedia++
    } else {
      out.push(withMedia.shift()!)
      sinceMedia = 0
    }
  }

  const clean = stripAds(out)
  for (const ad of ads) clean.splice(Math.min(6, clean.length), 0, ad)
  return clean
}

function matchesQuery(item: FeedItem, q: string): boolean {
  const s = q.trim().toLowerCase()
  if (!s) return true
  return (
    item.title.toLowerCase().includes(s) ||
    item.summary.toLowerCase().includes(s) ||
    item.source.name.toLowerCase().includes(s) ||
    (item.author?.toLowerCase().includes(s) ?? false)
  )
}

export const feedKindStorageKey = 'medya.feed.kind'

function readStoredFeed(): FeedId | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(feedKindStorageKey)
  return raw === 'A' || raw === 'B' ? raw : null
}

export function useAppState(initialFeed?: FeedId) {
  const q = useMemo(() => readQuery(), [])
  const [state, setState] = useLocalStorage<UserState>(ui.storageKey, emptyUserState)
  const [feed, setFeedState] = useState<FeedId>(q.feed ?? initialFeed ?? readStoredFeed() ?? 'A')
  const setFeed = useCallback((f: FeedId) => {
    setFeedState(f)
    try { window.localStorage.setItem(feedKindStorageKey, f) } catch { /* quota or private mode */ }
  }, [])
  const [specialty, setSpecialty] = useState<SpecialtyId>(q.specialty ?? 'therapist')
  const [type, setType] = useState<string>('all')
  const [section, setSection] = useState<Section>('feed')
  const [query, setQuery] = useState('')
  const [viewport, setViewport] = useState<Viewport>(detectViewport)
  const [windowWidth, setWindowWidth] = useState(() => (typeof window === 'undefined' ? 1440 : window.innerWidth))

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const usableWidth = Math.min(windowWidth, viewportWidth[viewport])
  const layoutMode = resolveLayout(usableWidth)

  const saved = useMemo(() => new Set(state.saved), [state.saved])
  const hidden = useMemo(() => new Set(state.hidden), [state.hidden])
  const useful = useMemo(() => new Set(state.useful), [state.useful])
  const registered = useMemo(() => new Set(state.registered), [state.registered])

  const visible = useMemo(() => pool.filter(i => !hidden.has(i.id)), [hidden])

  const ranked = useMemo(
    () =>
      visible
        .filter(i => i.feed === feed)
        .map(i => ({ i, s: score(i, specialty) }))
        .sort((a, b) => b.s - a.s)
        .map(x => x.i),
    [visible, feed, specialty],
  )

  const items = useMemo(() => {
    if (section === 'saved') return visible.filter(i => saved.has(i.id))
    if (section === 'events') return visible.filter(i => i.event).sort((a, b) => (a.event!.startsAt < b.event!.startsAt ? -1 : 1))

    const filtered = ranked
      .filter(i => (type === 'all' ? true : i.type === type))
      .filter(i => matchesQuery(i, query))
      .slice(0, feedRules.itemsPerFeed)
    return arrange(filtered, feed)
  }, [section, visible, saved, ranked, type, query, feed])

  const upcoming = useMemo(
    () =>
      visible
        .filter(i => i.event && !i.ad && (i.primary?.includes(specialty) || i.secondary?.includes(specialty) || i.general))
        .sort((a, b) => (a.event!.startsAt < b.event!.startsAt ? -1 : 1))
        .slice(0, 3),
    [visible, specialty],
  )

  const counts = useMemo(
    () => ({ saved: state.saved.length, feed: Math.min(feedRules.itemsPerFeed, ranked.length) }),
    [state.saved.length, ranked.length],
  )

  const toggle = useCallback(
    (key: 'saved' | 'useful', id: string) => {
      let on = false
      setState(prev => {
        const has = prev[key].includes(id)
        on = !has
        return { ...prev, [key]: has ? prev[key].filter(x => x !== id) : [...prev[key], id] }
      })
      return on
    },
    [setState],
  )

  const hide = useCallback((id: string) => setState(p => ({ ...p, hidden: [...new Set([...p.hidden, id])] })), [setState])
  const unhide = useCallback((id: string) => setState(p => ({ ...p, hidden: p.hidden.filter(x => x !== id) })), [setState])
  const mute = useCallback(
    (id: string) => setState(p => ({ ...p, hidden: [...new Set([...p.hidden, id])], muted: [...new Set([...p.muted, id])] })),
    [setState],
  )
  const report = useCallback((id: string) => setState(p => ({ ...p, reported: [...new Set([...p.reported, id])] })), [setState])
  const register = useCallback((id: string) => setState(p => ({ ...p, registered: [...new Set([...p.registered, id])] })), [setState])
  const reset = useCallback(() => {
    setState(emptyUserState)
    setType('all')
    setQuery('')
    setSection('feed')
  }, [setState])

  return {
    session: q.session,
    showResearchBar: q.research,
    feed, setFeed,
    specialty, setSpecialty,
    type, setType,
    section, setSection,
    query, setQuery,
    viewport, setViewport, layoutMode, usableWidth,
    items, upcoming, counts,
    isSaved: (id: string) => saved.has(id),
    isUseful: (id: string) => useful.has(id),
    isRegistered: (id: string) => registered.has(id),
    toggle, hide, unhide, mute, report, register, reset,
  }
}

export type AppController = ReturnType<typeof useAppState>
