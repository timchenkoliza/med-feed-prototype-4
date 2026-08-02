import type { ReactNode } from 'react'
import { useState } from 'react'
import { Icon } from '../../components/common/Icon'
import { researchText, specialties } from '../config'
import { Sheet } from './Sheet'
import styles from './Shell.module.css'

interface FilterDef {
  id: string
  label: string
}

interface Props {
  title: string
  subtitle: string
  filters: FilterDef[]
  activeFilter: string
  onFilter: (id: string) => void
  savedCount: number
  specialty: string | null
  onSpecialty: (id: string | null) => void
  sessionId: string | null
  onReset: () => void
  children: ReactNode
  /** Шторы и тосты — прямые дети «устройства», поверх скролла. */
  overlays?: ReactNode
}

export function Shell({
  title,
  subtitle,
  filters,
  activeFilter,
  onFilter,
  savedCount,
  specialty,
  onSpecialty,
  sessionId,
  onReset,
  children,
  overlays,
}: Props) {
  const [specOpen, setSpecOpen] = useState(false)
  const specLabel = specialties.find(s => s.id === specialty)?.label ?? 'Все специальности'

  return (
    <div className={styles.viewport}>
      <div className={styles.device}>
        <header className={styles.header}>
          <div className={styles.headTop}>
            <div>
              <h1 className={styles.title}>{title}</h1>
              <p className={styles.subtitle}>{subtitle}</p>
            </div>
            <div className={styles.headActions}>
              <button
                type="button"
                className={styles.iconBtn}
                aria-label="Сбросить состояние сессии"
                title="Сбросить состояние"
                onClick={onReset}
              >
                <Icon name="refresh" size={17} />
              </button>
            </div>
          </div>

          <div className={styles.specialtyRow}>
            <span>Специальность:</span>
            <button type="button" className={styles.specialtyBtn} onClick={() => setSpecOpen(true)}>
              {specLabel}
              <Icon name="chevron-down" size={13} />
            </button>
          </div>
        </header>

        <div className={styles.filters}>
          <div className={styles.filterScroller} role="tablist" aria-label="Фильтры ленты">
            {filters.map(f => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={activeFilter === f.id}
                className={`${styles.chip} ${activeFilter === f.id ? styles.chipActive : ''}`}
                onClick={() => onFilter(f.id)}
              >
                {f.label}
                {f.id === 'saved' && savedCount > 0 && <span className={styles.chipCount}>{savedCount}</span>}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.scroll}>
          {children}

          <div className={styles.resetRow}>
            <button type="button" className={styles.resetBtn} onClick={onReset}>
              <Icon name="refresh" size={14} />
              Сбросить состояние сессии
            </button>
          </div>
          {sessionId && <div className={styles.sessionNote}>Сессия: {sessionId}</div>}
        </div>

        {overlays}

        <Sheet open={specOpen} title="Специальность" onClose={() => setSpecOpen(false)}>
          <SpecialtyList
            value={specialty}
            onPick={id => {
              onSpecialty(id)
              setSpecOpen(false)
            }}
          />
        </Sheet>
      </div>
    </div>
  )
}

function SpecialtyList({ value, onPick }: { value: string | null; onPick: (id: string | null) => void }) {
  const options: Array<{ id: string | null; label: string }> = [
    { id: null, label: 'Все специальности' },
    ...specialties,
  ]
  return (
    <div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 4 }}>
        {options.map(o => (
          <li key={o.id ?? 'all'}>
            <button
              type="button"
              onClick={() => onPick(o.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                background: o.id === value ? 'var(--color-surface-1)' : '#fff',
                fontSize: 'var(--fs-base)',
                textAlign: 'left',
              }}
            >
              <span>{o.label}</span>
              {o.id === value && <Icon name="check" size={17} />}
            </button>
          </li>
        ))}
      </ul>
      <p style={{ margin: '12px 2px 0', fontSize: 'var(--fs-xs)', color: 'var(--color-text-tertiary)' }}>
        {researchText.privacyNote}
      </p>
    </div>
  )
}
