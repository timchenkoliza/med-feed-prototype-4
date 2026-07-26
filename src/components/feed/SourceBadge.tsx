import { Icon } from '../common/Icon'
import { sourceStatusLabels } from '../../config/productConfig'
import type { Source } from '../../types'
import styles from './SourceBadge.module.css'

interface Props {
  source: Source
  compact?: boolean
}

export function SourceBadge({ source, compact }: Props) {
  return (
    <span className={`${styles.badge} ${compact ? styles.compact : ''}`}>
      <Icon name="verified" size={14} strokeWidth={1.6} style={{ color: 'var(--color-verified)' }} />
      <span className={styles.name}>{source.name}</span>
      {!compact && <span className={styles.status}>· {sourceStatusLabels[source.status]}</span>}
    </span>
  )
}
