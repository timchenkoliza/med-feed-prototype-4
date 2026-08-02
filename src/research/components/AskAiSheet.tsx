import { useEffect, useRef, useState } from 'react'
import { Icon } from '../../components/common/Icon'
import { askAiSuggestions, evidenceLabels, researchText } from '../config'
import { creditsLabel, durationLabel, eventDateTime } from '../format'
import type { AnyItem, FeedAItem, FeedBItem, FeedVariant } from '../types'
import { isFeedB } from '../types'
import { Sheet } from './Sheet'
import styles from './AskAiSheet.module.css'

interface Turn {
  q: string
  a: string
}

/** Локальная генерация ответа по полям материала. Без сети и без backend. */
function buildAnswer(item: AnyItem, question: string): string {
  const q = question.toLowerCase()

  if (isFeedB(item)) {
    const b = item as FeedBItem
    const parts = [b.summary]
    parts.push(`Формат: ${b.format}${b.durationMinutes ? `, ${durationLabel(b.durationMinutes)}` : ''}.`)
    if (b.event) {
      parts.push(
        `Событие: ${eventDateTime(b.event.startsAt)}, ${b.event.place}. Стоимость: ${b.event.price}.` +
          (b.event.nmoCredits != null ? ` Начисляется ${creditsLabel(b.event.nmoCredits)} НМО.` : ''),
      )
    }
    if (q.includes('кому') || q.includes('полезн')) {
      parts.push(`Материал ориентирован на профиль: ${b.specialty === 'therapist' ? 'терапия' : b.specialty}.`)
    }
    if (b.fullText) parts.push(b.fullText)
    return parts.join('\n\n')
  }

  const a = item as FeedAItem
  if (q.includes('изменил')) {
    return `Что изменилось:\n${a.whatChanged}\n\nУровень доказательности: ${evidenceLabels[a.evidence]} — ${a.evidenceNote}.`
  }
  if (q.includes('практик') || q.includes('приём') || q.includes('прием') || q.includes('примен')) {
    return `${a.practiceImpact}\n\nОснование: ${a.evidenceNote}.`
  }
  if (q.includes('не подходит') || q.includes('противопок') || q.includes('осторож') || q.includes('риск')) {
    return `В материале отдельно оговорены ограничения: ${a.practiceImpact}\n\nУчитывайте уровень доказательности (${evidenceLabels[a.evidence]}) и сопутствующую патологию пациента.`
  }
  return `${a.summary}\n\nЧто изменилось: ${a.whatChanged}\n\nВ практике: ${a.practiceImpact}`
}

interface Props {
  item: AnyItem | null
  variant: FeedVariant
  onClose: () => void
  onAsk?: () => void
}

export function AskAiSheet({ item, variant, onClose, onAsk }: Props) {
  const [turns, setTurns] = useState<Turn[]>([])
  const [draft, setDraft] = useState('')
  const [thinking, setThinking] = useState(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    setTurns([])
    setDraft('')
    setThinking(false)
  }, [item?.id])

  useEffect(() => () => { if (timerRef.current) window.clearTimeout(timerRef.current) }, [])

  if (!item) return null

  const ask = (question: string) => {
    const text = question.trim()
    if (!text || thinking) return
    onAsk?.()
    setDraft('')
    setThinking(true)
    setTurns(prev => [...prev, { q: text, a: '' }])
    timerRef.current = window.setTimeout(() => {
      const answer = buildAnswer(item, text)
      setTurns(prev => prev.map((t, i) => (i === prev.length - 1 ? { ...t, a: answer } : t)))
      setThinking(false)
    }, 550)
  }

  return (
    <Sheet
      open
      title="Спросить AI"
      onClose={onClose}
      footer={
        <div className={styles.composer}>
          <input
            className={styles.input}
            value={draft}
            placeholder="Ваш вопрос по материалу"
            aria-label="Вопрос по материалу"
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') ask(draft)
            }}
          />
          <button
            type="button"
            className={styles.send}
            onClick={() => ask(draft)}
            disabled={!draft.trim() || thinking}
            aria-label="Отправить вопрос"
          >
            <Icon name="chevron-right" size={20} strokeWidth={2} />
          </button>
        </div>
      }
    >
      <div className={styles.context}>
        <span className={styles.contextTitle}>{item.title}</span>
        {item.source}
      </div>

      {turns.length === 0 && (
        <div className={styles.suggests}>
          {askAiSuggestions[variant].map(s => (
            <button key={s} type="button" className={styles.suggest} onClick={() => ask(s)}>
              <Icon name="sparkle" size={16} strokeWidth={1.7} />
              {s}
            </button>
          ))}
        </div>
      )}

      {turns.length > 0 && (
        <div className={styles.thread}>
          {turns.map((t, i) => (
            <div key={i} style={{ display: 'contents' }}>
              <div className={styles.q}>{t.q}</div>
              <div className={`${styles.a} ${t.a ? '' : styles.typing}`}>{t.a || 'Готовлю ответ…'}</div>
            </div>
          ))}
        </div>
      )}

      <p className={styles.disclaimer}>{researchText.aiDisclaimer}</p>
    </Sheet>
  )
}
