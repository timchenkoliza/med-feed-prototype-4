import type { ReactNode } from 'react'
import { Icon } from '../../components/common/Icon'
import {
  evidenceLabels,
  feedATypeLabels,
  feedBTypeLabels,
  sourceStatusLabelsR,
  specialties,
} from '../config'
import { creditsLabel, dayMonthYear, durationLabel, eventDateTime, readingLabel } from '../format'
import type { AnyItem, FeedAItem, FeedBItem } from '../types'
import { isFeedB } from '../types'
import { CardActions, cardActionStyles } from './CardActions'
import cardBStyles from './CardB.module.css'
import { typeIcon } from './CardB'
import { Sheet } from './Sheet'
import styles from './Detail.module.css'
import cardAStyles from './CardA.module.css'

interface Props {
  item: AnyItem | null
  saved: boolean
  useful: boolean
  registered: boolean
  onClose: () => void
  onSave: () => void
  onUseful: () => void
  onAsk: () => void
  onOpenSource: () => void
  onHide: () => void
  onRegister: () => void
}

export function DetailSheet(props: Props) {
  const { item, onClose } = props
  if (!item) return null

  return (
    <Sheet open title="Материал" onClose={onClose} full>
      {isFeedB(item) ? <BodyB {...props} item={item} /> : <BodyA {...props} item={item as FeedAItem} />}
    </Sheet>
  )
}

function Actions(props: Props & { sourceLabel?: string; primary?: ReactNode }) {
  return (
    <CardActions
      saved={props.saved}
      useful={props.useful}
      onSave={props.onSave}
      onUseful={props.onUseful}
      onAsk={props.onAsk}
      onOpenSource={props.onOpenSource}
      onHide={() => {
        props.onHide()
        props.onClose()
      }}
      sourceLabel={props.sourceLabel}
      primaryAction={props.primary}
    />
  )
}

function BodyA(props: Props & { item: FeedAItem }) {
  const { item } = props
  return (
    <div>
      <div className={styles.badges}>
        <span className={`${cardAStyles.type} ${cardAStyles[`t_${item.type}`]}`}>
          {feedATypeLabels[item.type]}
        </span>
        <span className={cardAStyles.evidence}>
          <Icon name="award" size={12} strokeWidth={1.8} />
          {evidenceLabels[item.evidence]}
        </span>
      </div>

      <h3 className={styles.title}>{item.title}</h3>

      <div className={styles.meta}>
        <span className={styles.verified} aria-hidden>
          <Icon name="verified" size={13} strokeWidth={1.7} />
        </span>
        <span className={styles.sourceName}>{item.source}</span>
        <span>· {sourceStatusLabelsR[item.sourceStatus]}</span>
        <span>· {dayMonthYear(item.publishedAt)}</span>
        <span>· {readingLabel(item.readingMinutes)}</span>
      </div>

      <div className={styles.section}>
        <div className={styles.label}>Уровень доказательности</div>
        <p className={`${styles.text} ${styles.muted}`}>
          {evidenceLabels[item.evidence]} — {item.evidenceNote}
        </p>
      </div>

      <div className={styles.section}>
        <div className={styles.label}>Кратко</div>
        <p className={styles.text}>{item.summary}</p>
      </div>

      <div className={styles.box}>
        <div className={styles.label}>Что изменилось</div>
        <p className={styles.text}>{item.whatChanged}</p>
      </div>

      <div className={`${styles.box} ${styles.boxImpact}`}>
        <div className={styles.label}>Что это меняет в практике</div>
        <p className={styles.text}>{item.practiceImpact}</p>
      </div>

      {item.fullText && (
        <div className={styles.section}>
          <div className={styles.label}>Подробнее</div>
          <p className={`${styles.text} ${styles.muted}`}>{item.fullText}</p>
        </div>
      )}

      <div className={styles.chips}>
        {item.tags.map(t => (
          <span key={t} className={styles.chip}>
            {t}
          </span>
        ))}
      </div>

      <Actions {...props} />
    </div>
  )
}

function BodyB(props: Props & { item: FeedBItem }) {
  const { item, registered, onRegister } = props
  const specialtyLabel = specialties.find(s => s.id === item.specialty)?.label ?? item.specialty

  return (
    <div>
      {item.cover && (
        <div className={`${cardBStyles.cover} ${cardBStyles[`tone${item.cover.tone}`]} ${styles.coverRadius}`}>
          <span className={cardBStyles.coverIcon}>
            <Icon name={typeIcon[item.type]} size={18} strokeWidth={1.8} />
          </span>
          <span className={cardBStyles.coverType}>{feedBTypeLabels[item.type]}</span>
          <span className={styles.coverCaption}>{item.cover.caption}</span>
        </div>
      )}

      <h3 className={styles.title}>{item.title}</h3>

      <div className={styles.meta}>
        <span className={styles.sourceName}>{item.source}</span>
        <span>· {sourceStatusLabelsR[item.sourceStatus]}</span>
        <span>· {dayMonthYear(item.publishedAt)}</span>
      </div>

      <div className={styles.section}>
        <p className={styles.text}>{item.summary}</p>
      </div>

      {item.fullText && <p className={`${styles.text} ${styles.muted}`}>{item.fullText}</p>}
      {item.author && <p className={`${styles.text} ${styles.muted}`}>{item.author}</p>}

      <div className={styles.chips}>
        <span className={styles.chip}>{specialtyLabel}</span>
        <span className={styles.chip}>{item.format}</span>
        {item.durationMinutes != null && (
          <span className={styles.chip}>
            <Icon name="clock" size={13} strokeWidth={1.8} />
            {durationLabel(item.durationMinutes)}
          </span>
        )}
        {item.tags.map(t => (
          <span key={t} className={styles.chip}>
            {t}
          </span>
        ))}
      </div>

      {item.event && (
        <div className={styles.event}>
          <div className={styles.eventRow}>
            <Icon name="calendar" size={16} />
            {eventDateTime(item.event.startsAt)}
          </div>
          <div className={styles.eventRow}>
            <Icon name="pin" size={16} />
            {item.event.place}
          </div>
          <div className={styles.eventRow}>
            <Icon name="wallet" size={16} />
            {item.event.price}
          </div>
          {item.event.nmoCredits != null && (
            <div className={styles.eventRow}>
              <Icon name="award" size={16} />
              <span className={styles.nmo}>НМО · {creditsLabel(item.event.nmoCredits)}</span>
            </div>
          )}
        </div>
      )}

      <Actions
        {...props}
        sourceLabel="Открыть"
        primary={
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
  )
}
