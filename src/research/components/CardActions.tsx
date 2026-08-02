import type { ReactNode } from 'react'
import { Icon } from '../../components/common/Icon'
import styles from './CardActions.module.css'

interface Props {
  saved: boolean
  useful: boolean
  onSave: () => void
  onUseful: () => void
  onAsk: () => void
  onOpenSource: () => void
  onHide: () => void
  sourceLabel?: string
  /** Например, кнопка «Зарегистрироваться» для событий. */
  primaryAction?: ReactNode
}

export function CardActions({
  saved,
  useful,
  onSave,
  onUseful,
  onAsk,
  onOpenSource,
  onHide,
  sourceLabel = 'Открыть источник',
  primaryAction,
}: Props) {
  return (
    <div className={styles.wrap} onClick={e => e.stopPropagation()}>
      {primaryAction}

      <div className={styles.row}>
        <button
          type="button"
          className={`${styles.btn} ${saved ? styles.active : ''}`}
          aria-pressed={saved}
          onClick={onSave}
        >
          <Icon name={saved ? 'bookmark-filled' : 'bookmark'} size={16} strokeWidth={1.6} />
          {saved ? 'Сохранено' : 'Сохранить'}
        </button>

        <button
          type="button"
          className={`${styles.btn} ${useful ? styles.active : ''}`}
          aria-pressed={useful}
          onClick={onUseful}
        >
          <Icon name={useful ? 'thumbs-up-filled' : 'thumbs-up'} size={16} strokeWidth={1.6} />
          Полезно
        </button>

        <button type="button" className={styles.btn} onClick={onAsk}>
          <Icon name="sparkle" size={16} strokeWidth={1.6} />
          Спросить AI
        </button>
      </div>

      <div className={styles.secondary}>
        <button type="button" className={styles.sourceLink} onClick={onOpenSource}>
          {sourceLabel}
          <Icon name="external" size={14} />
        </button>
        <button
          type="button"
          className={`${styles.btn} ${styles.icon}`}
          aria-label="Скрыть материал"
          title="Скрыть"
          onClick={onHide}
        >
          <Icon name="eye-off" size={16} />
        </button>
      </div>
    </div>
  )
}

export { styles as cardActionStyles }
