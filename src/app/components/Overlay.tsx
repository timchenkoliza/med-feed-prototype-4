import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Icon } from '../../components/common/Icon'

interface Props {
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  sheet?: boolean
  headExtra?: ReactNode
}

export function Overlay({ title, onClose, children, footer, sheet, headExtra }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="scrim" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div className={`panel${sheet ? ' panel--sheet' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="panel__head">
          <button type="button" className="iconbtn iconbtn--plain" onClick={onClose} aria-label="Закрыть">
            <Icon name="close" size={18} />
          </button>
          <span className="panel__title">{title}</span>
          <span className="grow" />
          {headExtra}
        </div>
        <div className="panel__body">{children}</div>
        {footer && <div className="panel__foot">{footer}</div>}
      </div>
    </div>
  )
}
