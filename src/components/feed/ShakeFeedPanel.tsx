import type { FeedItem, Source } from '../../types'
import { Icon } from '../common/Icon'
import { toastText } from '../../config/productConfig'
import { FeedCard } from './FeedCard'
import styles from './ShakeFeedPanel.module.css'

interface Props {
  items: FeedItem[]
  sourcesById: Record<string, Source>
  onClose: () => void
  onOpenItem: (item: FeedItem) => void
  isSaved: (id: string) => boolean
  isPractice: (id: string) => boolean
  onSave: (item: FeedItem) => void
  onPractice: (item: FeedItem) => void
  onHide: (item: FeedItem, reason: import('../../types').HideReason) => void
}

export function ShakeFeedPanel({
  items,
  sourcesById,
  onClose,
  onOpenItem,
  isSaved,
  isPractice,
  onSave,
  onPractice,
  onHide,
}: Props) {
  return (
    <section className={styles.wrap} aria-labelledby="shake-title">
      <header className={styles.head}>
        <div>
          <h2 id="shake-title" className={styles.title}>Посмотреть за пределами специальности</h2>
          <p className={styles.subtitle}>{toastText.outOfSpecialty}</p>
        </div>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Закрыть режим">
          <Icon name="close" size={20} />
        </button>
      </header>
      <div className={styles.list}>
        {items.map(item => (
          <FeedCard
            key={item.id}
            item={item}
            source={sourcesById[item.sourceId]}
            saved={isSaved(item.id)}
            practiceUseful={isPractice(item.id)}
            onOpen={() => onOpenItem(item)}
            onSave={() => onSave(item)}
            onPractice={() => onPractice(item)}
            onHide={r => onHide(item, r)}
          />
        ))}
      </div>
    </section>
  )
}
