import { filters } from '../../config/productConfig'
import type { FilterId } from '../../types'
import styles from './FeedFilters.module.css'

interface Props {
  active: FilterId
  onChange: (id: FilterId) => void
  variant?: 'web' | 'ios'
}

export function FeedFilters({ active, onChange, variant = 'web' }: Props) {
  return (
    <div className={`${styles.wrap} ${variant === 'ios' ? styles.ios : ''}`} role="tablist" aria-label="Тематические фильтры ленты">
      <div className={styles.scroller}>
        {filters.map(f => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={active === f.id}
            className={`${styles.chip} ${active === f.id ? styles.active : ''}`}
            onClick={() => onChange(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  )
}
