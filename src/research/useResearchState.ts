import { useCallback, useMemo, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { feedMeta, readSession } from './config'
import feedAData from './data/feedA.json'
import feedBData from './data/feedB.json'
import type { AnyItem, FeedAItem, FeedBItem, FeedVariant, ResearchState } from './types'
import { emptyResearchState } from './types'

const feedAItems = feedAData as FeedAItem[]
const feedBItems = feedBData as FeedBItem[]

function itemsFor(variant: FeedVariant): AnyItem[] {
  return variant === 'A' ? feedAItems : feedBItems
}

function matchesFilter(item: AnyItem, filter: string, savedSet: Set<string>): boolean {
  if (filter === 'all') return true
  if (filter === 'saved') return savedSet.has(item.id)
  return (item as { type: string }).type === filter
}

export function useResearchState(variant: FeedVariant) {
  const meta = feedMeta[variant]
  const session = useMemo(() => readSession(variant), [variant])

  const [state, setState] = useLocalStorage<ResearchState>(meta.storageKey, emptyResearchState)
  const [filter, setFilter] = useState<string>('all')
  const [specialty, setSpecialty] = useState<string | null>(session.specialty)

  const savedSet = useMemo(() => new Set(state.savedIds), [state.savedIds])
  const hiddenSet = useMemo(() => new Set(state.hiddenIds), [state.hiddenIds])
  const usefulSet = useMemo(() => new Set(state.usefulIds), [state.usefulIds])
  const registeredSet = useMemo(() => new Set(state.registeredIds), [state.registeredIds])

  const all = useMemo(() => itemsFor(variant), [variant])

  const items = useMemo(
    () =>
      all
        .filter(it => !hiddenSet.has(it.id))
        .filter(it => (specialty ? it.specialty === specialty : true))
        .filter(it => matchesFilter(it, filter, savedSet)),
    [all, hiddenSet, specialty, filter, savedSet],
  )

  const isSaved = useCallback((id: string) => savedSet.has(id), [savedSet])
  const isUseful = useCallback((id: string) => usefulSet.has(id), [usefulSet])
  const isRegistered = useCallback((id: string) => registeredSet.has(id), [registeredSet])

  const toggleSave = useCallback(
    (id: string) => {
      let next = false
      setState(prev => {
        const has = prev.savedIds.includes(id)
        next = !has
        return { ...prev, savedIds: has ? prev.savedIds.filter(x => x !== id) : [...prev.savedIds, id] }
      })
      return next
    },
    [setState],
  )

  const toggleUseful = useCallback(
    (id: string) => {
      let next = false
      setState(prev => {
        const has = prev.usefulIds.includes(id)
        next = !has
        return { ...prev, usefulIds: has ? prev.usefulIds.filter(x => x !== id) : [...prev.usefulIds, id] }
      })
      return next
    },
    [setState],
  )

  const hide = useCallback(
    (id: string) => setState(prev => ({ ...prev, hiddenIds: [...new Set([...prev.hiddenIds, id])] })),
    [setState],
  )

  const unhide = useCallback(
    (id: string) => setState(prev => ({ ...prev, hiddenIds: prev.hiddenIds.filter(x => x !== id) })),
    [setState],
  )

  const register = useCallback(
    (id: string, atIso: string) =>
      setState(prev => ({
        ...prev,
        registeredIds: [...new Set([...prev.registeredIds, id])],
        registrationsAt: { ...prev.registrationsAt, [id]: atIso },
      })),
    [setState],
  )

  const reset = useCallback(() => {
    setState(emptyResearchState)
    setFilter('all')
    setSpecialty(session.specialty)
  }, [setState, session.specialty])

  return {
    session,
    items,
    allItems: all,
    filter,
    setFilter,
    specialty,
    setSpecialty,
    isSaved,
    isUseful,
    isRegistered,
    toggleSave,
    toggleUseful,
    hide,
    unhide,
    register,
    reset,
    counts: {
      saved: state.savedIds.length,
      hidden: state.hiddenIds.length,
      useful: state.usefulIds.length,
      registered: state.registeredIds.length,
    },
  }
}

export type ResearchController = ReturnType<typeof useResearchState>
