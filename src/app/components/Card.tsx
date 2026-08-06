import type { MouseEvent } from 'react'
import { Icon } from '../../components/common/Icon'
import { evidenceLabel, typeLabels } from '../config'
import { dayMonth, eventDate } from '../format'
import type { FeedItem } from '../types'
import { CardMenu, type MenuActions } from './CardMenu'

interface Props {
  item: FeedItem
  hero?: boolean
  registered: boolean
  isSaved: boolean
  isUseful: boolean
  commentsCount: number
  showShare?: boolean
  actionsId?: string
  onOpen: () => void
  onPrimary: () => void
  onCategory: () => void
  onToggleSave: () => void
  onToggleUseful: () => void
  onOpenComments: () => void
  menu: MenuActions
}

export function Card({
  item, hero, registered, isSaved, isUseful, commentsCount, showShare, actionsId,
  onOpen, onPrimary, onCategory, onToggleSave, onToggleUseful, onOpenComments, menu,
}: Props) {
  const isVideo = item.media?.kind === 'video'
  const isClinical = item.feed === 'A'
  const evidence = isClinical ? evidenceLabel(item.evidence) : null
  const variant = item.media ? 'card--media' : 'card--article'

  const stop = (fn: () => void) => (e: MouseEvent) => { e.stopPropagation(); fn() }

  return (
    <article className={`card ${variant}${hero ? ' card--hero feed__wide' : ''}`} data-feed={item.feed}>
      {item.media && (
        <div className="card__cover">
          <img src={item.media.src} alt={item.media.alt} loading="lazy" />
          {isVideo && (
            <>
              <button type="button" className="card__play" aria-label="Смотреть видео" onClick={stop(onOpen)}>
                <span className="card__playdot"><Icon name="play" size={24} strokeWidth={1.5} /></span>
              </button>
              {item.media.duration && <span className="card__dur">{item.media.duration}</span>}
            </>
          )}
        </div>
      )}

      <div className="card__kicker">
        <button
          type="button"
          className={`tag tag--filter${item.type === 'safety_alert' ? ' tag--alert' : ''}`}
          onClick={onCategory}
          aria-label={`Фильтр по типу «${typeLabels[item.type]}»`}
        >
          {typeLabels[item.type]}
        </button>
        {item.ad && <span className="card__badge">Реклама</span>}
        {evidence && (
          <span className="ev"><Icon name="award" size={11} strokeWidth={2} />{evidence}</span>
        )}
        <span className="dot">·</span>
        <span className="meta">{dayMonth(item.date)}</span>
        {hero && <><span className="dot">·</span><span className="meta">{item.readMin} мин чтения</span></>}
      </div>

      <h3 className="card__title">
        <button type="button" className="card__titlelink" onClick={onOpen}>
          {item.title}
        </button>
      </h3>
      <p className="card__lead">{item.summary}</p>

      {!isClinical && item.author && (
        <div className="card__src card__src--author">
          <Icon name="user" size={13} />
          <span>{item.author}</span>
        </div>
      )}

      {item.event && (
        <div className="card__eventline">
          <span><Icon name="calendar" size={14} />{eventDate(item.event.startsAt, item.event.endsAt)}</span>
          <span><Icon name="pin" size={14} />{item.event.online && item.event.place === 'Онлайн' ? 'Онлайн' : item.event.place.split(',')[0]}</span>
          <span><Icon name="wallet" size={14} />{item.event.price.split(',')[0]}</span>
          {item.event.nmo != null && <span className="nmo"><Icon name="award" size={14} />НМО {item.event.nmo} ЗЕТ</span>}
        </div>
      )}

      {isClinical && item.why && (
        <p className="card__impact"><b>Что это меняет в практике:</b> {item.why}</p>
      )}

      <div className="card__src">
        <b>{item.source.name}</b>
        {isClinical && item.author && <><span className="dot">·</span><span>{item.author}</span></>}
      </div>

      {item.ad && <p className="card__disclaimer">{item.ad.disclaimer}</p>}

      <div className="card__bottom">
        {item.event && (
          <button
            type="button"
            className="btn btn--primary btn--block"
            onClick={onPrimary}
            disabled={registered}
          >
            {registered ? (<><Icon name="check" size={15} strokeWidth={2} />Вы зарегистрированы</>) : 'Зарегистрироваться'}
          </button>
        )}

        <div className="card__actions" id={actionsId}>
          <button
            type="button"
            className="card__action"
            aria-pressed={isUseful}
            aria-label={isUseful ? 'Снять отметку «полезно»' : 'Отметить полезным'}
            onClick={stop(onToggleUseful)}
          >
            <Icon name={isUseful ? 'thumbs-up-filled' : 'thumbs-up'} size={17} strokeWidth={1.6} />
            <span className="card__action__label">Полезно</span>
          </button>
          <button
            type="button"
            className="card__action"
            aria-label="Комментарии"
            onClick={stop(onOpenComments)}
          >
            <Icon name="chat" size={17} strokeWidth={1.6} />
            <span className="card__action__label">{commentsCount}</span>
          </button>
          <button
            type="button"
            className="card__action"
            aria-pressed={isSaved}
            aria-label={isSaved ? 'Убрать из сохранённых' : 'Сохранить'}
            onClick={stop(onToggleSave)}
          >
            <Icon name={isSaved ? 'bookmark-filled' : 'bookmark'} size={17} strokeWidth={1.6} />
            <span className="card__action__label">Сохранить</span>
          </button>
          <span className="grow" />
          {showShare && (
            <button type="button" className="card__action" aria-label="Поделиться" onClick={stop(menu.onShare)}>
              <Icon name="external" size={17} strokeWidth={1.6} />
            </button>
          )}
          <CardMenu {...menu} />
        </div>
      </div>
    </article>
  )
}
