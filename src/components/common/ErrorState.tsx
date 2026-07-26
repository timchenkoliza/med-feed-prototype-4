import styles from './ErrorState.module.css'

interface Props {
  title?: string
  onRetry: () => void
}

export function ErrorState({ title = 'Не удалось обновить ленту', onRetry }: Props) {
  return (
    <div className={styles.wrap} role="alert">
      <div className={styles.title}>{title}</div>
      <button type="button" className={styles.retry} onClick={onRetry}>
        Попробовать снова
      </button>
    </div>
  )
}
