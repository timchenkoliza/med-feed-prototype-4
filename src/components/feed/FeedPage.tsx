import { useMemo, useState } from 'react'
import type { FeedItem, HideReason } from '../../types'
import { boards, feedLimits, toastText } from '../../config/productConfig'
import { EmptyState } from '../common/EmptyState'
import { ErrorState } from '../common/ErrorState'
import { SkeletonCard } from '../common/SkeletonCard'
import { Toast } from '../common/Toast'
import { useFeedState } from '../../hooks/useFeedState'
import { useToast } from '../../hooks/useToast'
import { FeedCard } from './FeedCard'
import { FeedDetailDrawer } from './FeedDetailDrawer'
import { FeedFilters } from './FeedFilters'
import { FeedHeader } from './FeedHeader'
import { PersonalizationHint } from './PersonalizationHint'
import { RightRail } from './RightRail'
import { SaveToBoardModal } from './SaveToBoardModal'
import { SearchOverlay } from './SearchOverlay'
import { ShakeFeedPanel } from './ShakeFeedPanel'
import { Icon } from '../common/Icon'
import styles from './FeedPage.module.css'

interface Props {
  showSaved?: boolean
  onLeaveSaved?: () => void
}

export function FeedPage({ showSaved, onLeaveSaved }: Props) {
  const feed = useFeedState()
  const { toast, show, dismiss } = useToast()

  const [openItem, setOpenItem] = useState<FeedItem | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [boardModalItem, setBoardModalItem] = useState<FeedItem | null>(null)

  const [pendingSkeletons, setPendingSkeletons] = useState(false)

  const savedTopics = useMemo(() => {
    const tags = new Set<string>()
    for (const it of feed.savedItems) it.tags.forEach(t => tags.add(t))
    return [...tags]
  }, [feed.savedItems])

  const list = showSaved ? feed.savedItems : feed.mainItems
  const limitedList = list.slice(0, feedLimits.maxNewItems)
  const showEndBanner = !showSaved && !feed.query && list.length > 0 && !feed.outOfSpecialtyMode

  const handleOpen = (item: FeedItem) => setOpenItem(item)

  const handleSave = (item: FeedItem) => {
    const wasSaved = feed.isSaved(item.id)
    const nowSaved = feed.toggleSave(item.id)
    if (nowSaved) {
      show(toastText.saved, {
        label: 'Выбрать доску',
        onClick: () => setBoardModalItem(item),
      })
    } else if (wasSaved) {
      show(toastText.unsaved, {
        label: 'Вернуть',
        onClick: () => feed.toggleSave(item.id),
      })
    }
  }

  const handlePractice = (item: FeedItem) => {
    const nowOn = feed.togglePracticeUseful(item.id)
    if (nowOn) show(toastText.practiceUseful)
  }

  const handleHide = (item: FeedItem, reason: HideReason) => {
    feed.hideItem(item.id, reason)
    show(toastText.hidden, {
      label: 'Отменить',
      onClick: () => feed.unhideItem(item.id),
    })
  }

  const handleRefresh = async () => {
    setPendingSkeletons(true)
    try {
      const { added } = await feed.refresh()
      show(toastText.refreshedCount(added))
    } finally {
      setPendingSkeletons(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.main}>
        <FeedHeader onOpenSearch={() => setSearchOpen(true)} onOpenSaved={() => {}} />

        {!showSaved && (
          <>
            <FeedFilters active={feed.activeFilter} onChange={feed.setActiveFilter} />
            <PersonalizationHint />
          </>
        )}

        {showSaved && (
          <div className={styles.savedHead}>
            <button type="button" className={styles.backLink} onClick={onLeaveSaved}>
              <Icon name="arrow-left" size={16} /> Назад к ленте
            </button>
            <h2 className={styles.savedTitle}>Сохранённое</h2>
          </div>
        )}

        <div className={styles.toolRow}>
          <button type="button" className={styles.ghost} onClick={handleRefresh}>
            <Icon name="refresh" size={16} />
            <span>Обновить ленту</span>
          </button>
          <button type="button" className={styles.ghost} onClick={feed.simulateError}>
            <Icon name="close" size={16} />
            <span>Показать ошибку загрузки</span>
          </button>
        </div>

        {feed.loadState === 'error' && (
          <div className={styles.errorWrap}>
            <ErrorState onRetry={feed.clearError} />
          </div>
        )}

        {feed.outOfSpecialtyMode && (
          <ShakeFeedPanel
            items={feed.outOfSpecialtyItems}
            sourcesById={feed.sourcesById}
            onClose={() => feed.setOutOfSpecialtyMode(false)}
            onOpenItem={handleOpen}
            isSaved={feed.isSaved}
            isPractice={feed.isPracticeUseful}
            onSave={handleSave}
            onPractice={handlePractice}
            onHide={handleHide}
          />
        )}

        {pendingSkeletons && (
          <div className={styles.list}>
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!pendingSkeletons && feed.loadState !== 'error' && (
          <div className={styles.list}>
            {limitedList.length === 0 && (
              <EmptyState
                title={showSaved ? 'Пока ничего не сохранено' : 'Ничего не нашли'}
                description={
                  showSaved
                    ? 'Материалы, отмеченные «Сохранить», появятся здесь.'
                    : 'Попробуйте изменить фильтр или сбросить поиск.'
                }
              />
            )}
            {limitedList.map(item => (
              <FeedCard
                key={item.id}
                item={item}
                source={feed.sourcesById[item.sourceId]}
                saved={feed.isSaved(item.id)}
                practiceUseful={feed.isPracticeUseful(item.id)}
                onOpen={() => handleOpen(item)}
                onSave={() => handleSave(item)}
                onPractice={() => handlePractice(item)}
                onHide={r => handleHide(item, r)}
              />
            ))}
            {showEndBanner && (
              <div className={styles.endBanner}>
                <div className={styles.endTitle}>{toastText.endOfFeed}</div>
                <div className={styles.endSub}>{toastText.nextRefresh}</div>
              </div>
            )}
          </div>
        )}
      </div>

      <RightRail
        savedTopics={savedTopics}
        onShakeFeed={() => feed.setOutOfSpecialtyMode(true)}
      />

      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        query={feed.query}
        onQueryChange={feed.setQuery}
        results={feed.mainItems}
        sourcesById={feed.sourcesById}
        onOpenItem={id => {
          const it = feed.mainItems.find(x => x.id === id)
          if (it) {
            setSearchOpen(false)
            setOpenItem(it)
          }
        }}
      />

      <FeedDetailDrawer
        item={openItem}
        source={openItem ? feed.sourcesById[openItem.sourceId] : null}
        saved={openItem ? feed.isSaved(openItem.id) : false}
        practiceUseful={openItem ? feed.isPracticeUseful(openItem.id) : false}
        onClose={() => setOpenItem(null)}
        onSave={() => openItem && handleSave(openItem)}
        onPractice={() => openItem && handlePractice(openItem)}
      />

      <SaveToBoardModal
        open={!!boardModalItem}
        currentBoardId={boardModalItem ? feed.savedRaw.boardAssignments[boardModalItem.id] : undefined}
        onClose={() => setBoardModalItem(null)}
        onSelect={boardId => {
          if (boardModalItem) {
            feed.setBoardForItem(boardModalItem.id, boardId)
            const label = boards.find(b => b.id === boardId)?.label ?? boardId
            show(toastText.savedToBoard(label))
            setBoardModalItem(null)
          }
        }}
      />

      <Toast toast={toast} onDismiss={dismiss} />
    </div>
  )
}
