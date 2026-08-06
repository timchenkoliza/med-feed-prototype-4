import { useEffect, useState } from 'react'

export const onboardingStorageKey = 'med-feed-onboarding-v1'

interface Step {
  targetId: string
  text: string
}

const steps: Step[] = [
  { targetId: 'onb-specialty', text: 'Лента настроена под вашу специальность. Здесь её можно изменить.' },
  { targetId: 'onb-feedtoggle', text: 'Клиническая — рекомендации и исследования. Профессиональная — события, обучение и медицинская индустрия.' },
  { targetId: 'onb-actions', text: 'Отмечайте полезное, обсуждайте с коллегами и сохраняйте материалы на потом.' },
]

export function isOnboardingDone(): boolean {
  try { return window.localStorage.getItem(onboardingStorageKey) === '1' } catch { return true }
}

export function resetOnboarding() {
  try { window.localStorage.removeItem(onboardingStorageKey) } catch { /* прототип */ }
}

export function Onboarding({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0)
  const [rect, setRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    const update = () => {
      const el = document.getElementById(steps[i].targetId)
      setRect(el ? el.getBoundingClientRect() : null)
    }
    update()
    const raf = requestAnimationFrame(update)
    window.addEventListener('resize', update)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', update) }
  }, [i])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') finish() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const finish = () => {
    try { window.localStorage.setItem(onboardingStorageKey, '1') } catch { /* прототип */ }
    onDone()
  }

  const next = () => (i < steps.length - 1 ? setI(i + 1) : finish())

  const pad = 6
  const ringStyle = rect
    ? { top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }
    : { top: 12, left: 12, width: 0, height: 0, boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)' }

  const cardTop = rect ? Math.min(rect.bottom + 16, window.innerHeight - 180) : window.innerHeight / 2 - 60
  const cardLeft = rect ? Math.min(Math.max(rect.left, 16), window.innerWidth - 336) : 16

  return (
    <>
      <div className="onb-scrim" onClick={finish} />
      <div className="onb-ring" style={ringStyle} />
      <div className="onb-card" style={{ top: cardTop, left: cardLeft }} role="dialog" aria-modal="true" aria-label="Знакомство с лентой">
        <span className="onb-card__step">Шаг {i + 1} из {steps.length}</span>
        <p className="onb-card__text">{steps[i].text}</p>
        <div className="onb-card__row">
          <button type="button" className="btn btn--quiet" onClick={finish}>Пропустить</button>
          <span className="grow" />
          <button type="button" className="btn btn--primary" onClick={next}>
            {i < steps.length - 1 ? 'Далее' : 'Понятно'}
          </button>
        </div>
      </div>
    </>
  )
}
