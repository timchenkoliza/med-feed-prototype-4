import { useEffect, useRef, useState } from 'react'
import { Icon } from '../common/Icon'
import { hideReasons } from '../../config/productConfig'
import type { HideReason } from '../../types'
import styles from './CardOverflowMenu.module.css'

interface Props {
  onHide: (reason: HideReason) => void
}

export function CardOverflowMenu({ onHide }: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  return (
    <div className={styles.wrap} ref={rootRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen(v => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Меню действий с материалом"
      >
        <Icon name="more" size={18} />
      </button>
      {open && (
        <div className={styles.menu} role="menu">
          <div className={styles.menuTitle}>Не показывать подобное</div>
          {hideReasons.map(r => (
            <button
              key={r.id}
              type="button"
              role="menuitem"
              className={styles.item}
              onClick={() => {
                setOpen(false)
                onHide(r.id)
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
