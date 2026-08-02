import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Icon } from '../../components/common/Icon'
import styles from './Sheet.module.css'

interface Props {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  full?: boolean
}

export function Sheet({ open, title, onClose, children, footer, full }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div
        className={`${styles.sheet} ${full ? styles.full : ''}`}
        onClick={e => e.stopPropagation()}
      >
        <div className={styles.grabber} aria-hidden />
        <div className={styles.head}>
          <h2 className={styles.title}>{title}</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Закрыть">
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  )
}
