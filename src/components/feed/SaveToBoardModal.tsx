import { useEffect } from 'react'
import { boards } from '../../config/productConfig'
import { Icon } from '../common/Icon'
import styles from './SaveToBoardModal.module.css'

interface Props {
  open: boolean
  currentBoardId?: string
  onClose: () => void
  onSelect: (boardId: string) => void
}

export function SaveToBoardModal({ open, currentBoardId, onClose, onSelect }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true" aria-label="Выбор доски">
      <div className={styles.dialog} onClick={e => e.stopPropagation()}>
        <div className={styles.head}>
          <h3 className={styles.title}>Сохранить в доску</h3>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Закрыть">
            <Icon name="close" size={18} />
          </button>
        </div>
        <ul className={styles.list}>
          {boards.map(b => (
            <li key={b.id}>
              <button
                type="button"
                className={`${styles.item} ${b.id === currentBoardId ? styles.itemActive : ''}`}
                onClick={() => onSelect(b.id)}
              >
                <span>{b.label}</span>
                {b.id === currentBoardId && <Icon name="check" size={18} />}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
