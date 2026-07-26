import styles from './SkeletonCard.module.css'

export function SkeletonCard() {
  return (
    <div className={styles.card} aria-hidden>
      <div className={styles.metaRow}>
        <div className={`${styles.line} ${styles.chip}`} />
        <div className={`${styles.line} ${styles.chip}`} />
        <div className={`${styles.line} ${styles.chipShort}`} />
      </div>
      <div className={`${styles.line} ${styles.title}`} />
      <div className={`${styles.line} ${styles.titleShort}`} />
      <div className={`${styles.line} ${styles.body}`} />
      <div className={`${styles.line} ${styles.body}`} />
    </div>
  )
}
