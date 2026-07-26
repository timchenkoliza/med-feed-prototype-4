import { useState } from 'react'
import { useFeedState } from '../../hooks/useFeedState'
import { FeedCard } from '../feed/FeedCard'
import { EmptyState } from '../common/EmptyState'
import { IosDetailScreen } from './IosDetailScreen'
import { Toast } from '../common/Toast'
import { useToast } from '../../hooks/useToast'
import { toastText } from '../../config/productConfig'
import type { FeedItem, HideReason } from '../../types'
import styles from './IosStubs.module.css'

export function IosSavedScreen() {
  const feed = useFeedState()
  const { toast, show, dismiss } = useToast()
  const [openItem, setOpenItem] = useState<FeedItem | null>(null)

  const onSave = (item: FeedItem) => {
    const wasSaved = feed.isSaved(item.id)
    feed.toggleSave(item.id)
    show(wasSaved ? toastText.unsaved : toastText.saved)
  }
  const onPractice = (item: FeedItem) => {
    if (feed.togglePracticeUseful(item.id)) show(toastText.practiceUseful)
  }
  const onHide = (item: FeedItem, reason: HideReason) => {
    feed.hideItem(item.id, reason)
    show(toastText.hidden, { label: 'Отменить', onClick: () => feed.unhideItem(item.id) })
  }

  return (
    <div className={styles.savedWrap}>
      <header className={styles.savedHead}>
        <h2 className={styles.title}>Сохранённое</h2>
      </header>
      <div className={styles.savedScroll}>
        {feed.savedItems.length === 0 ? (
          <EmptyState
            title="Пока пусто"
            description="Материалы, которые вы сохраните, появятся здесь."
          />
        ) : (
          feed.savedItems.map(item => (
            <FeedCard
              key={item.id}
              variant="ios"
              item={item}
              source={feed.sourcesById[item.sourceId]}
              saved={feed.isSaved(item.id)}
              practiceUseful={feed.isPracticeUseful(item.id)}
              onOpen={() => setOpenItem(item)}
              onSave={() => onSave(item)}
              onPractice={() => onPractice(item)}
              onHide={r => onHide(item, r)}
            />
          ))
        )}
      </div>

      {openItem && (
        <IosDetailScreen
          item={openItem}
          source={feed.sourcesById[openItem.sourceId]}
          saved={feed.isSaved(openItem.id)}
          practiceUseful={feed.isPracticeUseful(openItem.id)}
          onClose={() => setOpenItem(null)}
          onSave={() => onSave(openItem)}
          onPractice={() => onPractice(openItem)}
        />
      )}
      <Toast toast={toast} onDismiss={dismiss} variant="ios" />
    </div>
  )
}
