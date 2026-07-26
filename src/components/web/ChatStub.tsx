import styles from './ChatStub.module.css'

export function ChatStub() {
  return (
    <div className={styles.wrap}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Добрый день</h1>
        <p className={styles.subtitle}>С чем помочь сегодня?</p>
        <div className={styles.limit}>
          <div className={styles.limitText}>Сообщения на сегодня закончились. Доступ обновится завтра.</div>
          <div className={styles.promoRow}>
            <div className={styles.promoLabel}>Повысить тариф</div>
            <input className={styles.promoInput} placeholder="XXX-YYY" aria-label="Промо-код" />
            <button type="button" className={styles.promoBtn}>Применить код</button>
          </div>
        </div>
        <p className={styles.hint}>
          Раздел «Лента» открывается из левого меню и не связан с лимитом AI-чата.
        </p>
      </div>
    </div>
  )
}
