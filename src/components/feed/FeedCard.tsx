import type { KeyboardEvent, MouseEvent } from 'react'
import type { FeedItem, HideReason, Source } from '../../types'
import { Icon } from '../common/Icon'
import { formatDate, readingLabel } from '../../utils/format'
import { ContentTypeBadge } from './ContentTypeBadge'
import { SourceBadge } from './SourceBadge'
import { SaveButton } from './SaveButton'
import { PracticeUsefulButton } from './PracticeUsefulButton'
import { CardOverflowMenu } from './CardOverflowMenu'
import styles from './FeedCard.module.css'

interface Props {
  item: FeedItem
  source: Source
  saved: boolean
  practiceUseful: boolean
  onOpen: () => void
  onSave: () => void
  onPractice: () => void
  onHide: (reason: HideReason) => void
  variant?: 'web' | 'ios'
}

export function FeedCard({
  item,
  source,
  saved,
  practiceUseful,
  onOpen,
  onSave,
  onPractice,
  onHide,
  variant = 'web',
}: Props) {
  const compact = variant === 'ios'

  const stop = (e: MouseEvent) => e.stopPropagation()
  const handleKey = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const target = e.target as HTMLElement
      if (target.closest('button, a')) return
      e.preventDefault()
      onOpen()
    }
  }
  const handleClick = (e: MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement
    if (target.closest('button, a')) return
    onOpen()
  }

  return (
    <article
      className={`${styles.card} ${compact ? styles.mobile : ''}`}
      onClick={handleClick}
      onKeyDown={handleKey}
      role="button"
      tabIndex={0}
      aria-label={`Открыть материал: ${item.title}`}
    >
      <header className={styles.meta}>
        <ContentTypeBadge type={item.contentType} />
        <span className={styles.specialty}>{item.specialty}</span>
        <span aria-hidden>·</span>
        <span className={styles.date}>{formatDate(item.publishedAt)}</span>
      </header>

      <h3 className={styles.title}>{item.title}</h3>
      <p className={styles.summary}>{item.summary}</p>

      <div className={styles.sourceRow}>
        <SourceBadge source={source} compact={compact} />
        <span className={styles.reading}>
          <Icon name="clock" size={14} strokeWidth={1.6} />
          {readingLabel(item.readingMinutes)}
        </span>
      </div>

      <footer className={styles.footer} onClick={stop}>
        <div className={styles.actions}>
          <SaveButton saved={saved} onClick={onSave} compact={compact} />
          <PracticeUsefulButton active={practiceUseful} onClick={onPractice} compact={compact} />
        </div>
        <CardOverflowMenu onHide={onHide} />
      </footer>
    </article>
  )
}
