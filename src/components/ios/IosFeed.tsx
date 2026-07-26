import { useMemo, useRef, useState } from 'react'
import type { FeedItem, HideReason } from '../../types'
import { Icon } from '../common/Icon'
import { EmptyState } from '../common/EmptyState'
import { ErrorState } from '../common/ErrorState'
import { SkeletonCard } from '../common/SkeletonCard'
import { Toast } from '../common/Toast'
import { useFeedState } from '../../hooks/useFeedState'
import { useToast } from '../../hooks/useToast'
import { feedLimits, toastText } from '../../config/productConfig'
import { FeedCard } from '../feed/FeedCard'
import { FeedFilters } from '../feed/FeedFilters'
import { IosDetailScreen } from './IosDetailScreen'
import styles from './IosFeed.module.css'

export function IosFeed() {
  const feed = useFeedState()
  const { toast, show, dismiss } = useToast()
  const [openItem, setOpenItem] = useState<FeedItem | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const startY = useRef<number | null>(null)
  const [pullDist, setPullDist] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  const list = feed.mainItems.slice(0, feedLimits.maxNewItems)
  const savedTags = useMemo(() => {
    const set = new Set<string>()
    for (const it of feed.savedItems) it.tags.forEach(t => set.add(t))
    return [...set]
  }, [feed.savedItems])

  const onTouchStart = (e: React.TouchEvent) => {
    if (scrollRef.current && scrollRef.current.scrollTop <= 0) {
      startY.current = e.touches[0].clientY
    }
  }
  const onTouchMove = (e: React.TouchEvent) => {
    if (startY.current == null) return
    const dy = e.touches[0].clientY - startY.current
    if (dy > 0) setPullDist(Math.min(80, dy * 0.6))
  }
  const onTouchEnd = async () => {
    const dist = pullDist
    startY.current = null
    setPullDist(0)
    if (dist >= 60 && !refreshing) {
      setRefreshing(true)
      const { added } = await feed.refresh()
      setRefreshing(false)
      show(toastText.refreshedCount(added))
    }
  }

  const onSave = (item: FeedItem) => {
    const wasSaved = feed.isSaved(item.id)
    const nowSaved = feed.toggleSave(item.id)
    if (nowSaved) show(toastText.saved)
    else if (wasSaved) show(toastText.unsaved, { label: 'Вернуть', onClick: () => feed.toggleSave(item.id) })
  }
  const onPractice = (item: FeedItem) => {
    if (feed.togglePracticeUseful(item.id)) show(toastText.practiceUseful)
  }
  const onHide = (item: FeedItem, reason: HideReason) => {
    feed.hideItem(item.id, reason)
    show(toastText.hidden, { label: 'Отменить', onClick: () => feed.unhideItem(item.id) })
  }

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <h1 className={styles.title}>Для вас</h1>
        <div className={styles.headActions}>
          <button type="button" className={styles.iconBtn} aria-label="Поиск">
            <Icon name="search" size={20} />
          </button>
          <div className={styles.avatar} aria-hidden>ЕТ</div>
        </div>
      </header>

      <div className={styles.filtersWrap}>
        <FeedFilters variant="ios" active={feed.activeFilter} onChange={feed.setActiveFilter} />
      </div>

      <div className={styles.hint}>
        Лента настроена для кардиолога · <button type="button" className={styles.hintLink}>Изменить</button>
      </div>

      <div
        ref={scrollRef}
        className={styles.scroll}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className={styles.pull} style={{ height: pullDist }}>
          {refreshing ? 'Обновляем…' : pullDist >= 60 ? 'Отпустите, чтобы обновить' : pullDist > 0 ? 'Потяните вниз' : ''}
        </div>

        {feed.loadState === 'error' && <ErrorState onRetry={feed.clearError} />}

        {feed.outOfSpecialtyMode && (
          <div className={styles.outPanel}>
            <div className={styles.outHead}>
              <span>За пределами специальности</span>
              <button type="button" onClick={() => feed.setOutOfSpecialtyMode(false)} aria-label="Закрыть">
                <Icon name="close" size={18} />
              </button>
            </div>
            <p className={styles.outText}>{toastText.outOfSpecialty}</p>
            {feed.outOfSpecialtyItems.map(item => (
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
            ))}
          </div>
        )}

        {refreshing && (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {!refreshing && list.length === 0 && (
          <EmptyState title="Ничего не нашли" description="Попробуйте изменить фильтр" />
        )}

        {list.map(item => (
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
        ))}

        {list.length > 0 && (
          <div className={styles.end}>
            <div className={styles.endTitle}>{toastText.endOfFeed}</div>
            <div className={styles.endSub}>{toastText.nextRefresh}</div>
          </div>
        )}

        {!feed.outOfSpecialtyMode && (
          <button type="button" className={styles.shake} onClick={() => feed.setOutOfSpecialtyMode(true)}>
            <Icon name="compass" size={16} />
            <span>Посмотреть за пределами специальности</span>
          </button>
        )}

        {savedTags.length > 0 && (
          <div className={styles.savedTopics}>
            <div className={styles.savedTitle}>Ваши сохранённые темы</div>
            <div className={styles.topicRow}>
              {savedTags.map((t, i) => <span key={i} className={styles.topic}>{t}</span>)}
            </div>
          </div>
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
