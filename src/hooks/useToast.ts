import { useCallback, useRef, useState } from 'react'

export interface ToastAction {
  label: string
  onClick: () => void
}
export interface ToastState {
  id: number
  message: string
  action?: ToastAction
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null)
  const timerRef = useRef<number | null>(null)

  const show = useCallback((message: string, action?: ToastAction, durationMs = 3600) => {
    if (timerRef.current) window.clearTimeout(timerRef.current)
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setToast({ id, message, action })
    timerRef.current = window.setTimeout(() => setToast(t => (t?.id === id ? null : t)), durationMs)
  }, [])

  const dismiss = useCallback(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current)
    setToast(null)
  }, [])

  return { toast, show, dismiss }
}
