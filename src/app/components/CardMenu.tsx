import { useEffect, useRef, useState } from 'react'
import { Icon } from '../../components/common/Icon'

export interface MenuActions {
  saved: boolean
  useful: boolean
  onSave: () => void
  onUseful: () => void
  onShare: () => void
  onHide: () => void
  onMute: () => void
  onReport: () => void
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

  const run = (fn: () => void) => (e: React.MouseEvent) => { e.stopPropagation(); setOpen(false); fn() }

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
          <button type="button" role="menuitem" className="menu__item" onClick={run(a.onSave)}>
            <Icon name={a.saved ? 'bookmark-filled' : 'bookmark'} size={17} strokeWidth={1.6} />
            {a.saved ? 'Убрать из сохранённых' : 'Сохранить'}
          </button>
          <button type="button" role="menuitem" className="menu__item" onClick={run(a.onUseful)}>
            <Icon name={a.useful ? 'thumbs-up-filled' : 'thumbs-up'} size={17} strokeWidth={1.6} />
            {a.useful ? 'Снять отметку «полезно»' : 'Отметить полезным'}
          </button>
          <button type="button" role="menuitem" className="menu__item" onClick={run(a.onShare)}>
            <Icon name="external" size={17} strokeWidth={1.6} />Поделиться
          </button>
          <div className="menu__sep" />
          <button type="button" role="menuitem" className="menu__item" onClick={run(a.onHide)}>
            <Icon name="eye-off" size={17} strokeWidth={1.6} />Скрыть материал
          </button>
          <button type="button" role="menuitem" className="menu__item" onClick={run(a.onMute)}>
            <Icon name="sliders" size={17} strokeWidth={1.6} />Не показывать похожее
          </button>
          <button type="button" role="menuitem" className="menu__item" onClick={run(a.onReport)}>
            <Icon name="close" size={17} strokeWidth={1.6} />Сообщить о проблеме
          </button>
        </div>
      )}
    </div>
  )
}
