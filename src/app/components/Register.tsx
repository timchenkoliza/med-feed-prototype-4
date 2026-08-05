import { useEffect, useRef, useState } from 'react'
import { Icon } from '../../components/common/Icon'
import { ui } from '../config'
import { eventDate, fullDate } from '../format'
import type { FeedItem } from '../types'
import { Overlay } from './Overlay'

interface Props { item: FeedItem; onClose: () => void; onDone: (id: string) => void }

export function Register({ item, onClose, onDone }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [place, setPlace] = useState('')
  const [agree, setAgree] = useState(true)
  const [touched, setTouched] = useState(false)
  const [step, setStep] = useState<'form' | 'sending' | 'done'>('form')
  const timer = useRef<number | null>(null)

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current) }, [])
  if (!item.event) return null

  const nameOk = name.trim().length >= 3
  const mailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  const valid = nameOk && mailOk && agree

  const submit = () => {
    setTouched(true)
    if (!valid || step !== 'form') return
    setStep('sending')
    timer.current = window.setTimeout(() => { setStep('done'); onDone(item.id) }, 600)
  }

  return (
    <Overlay
      title={step === 'done' ? 'Регистрация подтверждена' : 'Регистрация на событие'}
      onClose={onClose}
      sheet
      footer={
        step === 'done' ? (
          <button type="button" className="btn btn--primary btn--lg btn--block" onClick={onClose}>Готово</button>
        ) : (
          <button type="button" className="btn btn--primary btn--lg btn--block" onClick={submit} disabled={step === 'sending'}>
            {step === 'sending' ? 'Отправляем…' : 'Зарегистрироваться'}
          </button>
        )
      }
    >
      {step === 'done' ? (
        <div className="done">
          <div className="done__icon"><Icon name="check" size={26} strokeWidth={2.2} /></div>
          <div className="done__title">Вы зарегистрированы</div>
          <p className="art__p" style={{ marginTop: 8 }}>
            {item.title}<br />{eventDate(item.event.startsAt, item.event.endsAt)} · {item.event.place}
          </p>
          <p className="note">{ui.privacy} Напоминание придёт на указанную почту за сутки до события.</p>
        </div>
      ) : (
        <>
          <div className="aictx">
            <b>{item.title}</b>
            {eventDate(item.event.startsAt, item.event.endsAt)} · {item.event.place}
            {item.event.nmo != null && <> · НМО {item.event.nmo} ЗЕТ</>}
            {item.event.deadline && <> · регистрация до {fullDate(item.event.deadline)}</>}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="reg-name">ФИО</label>
            <input id="reg-name" className={`input${touched && !nameOk ? ' input--error' : ''}`} value={name} onChange={e => setName(e.target.value)} placeholder="Иванова Мария Сергеевна" autoComplete="off" />
            {touched && !nameOk && <span className="field__err">Укажите ФИО</span>}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="reg-mail">Рабочая почта</label>
            <input id="reg-mail" type="email" className={`input${touched && !mailOk ? ' input--error' : ''}`} value={email} onChange={e => setEmail(e.target.value)} placeholder="doctor@clinic.ru" autoComplete="off" />
            {touched && !mailOk && <span className="field__err">Проверьте адрес почты</span>}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="reg-place">Место работы (необязательно)</label>
            <input id="reg-place" className="input" value={place} onChange={e => setPlace(e.target.value)} placeholder="ГКБ №1, терапевтическое отделение" autoComplete="off" />
          </div>

          <label className="check">
            <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} />
            <span>Согласен на обработку данных для участия в событии</span>
          </label>

          <p className="note">{ui.privacy}</p>
        </>
      )}
    </Overlay>
  )
}
