import events from '../../data/events.json'
import sources from '../../data/sources.json'
import type { FeedEvent, Source } from '../../types'
import { Icon } from '../common/Icon'
import { sourceStatusLabels } from '../../config/productConfig'
import { formatDateFull } from '../../utils/format'
import styles from './RightRail.module.css'

interface Props {
  savedTopics: string[]
  onShakeFeed: () => void
}

const EVENTS = events as FeedEvent[]
const SOURCES = sources as Source[]

export function RightRail({ savedTopics, onShakeFeed }: Props) {
  return (
    <aside className={styles.rail} aria-label="Дополнительная колонка">
      <section className={styles.widget}>
        <header className={styles.widgetHead}>
          <h4 className={styles.widgetTitle}>События для вас</h4>
        </header>
        <ul className={styles.list}>
          {EVENTS.map(e => (
            <li key={e.id} className={styles.event}>
              <div className={styles.eventDate}>{formatDateFull(e.date)}</div>
              <div className={styles.eventTitle}>{e.title}</div>
              <div className={styles.eventMeta}>{e.location}</div>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.widget}>
        <header className={styles.widgetHead}>
          <h4 className={styles.widgetTitle}>Ваши сохранённые темы</h4>
        </header>
        {savedTopics.length === 0 ? (
          <p className={styles.emptyHint}>Пока пусто. Сохранённые материалы появятся здесь.</p>
        ) : (
          <ul className={styles.topicList}>
            {savedTopics.slice(0, 5).map((t, i) => (
              <li key={i} className={styles.topic}>{t}</li>
            ))}
          </ul>
        )}
      </section>

      <section className={styles.widget}>
        <header className={styles.widgetHead}>
          <h4 className={styles.widgetTitle}>Источники недели</h4>
        </header>
        <ul className={styles.sourceList}>
          {SOURCES.slice(0, 5).map(s => (
            <li key={s.id} className={styles.sourceRow}>
              <Icon name="verified" size={14} strokeWidth={1.6} style={{ color: 'var(--color-verified)' }} />
              <div>
                <div className={styles.sourceName}>{s.name}</div>
                <div className={styles.sourceStatus}>{sourceStatusLabels[s.status]}</div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <button type="button" className={styles.shake} onClick={onShakeFeed}>
        <Icon name="compass" size={16} />
        <span>Посмотреть за пределами специальности</span>
      </button>
    </aside>
  )
}
