import type { MouseEvent as ReactMouseEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { Icon } from '../../components/common/Icon'

export interface MenuActions {
  onShare: () => void
  onHide: () => void
  onMute: () => void
  onReport: () => void
  onWhyShown: () => void
}

export function CardMenu(a: MenuActions) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const run = (fn: () => void) => (e: ReactMouseEvent) => { e.stopPropagation(); setOpen(false); fn() }

  return (
    <div className="menu" ref={ref} onClick={e => e.stopPropagation()}>
      <button
        type="button"
        className="iconbtn iconbtn--plain"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Действия с материалом"
        onClick={e => { e.stopPropagation(); setOpen(v => !v) }}
      >
        <Icon name="more" size={18} />
      </button>

      {open && (
        <div className="menu__list" role="menu">
          <button type="button" role="menuitem" className="menu__item" onClick={run(a.onHide)}>
            <Icon name="eye-off" size={17} strokeWidth={1.6} />Скрыть материал
          </button>
          <button type="button" role="menuitem" className="menu__item" onClick={run(a.onMute)}>
            <Icon name="sliders" size={17} strokeWidth={1.6} />Не показывать источник
          </button>
          <button type="button" role="menuitem" className="menu__item" onClick={run(a.onWhyShown)}>
            <Icon name="compass" size={17} strokeWidth={1.6} />Почему показано
          </button>
          <div className="menu__sep" />
          <button type="button" role="menuitem" className="menu__item" onClick={run(a.onReport)}>
            <Icon name="close" size={17} strokeWidth={1.6} />Сообщить о проблеме
          </button>
        </div>
      )}
    </div>
  )
}
