import type { KeyboardEvent, MouseEvent } from 'react'
import { Icon } from '../../components/common/Icon'
import { evidenceLabels, feedATypeLabels, sourceStatusLabelsR } from '../config'
import { dayMonth } from '../format'
import type { FeedAItem } from '../types'
import { CardActions } from './CardActions'
import styles from './CardA.module.css'

interface Props {
  item: FeedAItem
  saved: boolean
  useful: boolean
  onOpen: () => void
  onSave: () => void
  onUseful: () => void
  onAsk: () => void
  onOpenSource: () => void
  onHide: () => void
}

export function CardA({ item, saved, useful, onOpen, onSave, onUseful, onAsk, onOpenSource, onHide }: Props) {
  const activate = (e: MouseEvent | KeyboardEvent) => {
    if ((e.target as HTMLElement).closest('button, a')) return
    onOpen()
  }

  return (
    <article
      className={styles.card}
      role="button"
      tabIndex={0}
      aria-label={`Открыть материал: ${item.title}`}
      onClick={activate}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          if ((e.target as HTMLElement).closest('button, a')) return
          e.preventDefault()
          onOpen()
        }
      }}
    >
      <div className={styles.badges}>
        <span className={`${styles.type} ${styles[`t_${item.type}`]}`}>{feedATypeLabels[item.type]}</span>
        <span className={`${styles.evidence} ${item.evidence === 'expert' || item.evidence === '3' ? styles.evidenceLow : ''}`}>
          <Icon name="award" size={12} strokeWidth={1.8} />
          {evidenceLabels[item.evidence]}
        </span>
      </div>

      <h3 className={styles.title}>{item.title}</h3>

      <div className={styles.sourceRow}>
        <span className={styles.verified} aria-hidden>
          <Icon name="verified" size={13} strokeWidth={1.7} />
        </span>
        <span className={styles.sourceName}>{item.source}</span>
        <span>· {sourceStatusLabelsR[item.sourceStatus]}</span>
        <span>· {dayMonth(item.publishedAt)}</span>
      </div>

      <div className={styles.evidenceNote}>{item.evidenceNote}</div>

      <p className={styles.summary}>{item.summary}</p>

      <div className={styles.block}>
        <div className={styles.blockLabel}>Что изменилось</div>
        <p className={`${styles.blockText} ${styles.clamp}`}>{item.whatChanged}</p>
      </div>

      <div className={`${styles.block} ${styles.blockImpact}`}>
        <div className={styles.blockLabel}>Что это меняет в практике</div>
        <p className={`${styles.blockText} ${styles.clamp}`}>{item.practiceImpact}</p>
      </div>

      <CardActions
        saved={saved}
        useful={useful}
        onSave={onSave}
        onUseful={onUseful}
        onAsk={onAsk}
        onOpenSource={onOpenSource}
        onHide={onHide}
      />
    </article>
  )
}
