import { Icon } from '../../components/common/Icon'
import { primaryActionLabel, typeLabels } from '../config'
import { dayMonth, eventDate } from '../format'
import type { FeedItem } from '../types'
import { CardMenu, type MenuActions } from './CardMenu'

interface Props {
  item: FeedItem
  hero?: boolean
  registered: boolean
  onOpen: () => void
  onPrimary: () => void
  menu: MenuActions
}

export function Card({ item, hero, registered, onOpen, onPrimary, menu }: Props) {
  const isVideo = item.media?.kind === 'video'
  const label = primaryActionLabel(item.type, !!item.event)

  const activate = (e: React.MouseEvent | React.KeyboardEvent) => {
    if ((e.target as HTMLElement).closest('button, a')) return
    onOpen()
  }

  return (
    <article
      className={`card${hero ? ' card--hero feed__wide' : ''}`}
      role="button"
      tabIndex={0}
      aria-label={`Открыть материал: ${item.title}`}
      onClick={activate}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          if ((e.target as HTMLElement).closest('button, a')) return
          e.preventDefault()
          onOpen()
        }
      }}
    >
      {item.media && (
        <div className="card__cover">
          <img src={item.media.src} alt={item.media.alt} loading="lazy" />
          {isVideo && (
            <>
              <span className="card__play">
                <span className="card__playdot"><Icon name="play" size={24} strokeWidth={1.5} /></span>
              </span>
              {item.media.duration && <span className="card__dur">{item.media.duration}</span>}
            </>
          )}
        </div>
      )}

      <div className="card__kicker">
        <span className={`tag${item.type === 'safety_alert' ? ' tag--alert' : ''}`}>{typeLabels[item.type]}</span>
        {item.ad && <span className="card__badge">Реклама</span>}
        {item.evidence && (
          <span className="ev"><Icon name="award" size={11} strokeWidth={2} />{item.evidence}</span>
        )}
        <span className="dot">·</span>
        <span className="meta">{dayMonth(item.date)}</span>
        {hero && <><span className="dot">·</span><span className="meta">{item.readMin} мин чтения</span></>}
      </div>

      <h3 className="card__title">{item.title}</h3>
      <p className="card__lead">{item.summary}</p>

      {item.event && (
        <div className="card__eventline">
          <span><Icon name="calendar" size={14} />{eventDate(item.event.startsAt, item.event.endsAt)}</span>
          <span><Icon name="pin" size={14} />{item.event.online && item.event.place === 'Онлайн' ? 'Онлайн' : item.event.place.split(',')[0]}</span>
          <span><Icon name="wallet" size={14} />{item.event.price.split(',')[0]}</span>
          {item.event.nmo != null && <span className="nmo"><Icon name="award" size={14} />НМО {item.event.nmo} ЗЕТ</span>}
        </div>
      )}

      <div className="card__src">
        <b>{item.source.name}</b>
        {item.author && <><span className="dot">·</span><span>{item.author}</span></>}
      </div>

      {item.ad && <p className="card__disclaimer">{item.ad.disclaimer}</p>}

      <div className="card__foot">
        <button
          type="button"
          className={item.event ? 'btn btn--primary' : 'btn btn--ghost'}
          onClick={onPrimary}
          disabled={!!item.event && registered}
        >
          {item.event && registered ? (<><Icon name="check" size={15} strokeWidth={2} />Вы зарегистрированы</>) : label}
        </button>
        <CardMenu {...menu} />
      </div>
    </article>
  )
}
