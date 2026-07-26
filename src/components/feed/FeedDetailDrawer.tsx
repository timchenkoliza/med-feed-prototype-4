import { useEffect } from 'react'
import type { FeedItem, Source } from '../../types'
import { Icon } from '../common/Icon'
import { SourceBadge } from './SourceBadge'
import { ContentTypeBadge } from './ContentTypeBadge'
import { SaveButton } from './SaveButton'
import { PracticeUsefulButton } from './PracticeUsefulButton'
import { formatDateFull, readingLabel } from '../../utils/format'
import styles from './FeedDetailDrawer.module.css'

interface Props {
  item: FeedItem | null
  source: Source | null
  saved: boolean
  practiceUseful: boolean
  onClose: () => void
  onSave: () => void
  onPractice: () => void
}

export function FeedDetailDrawer({
  item,
  source,
  saved,
  practiceUseful,
  onClose,
  onSave,
  onPractice,
}: Props) {
  useEffect(() => {
    if (!item) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [item, onClose])

  if (!item || !source) return null

  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true" aria-label={item.title}>
      <aside className={styles.drawer} onClick={e => e.stopPropagation()}>
        <div className={styles.head}>
          <ContentTypeBadge type={item.contentType} />
          <button type="button" className={styles.close} onClick={onClose} aria-label="Закрыть">
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className={styles.scroll}>
          <h2 className={styles.title}>{item.title}</h2>

          <div className={styles.metaGrid}>
            <SourceBadge source={source} />
            <div className={styles.metaLine}>
              {item.author && <span>{item.author}</span>}
              {item.organization && <span>{item.organization}</span>}
              <span>{formatDateFull(item.publishedAt)}</span>
              <span className={styles.readingChip}>
                <Icon name="clock" size={13} />
                {readingLabel(item.readingMinutes)}
              </span>
            </div>
          </div>

          <div className={styles.summaryBox}>
            <div className={styles.sectionLabel}>Краткий вывод</div>
            <p className={styles.summary}>{item.summary}</p>
          </div>

          {item.fullText && (
            <section>
              <div className={styles.sectionLabel}>Основной текст</div>
              <p className={styles.body}>{item.fullText}</p>
            </section>
          )}

          {item.practiceImpact && (
            <section className={styles.impact}>
              <div className={styles.sectionLabel}>Что это меняет в практике</div>
              <p className={styles.body}>{item.practiceImpact}</p>
            </section>
          )}

          {item.primarySources && item.primarySources.length > 0 && (
            <section>
              <div className={styles.sectionLabel}>Первоисточники</div>
              <ul className={styles.sourceList}>
                {item.primarySources.map((s, i) => (
                  <li key={i}>
                    <a
                      href={s.url}
                      className={styles.sourceLink}
                      onClick={e => e.preventDefault()}
                      title="Демонстрационная ссылка"
                    >
                      <span>{s.label}</span>
                      <Icon name="external" size={14} />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className={styles.footer}>
          <SaveButton saved={saved} onClick={onSave} />
          <PracticeUsefulButton active={practiceUseful} onClick={onPractice} />
        </div>
      </aside>
    </div>
  )
}
