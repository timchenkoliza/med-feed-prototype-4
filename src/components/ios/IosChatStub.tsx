import styles from './IosStubs.module.css'

export function IosChatStub() {
  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>Добрый день</h2>
      <p className={styles.subtitle}>С чем помочь сегодня?</p>
      <div className={styles.limit}>
        Сообщения на сегодня закончились. Доступ обновится завтра.
      </div>
      <p className={styles.hint}>Раздел «Лента» доступен на нижней панели независимо от лимита AI-чата.</p>
    </div>
  )
}
