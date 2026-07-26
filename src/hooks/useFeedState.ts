import { useCallback, useMemo, useState } from 'react'
import feedData from '../data/feed.json'
import sourcesData from '../data/sources.json'
import type { FeedItem, FilterId, HideReason, SavedState, Source } from '../types'
import { useLocalStorage } from './useLocalStorage'

const STORAGE_KEY = 'yandexMedFeed.saved.v1'

const initialSaved: SavedState = {
  savedItemIds: [],
  boardAssignments: {},
  practiceUsefulIds: [],
  hiddenItemIds: [],
}

const feedItems = feedData as FeedItem[]
const sources = sourcesData as Source[]
const sourcesById: Record<string, Source> = Object.fromEntries(sources.map(s => [s.id, s]))

function matchesFilter(item: FeedItem, filter: FilterId): boolean {
  if (filter === 'for_you') return !item.outOfSpecialty
  if (filter === 'cardiology') return item.specialty === 'Кардиология' && !item.outOfSpecialty
  if (filter === 'guidelines') return item.contentType === 'clinical_guideline'
  if (filter === 'research') return item.contentType === 'research' || item.contentType === 'meta_analysis'
  if (filter === 'drugs') return item.contentType === 'drug_update'
  if (filter === 'education') return item.contentType === 'nmo_course' || item.contentType === 'webinar'
  if (filter === 'conferences') return item.contentType === 'conference'
  return true
}

function matchesQuery(item: FeedItem, q: string): boolean {
  const s = q.trim().toLowerCase()
  if (!s) return true
  const src = sourcesById[item.sourceId]?.name.toLowerCase() ?? ''
  return (
    item.title.toLowerCase().includes(s) ||
    item.summary.toLowerCase().includes(s) ||
    (item.author?.toLowerCase().includes(s) ?? false) ||
    src.includes(s) ||
    item.specialty.toLowerCase().includes(s) ||
    item.tags.some(t => t.toLowerCase().includes(s))
  )
}

export function useFeedState() {
  const [saved, setSaved] = useLocalStorage<SavedState>(STORAGE_KEY, initialSaved)
  const [activeFilter, setActiveFilter] = useState<FilterId>('for_you')
  const [query, setQuery] = useState('')
  const [outOfSpecialtyMode, setOutOfSpecialtyMode] = useState(false)
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'error'>('idle')

  const savedSet = useMemo(() => new Set(saved.savedItemIds), [saved.savedItemIds])
  const practiceSet = useMemo(() => new Set(saved.practiceUsefulIds), [saved.practiceUsefulIds])
  const hiddenSet = useMemo(() => new Set(saved.hiddenItemIds), [saved.hiddenItemIds])

  const mainItems = useMemo(() => {
    return feedItems
      .filter(it => !hiddenSet.has(it.id))
      .filter(it => !it.outOfSpecialty)
      .filter(it => matchesFilter(it, activeFilter))
      .filter(it => matchesQuery(it, query))
  }, [activeFilter, query, hiddenSet])

  const outOfSpecialtyItems = useMemo(() => {
    return feedItems.filter(it => it.outOfSpecialty && !hiddenSet.has(it.id))
  }, [hiddenSet])

  const savedItems = useMemo(
    () => feedItems.filter(it => savedSet.has(it.id) && !hiddenSet.has(it.id)),
    [savedSet, hiddenSet],
  )

  const isSaved = useCallback((id: string) => savedSet.has(id), [savedSet])
  const isPracticeUseful = useCallback((id: string) => practiceSet.has(id), [practiceSet])

  const toggleSave = useCallback(
    (id: string, boardId?: string) => {
      let wasSaved = false
      setSaved(prev => {
        wasSaved = prev.savedItemIds.includes(id)
        const savedItemIds = wasSaved
          ? prev.savedItemIds.filter(x => x !== id)
          : [...prev.savedItemIds, id]
        const boardAssignments = { ...prev.boardAssignments }
        if (wasSaved) delete boardAssignments[id]
        else if (boardId) boardAssignments[id] = boardId
        return { ...prev, savedItemIds, boardAssignments }
      })
      return !wasSaved
    },
    [setSaved],
  )

  const setBoardForItem = useCallback(
    (id: string, boardId: string) => {
      setSaved(prev => {
        const nextIds = prev.savedItemIds.includes(id) ? prev.savedItemIds : [...prev.savedItemIds, id]
        return { ...prev, savedItemIds: nextIds, boardAssignments: { ...prev.boardAssignments, [id]: boardId } }
      })
    },
    [setSaved],
  )

  const togglePracticeUseful = useCallback(
    (id: string) => {
      let wasOn = false
      setSaved(prev => {
        wasOn = prev.practiceUsefulIds.includes(id)
        const next = wasOn ? prev.practiceUsefulIds.filter(x => x !== id) : [...prev.practiceUsefulIds, id]
        return { ...prev, practiceUsefulIds: next }
      })
      return !wasOn
    },
    [setSaved],
  )

  const hideItem = useCallback(
    (id: string, _reason: HideReason) => {
      setSaved(prev => ({ ...prev, hiddenItemIds: [...new Set([...prev.hiddenItemIds, id])] }))
    },
    [setSaved],
  )

  const unhideItem = useCallback(
    (id: string) => {
      setSaved(prev => ({ ...prev, hiddenItemIds: prev.hiddenItemIds.filter(x => x !== id) }))
    },
    [setSaved],
  )

  const refresh = useCallback(() => {
    setLoadState('loading')
    return new Promise<{ added: number }>(resolve => {
      window.setTimeout(() => {
        setLoadState('idle')
        resolve({ added: 3 })
      }, 900)
    })
  }, [])

  const simulateError = useCallback(() => setLoadState('error'), [])
  const clearError = useCallback(() => setLoadState('idle'), [])

  return {
    // data
    sources,
    sourcesById,
    mainItems,
    outOfSpecialtyItems,
    savedItems,

    // filters/search/modes
    activeFilter,
    setActiveFilter,
    query,
    setQuery,
    outOfSpecialtyMode,
    setOutOfSpecialtyMode,

    // states
    loadState,
    refresh,
    simulateError,
    clearError,

    // saved+reactions
    savedRaw: saved,
    isSaved,
    isPracticeUseful,
    toggleSave,
    setBoardForItem,
    togglePracticeUseful,
    hideItem,
    unhideItem,
  }
}

export type FeedController = ReturnType<typeof useFeedState>
