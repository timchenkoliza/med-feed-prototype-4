import { useEffect, useRef, useState } from 'react'
import { Icon } from '../../components/common/Icon'
import { evidenceLabel, ui } from '../config'
import { eventDate } from '../format'
import type { FeedItem } from '../types'
import { Overlay } from './Overlay'

const suggestions: Record<'A' | 'B', string[]> = {
  A: ['Что изменилось по сравнению с прежней практикой?', 'Как применить это на приёме?', 'Насколько надёжны данные?'],
  B: ['О чём это за 30 секунд?', 'Кому будет полезно?', 'Что нужно сделать, чтобы участвовать?'],
}

/** Ответ собирается локально из полей материала. Без сети. */
function answer(item: FeedItem, q: string): string {
  const s = q.toLowerCase()
  const paras = item.detail.blocks.filter(b => b.t === 'p').map(b => (b as { v: string }).v)

  if (s.includes('надёж') || s.includes('надеж') || s.includes('доказ') || s.includes('данн')) {
    const evidence = evidenceLabel(item.evidence)
    const base = item.evidenceNote ? `${evidence ? `${evidence}. ` : ''}${item.evidenceNote}` : item.summary
    return item.limitations ? `${base}\n\nОграничения: ${item.limitations}` : base
  }
  if (s.includes('измен')) return `${item.summary}\n\nЧто это меняет: ${item.why}`
  if (s.includes('приём') || s.includes('прием') || s.includes('примен') || s.includes('практик')) {
    return `${item.why}\n\n${paras[paras.length - 1] ?? ''}`.trim()
  }
  if (s.includes('участв') || s.includes('регистр') || s.includes('когда')) {
    return item.event
      ? `${eventDate(item.event.startsAt, item.event.endsAt)}, ${item.event.place}. Стоимость: ${item.event.price}.` +
        (item.event.nmo ? ` Начисляется ${item.event.nmo} ЗЕТ НМО.` : '') +
        (item.event.deadline ? ` Регистрация открыта до ${item.event.deadline}.` : '')
      : `Это не событие: ${item.summary}`
  }
  if (s.includes('кому') || s.includes('полезн')) return `${item.why}\n\n${item.summary}`
  return `${item.detail.lead}\n\n${item.summary}\n\nПочему это важно: ${item.why}`
}

interface Props { item: FeedItem; onClose: () => void }

export function AskAi({ item, onClose }: Props) {
  const [turns, setTurns] = useState<Array<{ q: string; a: string }>>([])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const timer = useRef<number | null>(null)

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current) }, [])

  const ask = (text: string) => {
    const q = text.trim()
    if (!q || busy) return
    setDraft(''); setBusy(true)
    setTurns(p => [...p, { q, a: '' }])
    timer.current = window.setTimeout(() => {
      setTurns(p => p.map((t, i) => (i === p.length - 1 ? { ...t, a: answer(item, q) } : t)))
      setBusy(false)
    }, 450)
  }

  return (
    <Overlay
      title="Спросить AI"
      onClose={onClose}
      sheet
      footer={
        <>
          <input
            className="input"
            value={draft}
            placeholder="Вопрос по материалу"
            aria-label="Вопрос по материалу"
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && ask(draft)}
          />
          <button type="button" className="btn btn--primary btn--lg" onClick={() => ask(draft)} disabled={!draft.trim() || busy} aria-label="Отправить">
            <Icon name="chevron-right" size={17} strokeWidth={2} />
          </button>
        </>
      }
    >
      <div className="aictx"><b>{item.title}</b>{item.source.name}</div>

      {turns.length === 0 && suggestions[item.feed].map(s => (
        <button key={s} type="button" className="aisuggest" onClick={() => ask(s)}>
          <Icon name="sparkle" size={16} strokeWidth={1.7} />{s}
        </button>
      ))}

      {turns.length > 0 && (
        <div className="aithread">
          {turns.map((t, i) => (
            <div key={i} style={{ display: 'contents' }}>
              <div className="aiq">{t.q}</div>
              <div className="aia">{t.a || 'Готовлю ответ…'}</div>
            </div>
          ))}
        </div>
      )}

      <p className="note">{ui.aiDisclaimer}</p>
    </Overlay>
  )
}
