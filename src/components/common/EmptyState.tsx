import type { ReactNode } from 'react'
import styles from './EmptyState.module.css'

interface Props {
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: Props) {
  return (
    <div className={styles.wrap} role="status">
      <div className={styles.dot} aria-hidden />
      <div className={styles.title}>{title}</div>
      {description && <div className={styles.desc}>{description}</div>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}
