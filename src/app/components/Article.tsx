import { Icon } from '../../components/common/Icon'
import { evidenceLabel, sourceKindLabels, specialties, typeLabels } from '../config'
import { eventDate, fullDate } from '../format'
import type { Block, FeedItem } from '../types'

function renderBlock(b: Block, i: number) {
  switch (b.t) {
    case 'p':
      return <p key={i} className="art__p">{b.v}</p>
    case 'h':
      return <h3 key={i} className="art__h">{b.v}</h3>
    case 'ul':
      return <ul key={i} className="art__ul">{b.v.map((li, j) => <li key={j}>{li}</li>)}</ul>
    case 'quote':
      return (
        <blockquote key={i} className="art__quote">
          «{b.v}»{b.by && <span className="art__quoteby">{b.by}</span>}
        </blockquote>
      )
    case 'table':
      return (
        <table key={i} className="art__table">
          <thead><tr>{b.head.map((h, j) => <th key={j}>{h}</th>)}</tr></thead>
          <tbody>{b.rows.map((r, j) => <tr key={j}>{r.map((c, k) => <td key={k}>{c}</td>)}</tr>)}</tbody>
        </table>
      )
  }
}

interface Props {
  item: FeedItem
  registered: boolean
  onRegister: () => void
  onAsk: () => void
  onOpenSource: () => void
}

export function Article({ item, registered, onRegister, onAsk, onOpenSource }: Props) {
  const isVideo = item.media?.kind === 'video'
  const audience = (item.primary ?? []).concat(item.secondary ?? [])
  const audienceLabel = item.general
    ? 'Материал общего профессионального интереса'
    : audience.map(a => specialties.find(s => s.id === a)?.label ?? a).join(', ')
  const evidence = item.feed === 'A' ? evidenceLabel(item.evidence) : null
  const impactTitle = item.event ? 'Почему вам может быть полезно' : 'Что это меняет в практике'

  return (
    <article className="art">
      <div className="art__kicker">
        <span className={`tag${item.type === 'safety_alert' ? ' tag--alert' : ''}`}>{typeLabels[item.type]}</span>
        {item.ad && <span className="card__badge">Реклама</span>}
        {evidence && <span className="ev"><Icon name="award" size={11} strokeWidth={2} />{evidence}</span>}
      </div>

      <h1 className="art__title">{item.title}</h1>
      <p className="art__lead">{item.detail.lead}</p>

      <div className="art__meta">
        <span>{item.source.name}</span>
        <span>· {sourceKindLabels[item.source.kind]}</span>
        <span>· {fullDate(item.date)}</span>
        <span>· {item.readMin} мин чтения</span>
        {item.author && <span>· {item.author}</span>}
      </div>

      {item.media && (
        <>
          <div className="art__cover">
            <img src={item.media.src} alt={item.media.alt} />
            {isVideo && (
              <>
                <span className="card__play"><span className="card__playdot"><Icon name="play" size={28} strokeWidth={1.4} /></span></span>
                {item.media.duration && <span className="card__dur">{item.media.duration}</span>}
              </>
            )}
          </div>
          <div className="art__figcap">{item.media.alt}{item.media.credit ? ` · ${item.media.credit}` : ''}</div>
        </>
      )}

      <div className="art__box">
        <div className="art__label">Кратко</div>
        <p className="art__p">{item.summary}</p>
      </div>

      {item.event && (
        <div className="art__box">
          <div className="art__label">Условия участия</div>
          <div className="eventpanel" style={{ marginTop: 8 }}>
            <div className="eventpanel__row"><Icon name="calendar" size={17} />{eventDate(item.event.startsAt, item.event.endsAt)}</div>
            <div className="eventpanel__row"><Icon name="pin" size={17} />{item.event.place}{item.event.online && item.event.place !== 'Онлайн' ? ' · есть трансляция' : ''}</div>
            <div className="eventpanel__row"><Icon name="wallet" size={17} />{item.event.price}</div>
            {item.event.nmo != null && <div className="eventpanel__row"><Icon name="award" size={17} /><span className="nmo">НМО · {item.event.nmo} ЗЕТ</span></div>}
            {item.event.deadline && <div className="eventpanel__row"><Icon name="clock" size={17} />Регистрация до {fullDate(item.event.deadline)}</div>}
            {item.event.organizer && <div className="eventpanel__row"><Icon name="user" size={17} />Организатор: {item.event.organizer}</div>}
          </div>
        </div>
      )}

      {item.video && (
        <>
          <h3 className="art__h">Ключевые таймкоды</h3>
          <div className="art__timecodes">
            {item.video.timecodes.map(tc => (
              <button key={tc.at} type="button" className="art__tc">
                <b>{tc.at}</b>
                <span>{tc.label}</span>
              </button>
            ))}
          </div>
          <div className="art__box">
            <div className="art__label">О чём запись</div>
            <p className="art__p">{item.video.transcript}</p>
          </div>
        </>
      )}

      {item.detail.blocks.map(renderBlock)}

      {item.event?.program && (
        <>
          <h3 className="art__h">Программа</h3>
          <ul className="art__ul">{item.event.program.map((p, i) => <li key={i}>{p}</li>)}</ul>
        </>
      )}

      {item.event?.speakers && item.event.speakers.length > 0 && (
        <>
          <h3 className="art__h">Спикеры</h3>
          <div className="art__speakers">
            {item.event.speakers.map(s => (
              <div key={s.name} className="art__speaker">
                <b>{s.name}</b>
                <span>{s.role}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {item.evidenceNote && (
        <div className="art__box">
          <div className="art__label">Доказательная база</div>
          <p className="art__p">{evidence ? `${evidence}. ` : ''}{item.evidenceNote}</p>
        </div>
      )}

      {item.limitations && (
        <div className="art__box art__box--limit">
          <div className="art__label">Ограничения</div>
          <p className="art__p">{item.limitations}</p>
        </div>
      )}

      <div className="art__box art__box--impact">
        <div className="art__label">{impactTitle}</div>
        <p className="art__p">{item.why}</p>
      </div>

      {item.primarySources && item.primarySources.length > 0 && (
        <>
          <h3 className="art__h">Первоисточники</h3>
          <div className="art__sources">
            {item.primarySources.map((s, i) => (
              <button key={i} type="button" className="art__source" onClick={onOpenSource}>
                {s.label}
                <Icon name="external" size={14} />
              </button>
            ))}
          </div>
        </>
      )}

      <div className="art__box">
        <div className="art__label">Кому адресован материал</div>
        <p className="art__p">{audienceLabel}</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 24, flexWrap: 'wrap' }}>
        <button type="button" className="btn btn--ghost btn--lg" onClick={onAsk}>
          <Icon name="sparkle" size={16} />
          Спросить AI по материалу
        </button>
        {item.event && (
          <button type="button" className="btn btn--primary btn--lg" onClick={onRegister} disabled={registered}>
            {registered ? (<><Icon name="check" size={16} strokeWidth={2} />Вы зарегистрированы</>) : 'Зарегистрироваться'}
          </button>
        )}
      </div>
    </article>
  )
}
