import { useEffect } from 'react'
import type { FeedItem, Source } from '../../types'
import { Icon } from '../common/Icon'
import { SourceBadge } from '../feed/SourceBadge'
import { ContentTypeBadge } from '../feed/ContentTypeBadge'
import { SaveButton } from '../feed/SaveButton'
import { PracticeUsefulButton } from '../feed/PracticeUsefulButton'
import { formatDateFull, readingLabel } from '../../utils/format'
import styles from './IosDetailScreen.module.css'

interface Props {
  item: FeedItem
  source: Source
  saved: boolean
  practiceUseful: boolean
  onClose: () => void
  onSave: () => void
  onPractice: () => void
}

export function IosDetailScreen({ item, source, saved, practiceUseful, onClose, onSave, onPractice }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className={styles.screen} role="dialog" aria-modal="true" aria-label={item.title}>
      <header className={styles.head}>
        <button type="button" className={styles.back} onClick={onClose} aria-label="Назад">
          <Icon name="arrow-left" size={22} />
        </button>
        <ContentTypeBadge type={item.contentType} />
        <span className={styles.spacer} />
      </header>

      <div className={styles.scroll}>
        <h2 className={styles.title}>{item.title}</h2>
        <div className={styles.metaBlock}>
          <SourceBadge source={source} />
          <div className={styles.metaRow}>
            {item.author && <span>{item.author}</span>}
            {item.organization && <span>· {item.organization}</span>}
            <span>· {formatDateFull(item.publishedAt)}</span>
            <span>· {readingLabel(item.readingMinutes)}</span>
          </div>
        </div>

        <div className={styles.summary}>
          <div className={styles.label}>Краткий вывод</div>
          <p>{item.summary}</p>
        </div>

        {item.fullText && (
          <section>
            <div className={styles.label}>Основной текст</div>
            <p className={styles.body}>{item.fullText}</p>
          </section>
        )}

        {item.practiceImpact && (
          <section className={styles.impact}>
            <div className={styles.label}>Что это меняет в практике</div>
            <p className={styles.body}>{item.practiceImpact}</p>
          </section>
        )}

        {item.primarySources && item.primarySources.length > 0 && (
          <section>
            <div className={styles.label}>Первоисточники</div>
            <ul className={styles.sourceList}>
              {item.primarySources.map((s, i) => (
                <li key={i}>
                  <a href={s.url} className={styles.sourceLink} onClick={e => e.preventDefault()}>
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
        <PracticeUsefulButton active={practiceUseful} onClick={onPractice} compact />
      </div>
    </div>
  )
}
