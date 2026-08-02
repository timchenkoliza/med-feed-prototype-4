import type { KeyboardEvent, MouseEvent } from 'react'
import { Icon, type IconName } from '../../components/common/Icon'
import { feedBTypeLabels, specialties } from '../config'
import { creditsLabel, dayMonth, durationLabel, eventDateTime } from '../format'
import type { FeedBItem, FeedBType } from '../types'
import { CardActions, cardActionStyles } from './CardActions'
import styles from './CardB.module.css'

export const typeIcon: Record<FeedBType, IconName> = {
  pharma_news: 'book',
  medtech: 'sliders',
  conference: 'calendar',
  webinar: 'play',
  nmo: 'award',
  video: 'play',
  podcast: 'mic',
  expert: 'user',
}

interface Props {
  item: FeedBItem
  saved: boolean
  useful: boolean
  registered: boolean
  onOpen: () => void
  onSave: () => void
  onUseful: () => void
  onAsk: () => void
  onOpenSource: () => void
  onHide: () => void
  onRegister: () => void
}

export function CardB({
  item,
  saved,
  useful,
  registered,
  onOpen,
  onSave,
  onUseful,
  onAsk,
  onOpenSource,
  onHide,
  onRegister,
}: Props) {
  const specialtyLabel = specialties.find(s => s.id === item.specialty)?.label ?? item.specialty

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
      {item.cover && (
        <div className={`${styles.cover} ${styles[`tone${item.cover.tone}`]}`}>
          <span className={styles.coverIcon}>
            <Icon name={typeIcon[item.type]} size={18} strokeWidth={1.8} />
          </span>
          <span className={styles.coverType}>{feedBTypeLabels[item.type]}</span>
          <span className={styles.coverCaption}>{item.cover.caption}</span>
        </div>
      )}

      <div className={styles.body}>
        <div className={styles.metaRow}>
          <span className={styles.sourceName}>{item.source}</span>
          <span>· {dayMonth(item.publishedAt)}</span>
        </div>

        <h3 className={styles.title}>{item.title}</h3>
        <p className={styles.summary}>{item.summary}</p>
        {item.author && <div className={styles.author}>{item.author}</div>}

        <div className={styles.chips}>
          <span className={styles.chip}>{specialtyLabel}</span>
          <span className={styles.chip}>{item.format}</span>
          {item.durationMinutes != null && (
            <span className={styles.chip}>
              <Icon name="clock" size={12} strokeWidth={1.8} />
              {durationLabel(item.durationMinutes)}
            </span>
          )}
        </div>

        {item.event && (
          <div className={styles.event}>
            <div className={styles.eventRow}>
              <Icon name="calendar" size={15} />
              {eventDateTime(item.event.startsAt)}
            </div>
            <div className={styles.eventRow}>
              <Icon name="pin" size={15} />
              {item.event.place}
            </div>
            <div className={styles.eventRow}>
              <Icon name="wallet" size={15} />
              {item.event.price}
            </div>
            {item.event.nmoCredits != null && (
              <div className={styles.eventRow}>
                <Icon name="award" size={15} />
                <span className={styles.nmo}>НМО · {creditsLabel(item.event.nmoCredits)}</span>
              </div>
            )}
          </div>
        )}

        <CardActions
          saved={saved}
          useful={useful}
          onSave={onSave}
          onUseful={onUseful}
          onAsk={onAsk}
          onOpenSource={onOpenSource}
          onHide={onHide}
          sourceLabel="Открыть"
          primaryAction={
            item.event ? (
              <button
                type="button"
                className={`${cardActionStyles.primary} ${registered ? cardActionStyles.primaryDone : ''}`}
                onClick={onRegister}
                disabled={registered}
              >
                {registered ? (
                  <>
                    <Icon name="check" size={16} strokeWidth={2} />
                    Вы зарегистрированы
                  </>
                ) : (
                  <>
                    <Icon name="calendar" size={16} strokeWidth={1.8} />
                    Зарегистрироваться
                  </>
                )}
              </button>
            ) : null
          }
        />
      </div>
    </article>
  )
}
