import { useState } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import type { FeedItem } from '../types'
import { Overlay } from './Overlay'

interface Comment {
  id: string
  name: string
  role: string
  time: string
  text: string
}

const mockComments: Comment[] = [
  { id: 'm1', name: 'Ольга Смирнова', role: 'Терапевт, стаж 12 лет', time: '2 дня назад', text: 'Полезный разбор, добавила ссылку в свою подборку для ординаторов.' },
  { id: 'm2', name: 'Дмитрий Ковалёв', role: 'Кардиолог', time: '1 день назад', text: 'В своей практике вижу похожую динамику — рекомендации соответствуют текущим протоколам.' },
]

const storageKey = 'medya.comments.v1'

export const mockCommentsCount = mockComments.length

export function getOwnCommentsCount(id: string): number {
  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return 0
    const parsed = JSON.parse(raw) as Record<string, unknown[]>
    return parsed[id]?.length ?? 0
  } catch {
    return 0
  }
}

interface Props {
  item: FeedItem
  onClose: () => void
}

export function CommentSheet({ item, onClose }: Props) {
  const [own, setOwn] = useLocalStorage<Record<string, Comment[]>>(storageKey, {})
  const [draft, setDraft] = useState('')
  const ownForItem = own[item.id] ?? []
  const total = mockComments.length + ownForItem.length

  const submit = () => {
    const text = draft.trim()
    if (!text) return
    const next: Comment = { id: `own-${Date.now()}`, name: 'Вы', role: 'Врач', time: 'сейчас', text }
    setOwn(prev => ({ ...prev, [item.id]: [...(prev[item.id] ?? []), next] }))
    setDraft('')
  }

  return (
    <Overlay title="Комментарии" onClose={onClose} sheet>
      <p className="art__label" style={{ marginBottom: 4 }}>{item.title}</p>
      <p className="comment__count">{total} {total === 1 ? 'комментарий' : 'комментария'}</p>

      {mockComments.map(c => (
        <div className="comment" key={c.id}>
          <div className="comment__head">
            <span className="comment__name">{c.name}</span>
            <span className="comment__role">{c.role}</span>
            <span className="comment__time">{c.time}</span>
          </div>
          <p className="comment__text">{c.text}</p>
        </div>
      ))}
      {ownForItem.map(c => (
        <div className="comment" key={c.id}>
          <div className="comment__head">
            <span className="comment__name">{c.name}</span>
            <span className="comment__role">{c.role}</span>
            <span className="comment__time">{c.time}</span>
          </div>
          <p className="comment__text">{c.text}</p>
        </div>
      ))}

      <div className="comment__form" style={{ marginTop: 16 }}>
        <textarea
          className="comment__input"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="Добавить комментарий"
          aria-label="Добавить комментарий"
        />
        <p className="comment__warning">Не публикуйте персональные данные пациентов.</p>
        <button type="button" className="btn btn--primary btn--block" onClick={submit} disabled={!draft.trim()}>
          Отправить
        </button>
      </div>
    </Overlay>
  )
}
