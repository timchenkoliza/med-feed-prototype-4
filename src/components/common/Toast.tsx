import type { ToastState } from '../../hooks/useToast'
import styles from './Toast.module.css'

interface Props {
  toast: ToastState | null
  onDismiss: () => void
  variant?: 'web' | 'ios'
}

export function Toast({ toast, onDismiss, variant = 'web' }: Props) {
  if (!toast) return null
  return (
    <div
      className={`${styles.toast} ${variant === 'ios' ? styles.ios : styles.web}`}
      role="status"
      aria-live="polite"
    >
      <span className={styles.message}>{toast.message}</span>
      {toast.action && (
        <button
          type="button"
          className={styles.action}
          onClick={() => {
            toast.action?.onClick()
            onDismiss()
          }}
        >
          {toast.action.label}
        </button>
      )}
    </div>
  )
}
