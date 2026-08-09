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
  try {
    return window.localStorage.getItem(onboardingStorageKey) === '1'
  } catch {
    return true
  }
}

export function resetOnboarding() {
  try {
    window.localStorage.removeItem(onboardingStorageKey)
  } catch {
    /* прототип */
  }
}

export function Onboarding({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0)
  const [rect, setRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    const isDesktop = window.matchMedia('(min-width: 769px)').matches

    // Keep existing mobile behavior untouched.
    if (!isDesktop) {
      const update = () => {
        const el = document.getElementById(steps[i].targetId)
        setRect(el ? el.getBoundingClientRect() : null)
      }

      update()
      const raf = requestAnimationFrame(update)
      window.addEventListener('resize', update)

      return () => {
        cancelAnimationFrame(raf)
        window.removeEventListener('resize', update)
      }
    }

    const target = document.getElementById(steps[i].targetId)
    if (!target) {
      setRect(null)
      return
    }

    let rafId = 0
    let tracking = true

    const update = () => {
      if (!tracking) return

      setRect(target.getBoundingClientRect())
      rafId = requestAnimationFrame(update)
    }

    const initialRect = target.getBoundingClientRect()

    // Comfortable central viewport zone.
    const zoneTop = window.innerHeight * 0.25
    const zoneBottom = window.innerHeight * 0.75

    const isOutsideComfortZone =
      initialRect.top < zoneTop ||
      initialRect.bottom > zoneBottom

    if (isOutsideComfortZone) {
      const reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

      target.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'center',
        inline: 'nearest',
      })
    }

    update()

    const onResize = () => {
      setRect(target.getBoundingClientRect())
    }

    const onScroll = () => {
      setRect(target.getBoundingClientRect())
    }

    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onScroll, { passive: true })

    // Re-measure after browser layout/scroll frames.
    const layoutRaf1 = requestAnimationFrame(() => {
      setRect(target.getBoundingClientRect())

      requestAnimationFrame(() => {
        setRect(target.getBoundingClientRect())
      })
    })

    return () => {
      tracking = false
      cancelAnimationFrame(rafId)
      cancelAnimationFrame(layoutRaf1)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScroll)
    }
  }, [i])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish()
    }

    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const finish = () => {
    try {
      window.localStorage.setItem(onboardingStorageKey, '1')
    } catch {
      /* прототип */
    }

    onDone()
  }

  const next = () =>
    i < steps.length - 1 ? setI(i + 1) : finish()

  const pad = 6

  const ringStyle = rect
    ? {
        top: rect.top - pad,
        left: rect.left - pad,
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
      }
    : {
        top: 12,
        left: 12,
        width: 0,
        height: 0,
        boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)',
      }

  const isDesktop =
    typeof window !== 'undefined' &&
    window.matchMedia('(min-width: 769px)').matches

  let cardTop = rect
    ? Math.min(rect.bottom + 16, window.innerHeight - 180)
    : window.innerHeight / 2 - 60

  if (rect && isDesktop) {
    const edge = 16
    const gap = 16

    // Existing onboarding card is roughly <= 180px tall.
    // Use its rendered element when available for exact placement.
    const card = document.querySelector<HTMLElement>('.onb-card')
    const cardHeight = card?.offsetHeight ?? 164

    const belowTop = rect.bottom + gap
    const enoughSpaceBelow =
      belowTop + cardHeight <= window.innerHeight - edge

    if (enoughSpaceBelow) {
      cardTop = belowTop
    } else {
      cardTop = Math.max(
        edge,
        rect.top - gap - cardHeight
      )
    }
  }

  const cardLeft = rect
    ? Math.min(
        Math.max(rect.left, 16),
        window.innerWidth - 336
      )
    : 16

  return (
    <>
      <div className="onb-scrim" onClick={finish} />

      <div
        className="onb-ring"
        style={ringStyle}
      />

      <div
        className="onb-card"
        style={{ top: cardTop, left: cardLeft }}
        role="dialog"
        aria-modal="true"
        aria-label="Знакомство с лентой"
      >
        <span className="onb-card__step">
          Шаг {i + 1} из {steps.length}
        </span>

        <p className="onb-card__text">
          {steps[i].text}
        </p>

        <div className="onb-card__row">
          <button
            type="button"
            className="btn btn--quiet"
            onClick={finish}
          >
            Пропустить
          </button>

          <span className="grow" />

          <button
            type="button"
            className="btn btn--primary"
            onClick={next}
          >
            {i < steps.length - 1 ? 'Далее' : 'Понятно'}
          </button>
        </div>
      </div>
    </>
  )
}
