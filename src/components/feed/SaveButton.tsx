import { Icon } from '../common/Icon'
import styles from './IconAction.module.css'

interface Props {
  saved: boolean
  onClick: () => void
  compact?: boolean
}

export function SaveButton({ saved, onClick, compact }: Props) {
  return (
    <button
      type="button"
      className={`${styles.btn} ${saved ? styles.active : ''}`}
      onClick={onClick}
      aria-pressed={saved}
      aria-label={saved ? 'Убрать из сохранённого' : 'Сохранить'}
    >
      <Icon name={saved ? 'bookmark-filled' : 'bookmark'} size={18} strokeWidth={1.6} />
      {!compact && <span>{saved ? 'Сохранено' : 'Сохранить'}</span>}
    </button>
  )
}
