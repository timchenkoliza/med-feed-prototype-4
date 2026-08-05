import { Icon } from '../../components/common/Icon'
import { evidenceLabel, typeLabels } from '../config'
import { dayMonth, eventDate } from '../format'
import type { FeedItem } from '../types'
import { CardMenu, type MenuActions } from './CardMenu'

interface Props {
  item: FeedItem
  hero?: boolean
  registered: boolean
  onOpen: () => void
  onPrimary: () => void
  onCategory: () => void
  menu: MenuActions
}

export function Card({ item, hero, registered, onOpen, onPrimary, onCategory, menu }: Props) {
  const isVideo = item.media?.kind === 'video'
  const isClinical = item.feed === 'A'
  const evidence = isClinical ? evidenceLabel(item.evidence) : null

  return (
    <article className={`card${hero ? ' card--hero feed__wide' : ''}`} data-feed={item.feed}>
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

      {/* Единственное действие карточки — открыть материал по клику на карточку/заголовок.
          Отдельная кнопка «Читать» убрана: она дублировала бы этот клик. */}
      <div className="card__foot">
        {item.event && (
          <button
            type="button"
            className="btn btn--primary"
            onClick={onPrimary}
            disabled={registered}
          >
            {registered ? (<><Icon name="check" size={15} strokeWidth={2} />Вы зарегистрированы</>) : 'Зарегистрироваться'}
          </button>
        )}
        <span className="grow" />
        <CardMenu {...menu} />
      </div>
    </article>
  )
}
