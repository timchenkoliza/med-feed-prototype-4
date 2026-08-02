import { useState } from 'react'
import { EmptyState } from '../components/common/EmptyState'
import { Toast } from '../components/common/Toast'
import { useToast } from '../hooks/useToast'
import { CardA } from './components/CardA'
import { CardB } from './components/CardB'
import { AskAiSheet } from './components/AskAiSheet'
import { DetailSheet } from './components/DetailSheet'
import { RegisterSheet } from './components/RegisterSheet'
import { Shell } from './components/Shell'
import { feedAFilters, feedBFilters, feedMeta, researchText } from './config'
import shellStyles from './components/Shell.module.css'
import type { AnyItem, FeedAItem, FeedBItem, FeedVariant } from './types'
import { useResearchState } from './useResearchState'

interface Props {
  variant: FeedVariant
}

export function ResearchFeed({ variant }: Props) {
  const feed = useResearchState(variant)
  const { toast, show, dismiss } = useToast()

  const [detailItem, setDetailItem] = useState<AnyItem | null>(null)
  const [aiItem, setAiItem] = useState<AnyItem | null>(null)
  const [regItem, setRegItem] = useState<FeedBItem | null>(null)

  const meta = feedMeta[variant]
  const filters = variant === 'A' ? feedAFilters : feedBFilters

  const openSource = (item: AnyItem) => {
    window.open(item.sourceUrl, '_blank', 'noopener,noreferrer')
  }

  const handleSave = (item: AnyItem) => {
    show(feed.toggleSave(item.id) ? researchText.saved : researchText.unsaved)
  }

  const handleUseful = (item: AnyItem) => {
    show(feed.toggleUseful(item.id) ? researchText.useful : researchText.unuseful)
  }

  const handleHide = (item: AnyItem) => {
    feed.hide(item.id)
    show(researchText.hidden, { label: researchText.undo, onClick: () => feed.unhide(item.id) })
  }

  const handleReset = () => {
    feed.reset()
    setDetailItem(null)
    setAiItem(null)
    setRegItem(null)
    show(researchText.reset)
  }

  const cardProps = (item: AnyItem) => ({
    saved: feed.isSaved(item.id),
    useful: feed.isUseful(item.id),
    onOpen: () => setDetailItem(item),
    onSave: () => handleSave(item),
    onUseful: () => handleUseful(item),
    onAsk: () => setAiItem(item),
    onOpenSource: () => openSource(item),
    onHide: () => handleHide(item),
  })

  return (
    <Shell
      title={meta.title}
      subtitle={meta.subtitle}
      filters={filters}
      activeFilter={feed.filter}
      onFilter={feed.setFilter}
      savedCount={feed.counts.saved}
      specialty={feed.specialty}
      onSpecialty={feed.setSpecialty}
      sessionId={feed.session.session}
      onReset={handleReset}
      overlays={
        <>
          <DetailSheet
            item={detailItem}
            saved={detailItem ? feed.isSaved(detailItem.id) : false}
            useful={detailItem ? feed.isUseful(detailItem.id) : false}
            registered={detailItem ? feed.isRegistered(detailItem.id) : false}
            onClose={() => setDetailItem(null)}
            onSave={() => detailItem && handleSave(detailItem)}
            onUseful={() => detailItem && handleUseful(detailItem)}
            onAsk={() => detailItem && setAiItem(detailItem)}
            onOpenSource={() => detailItem && openSource(detailItem)}
            onHide={() => detailItem && handleHide(detailItem)}
            onRegister={() => detailItem && setRegItem(detailItem as FeedBItem)}
          />

          <AskAiSheet item={aiItem} variant={variant} onClose={() => setAiItem(null)} />

          <RegisterSheet
            item={regItem}
            onClose={() => setRegItem(null)}
            onComplete={id => feed.register(id, new Date().toISOString())}
          />

          <div className={shellStyles.toastLayer}>
            <Toast toast={toast} onDismiss={dismiss} />
          </div>
        </>
      }
    >
      {feed.items.length === 0 && (
        <EmptyState title={researchText.emptyTitle} description={researchText.emptyBody} />
      )}

      {feed.items.map(item =>
        variant === 'A' ? (
          <CardA key={item.id} item={item as FeedAItem} {...cardProps(item)} />
        ) : (
          <CardB
            key={item.id}
            item={item as FeedBItem}
            registered={feed.isRegistered(item.id)}
            onRegister={() => setRegItem(item as FeedBItem)}
            {...cardProps(item)}
          />
        ),
      )}

      {feed.items.length > 0 && (
        <div className={shellStyles.end}>
          <div className={shellStyles.endTitle}>{researchText.end}</div>
          <div className={shellStyles.endSub}>{researchText.endSub}</div>
        </div>
      )}

    </Shell>
  )
}
