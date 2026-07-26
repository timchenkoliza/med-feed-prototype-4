import { useEffect, useRef } from 'react'
import type { FeedItem, Source } from '../../types'
import { Icon } from '../common/Icon'
import { EmptyState } from '../common/EmptyState'
import { formatDate } from '../../utils/format'
import styles from './SearchOverlay.module.css'

interface Props {
  open: boolean
  onClose: () => void
  query: string
  onQueryChange: (v: string) => void
  results: FeedItem[]
  sourcesById: Record<string, Source>
  onOpenItem: (id: string) => void
}

export function SearchOverlay({
  open,
  onClose,
  query,
  onQueryChange,
  results,
  sourcesById,
  onOpenItem,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true" aria-label="Поиск по ленте">
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <div className={styles.searchRow}>
          <Icon name="search" size={18} />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={e => onQueryChange(e.target.value)}
            placeholder="Поиск по заголовку, источнику, теме"
            className={styles.input}
            aria-label="Строка поиска"
          />
          <button type="button" className={styles.esc} onClick={onClose}>Esc</button>
        </div>

        <div className={styles.results}>
          {query.trim() === '' ? (
            <EmptyState
              title="Начните вводить запрос"
              description="Ищем по заголовку, источнику, автору, специальности и тегам"
            />
          ) : results.length === 0 ? (
            <EmptyState
              title="Ничего не нашли"
              description="Попробуйте изменить формулировку или проверить фильтры"
            />
          ) : (
            <ul className={styles.list}>
              {results.map(r => (
                <li key={r.id}>
                  <button type="button" className={styles.item} onClick={() => onOpenItem(r.id)}>
                    <span className={styles.itemTitle}>{r.title}</span>
                    <span className={styles.itemMeta}>
                      {sourcesById[r.sourceId]?.name} · {formatDate(r.publishedAt)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
