import { useEffect, useRef, useState } from 'react'
import { Icon } from '../../components/common/Icon'
import { researchText } from '../config'
import { creditsLabel, eventDateTime } from '../format'
import type { FeedBItem } from '../types'
import { Sheet } from './Sheet'
import styles from './RegisterSheet.module.css'

interface Props {
  item: FeedBItem | null
  onClose: () => void
  /** Вызывается при открытии формы — начало сценария регистрации. */
  onStart?: () => void
  onComplete: (id: string) => void
}

export function RegisterSheet({ item, onClose, onStart, onComplete }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [place, setPlace] = useState('')
  const [agree, setAgree] = useState(true)
  const [touched, setTouched] = useState(false)
  const [step, setStep] = useState<'form' | 'sending' | 'done'>('form')
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (!item) return
    setStep('form')
    setTouched(false)
    onStart?.()
    // onStart стабилен на время жизни экрана; перезапуск только при смене материала
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id])

  useEffect(() => () => { if (timerRef.current) window.clearTimeout(timerRef.current) }, [])

  if (!item || !item.event) return null

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  const nameOk = name.trim().length >= 3
  const valid = emailOk && nameOk && agree

  const submit = () => {
    setTouched(true)
    if (!valid || step !== 'form') return
    setStep('sending')
    timerRef.current = window.setTimeout(() => {
      setStep('done')
      onComplete(item.id)
    }, 700)
  }

  return (
    <Sheet
      open
      title={step === 'done' ? 'Регистрация подтверждена' : 'Регистрация на событие'}
      onClose={onClose}
      footer={
        step === 'done' ? (
          <button type="button" className={styles.submit} onClick={onClose}>
            Готово
          </button>
        ) : (
          <button type="button" className={styles.submit} onClick={submit} disabled={step === 'sending'}>
            {step === 'sending' ? 'Отправляем…' : 'Зарегистрироваться'}
          </button>
        )
      }
    >
      {step === 'done' ? (
        <div className={styles.done}>
          <div className={styles.doneIcon}>
            <Icon name="check" size={26} strokeWidth={2.2} />
          </div>
          <div className={styles.doneTitle}>{researchText.registerDone}</div>
          <p className={styles.doneText}>
            {item.title}
            <br />
            {eventDateTime(item.event.startsAt)} · {item.event.place}
          </p>
          <p className={styles.note}>{researchText.privacyNote}</p>
        </div>
      ) : (
        <>
          <div className={styles.event}>
            <div className={styles.eventTitle}>{item.title}</div>
            <div className={styles.eventRow}>
              <Icon name="calendar" size={15} />
              {eventDateTime(item.event.startsAt)}
            </div>
            <div className={styles.eventRow}>
              <Icon name="pin" size={15} />
              {item.event.place}
            </div>
            <div className={styles.eventRow}>
              <Icon name="wallet" size={15} />
              {item.event.price}
            </div>
            {item.event.nmoCredits != null && (
              <div className={styles.eventRow}>
                <Icon name="award" size={15} />
                <span className={styles.nmo}>НМО · {creditsLabel(item.event.nmoCredits)}</span>
              </div>
            )}
          </div>

          <div className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="reg-name">
                ФИО
              </label>
              <input
                id="reg-name"
                className={`${styles.input} ${touched && !nameOk ? styles.error : ''}`}
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Иванова Мария Сергеевна"
                autoComplete="off"
              />
              {touched && !nameOk && <span className={styles.errorText}>Укажите ФИО</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="reg-email">
                Рабочая почта
              </label>
              <input
                id="reg-email"
                type="email"
                className={`${styles.input} ${touched && !emailOk ? styles.error : ''}`}
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="doctor@clinic.ru"
                autoComplete="off"
              />
              {touched && !emailOk && <span className={styles.errorText}>Проверьте адрес почты</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="reg-place">
                Место работы (необязательно)
              </label>
              <input
                id="reg-place"
                className={styles.input}
                value={place}
                onChange={e => setPlace(e.target.value)}
                placeholder="ГКБ №1, кардиологическое отделение"
                autoComplete="off"
              />
            </div>

            <label className={styles.checkRow}>
              <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} />
              <span>Согласен на обработку данных для участия в событии</span>
            </label>
          </div>

          <p className={styles.note}>{researchText.privacyNote}</p>
        </>
      )}
    </Sheet>
  )
}
