import { Icon } from '../common/Icon'
import styles from './IconAction.module.css'

interface Props {
  active: boolean
  onClick: () => void
  compact?: boolean
}

export function PracticeUsefulButton({ active, onClick, compact }: Props) {
  return (
    <button
      type="button"
      className={`${styles.btn} ${active ? styles.active : ''}`}
      onClick={onClick}
      aria-pressed={active}
      aria-label={active ? 'Отметка «полезно для практики» проставлена' : 'Отметить как полезно для практики'}
    >
      <Icon name={active ? 'thumbs-up-filled' : 'thumbs-up'} size={18} strokeWidth={1.6} />
      {!compact && <span>Полезно для практики</span>}
    </button>
  )
}
