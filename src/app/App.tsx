import { Metrika } from './Metrika';

export function App() {
  return (
    <>
      <Metrika />
      {/* остальной код приложения */}
    </>
  );
}
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/common/Icon'
import { viewportWidth } from '../config/design-contract'
import { useToast } from '../hooks/useToast'
import { Article } from './components/Article'
import { AskAi } from './components/AskAi'
import { Card } from './components/Card'
import { Overlay } from './components/Overlay'
import { Register } from './components/Register'
import { feeds, sections, specialties, typeFilters, typeLabels, ui } from './config'
import { eventDate } from './format'
import type { FeedId, FeedItem, Section } from './types'
import { useAppState } from './useAppState'
import './app.css'

const sectionTitle: Record<Section, string> = {
  feed: '',
  saved: 'Сохранённое',
  events: 'События и обучение',
  profile: 'Профиль',
}

export default function App({ initialFeed }: { initialFeed?: FeedId } = {}) {
  const app = useAppState(initialFeed)
  const { toast, show, dismiss } = useToast()
  const navigate = useNavigate()

  const [detail, setDetail] = useState<FeedItem | null>(null)
  const [ai, setAi] = useState<FeedItem | null>(null)
  const [reg, setReg] = useState<FeedItem | null>(null)
  const [specOpen, setSpecOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const specTriggerRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    navigate(app.feed === 'B' ? '/professional' : '/clinical', { replace: true })
  }, [app.feed, navigate])

  const openSpecSelector = (e: React.MouseEvent<HTMLButtonElement>) => {
    specTriggerRef.current = e.currentTarget
    setSpecOpen(true)
  }
  const selectSpecialty = (id: (typeof specialties)[number]['id']) => {
    app.setSpecialty(id)
    setSpecOpen(false)
    show('Лента пересобрана: обновлены материалы, события и фильтры')
    specTriggerRef.current?.focus()
  }

  const spec = specialties.find(s => s.id === app.specialty)!
  const feedMeta = feeds.find(f => f.id === app.feed)!
  const filters = typeFilters[app.feed]
  const isWide = app.layoutMode === 'wide'
  const hasLeftRail = app.layoutMode === 'wide' || app.layoutMode === 'compact'
  const isCompactUI = !hasLeftRail

  const openSource = (i: FeedItem) => window.open(i.url, '_blank', 'noopener,noreferrer')

  const menuFor = (item: FeedItem) => ({
    saved: app.isSaved(item.id),
    useful: app.isUseful(item.id),
    onSave: () => show(app.toggle('saved', item.id) ? ui.toast.saved : ui.toast.unsaved),
    onUseful: () => show(app.toggle('useful', item.id) ? ui.toast.useful : ui.toast.unuseful),
    onShare: () => {
      try { navigator.clipboard?.writeText(item.url) } catch { /* прототип */ }
      show(ui.toast.shared)
    },
    onHide: () => {
      app.hide(item.id); setDetail(null)
      show(ui.toast.hidden, { label: ui.toast.undo, onClick: () => app.unhide(item.id) })
    },
    onMute: () => {
      app.mute(item.id); setDetail(null)
      show(ui.toast.muted, { label: ui.toast.undo, onClick: () => app.unhide(item.id) })
    },
    onReport: () => { app.report(item.id); show(ui.toast.reported) },
  })

  const openPrimary = (item: FeedItem) => (item.event ? setReg(item) : setDetail(item))

  return (
    <div className={`app${app.showResearchBar ? ' app--research' : ''} lay-${app.layoutMode} vp-${app.viewport}`}>
      <div className="shell">
        {/* ───── Header: один во всех срезах ───── */}
        <header className="hdr">
          <div className="hdr__main">
            <div className="brand">
              <span className="brand__mark" aria-hidden>М</span>
              <span className="brand__name">{ui.product}</span>
            </div>

            <div className="search">
              <span className="search__icon"><Icon name="search" size={17} /></span>
              <input
                className="search__input"
                value={app.query}
                onChange={e => app.setQuery(e.target.value)}
                placeholder={ui.searchPlaceholder}
                aria-label="Поиск по ленте"
              />
              {app.query && (
                <button type="button" className="search__clear" onClick={() => app.setQuery('')} aria-label="Очистить поиск">
                  <Icon name="close" size={16} />
                </button>
              )}
            </div>

            <div className="hdr__actions">
              {isCompactUI && (
                <button type="button" className="pillbtn" onClick={openSpecSelector}>
                  <Icon name="user" size={15} />
                  {app.layoutMode === 'mobile' ? spec.short : spec.label}
                  <Icon name="chevron-down" size={14} />
                </button>
              )}
              {hasLeftRail && (
                <button
                  type="button"
                  className="iconbtn"
                  aria-pressed={app.section === 'saved'}
                  aria-label="Сохранённое"
                  onClick={() => app.setSection(app.section === 'saved' ? 'feed' : 'saved')}
                >
                  <Icon name={app.section === 'saved' ? 'bookmark-filled' : 'bookmark'} size={17} strokeWidth={1.6} />
                </button>
              )}
            </div>
          </div>

          <div className="hdr__second">
            <div className="seg" role="group" aria-label="Тип ленты">
              {feeds.map(f => (
                <button
                  key={f.id}
                  type="button"
                  className="seg__btn"
                  aria-pressed={app.feed === f.id}
                  onClick={() => { app.setFeed(f.id); app.setType('all'); app.setSection('feed') }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {isCompactUI && (
              <button type="button" className="pillbtn" onClick={() => setFiltersOpen(true)}>
                <Icon name="sliders" size={15} />
                {app.type === 'all' ? 'Фильтры' : typeLabels[app.type as keyof typeof typeLabels]}
              </button>
            )}
          </div>
        </header>

        {/* ───── Тело ───── */}
        <div className="body">
          {hasLeftRail && (
            <aside className="rail rail--left">
              <div className="rail__group">
                <div className="rail__title">Специальность</div>
                {specialties.map(s => (
                  <button key={s.id} type="button" className="rail__item" aria-pressed={app.specialty === s.id} onClick={() => app.setSpecialty(s.id)}>
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="rail__group">
                <div className="rail__title">Тип материала</div>
                <button type="button" className="rail__item" aria-pressed={app.type === 'all'} onClick={() => app.setType('all')}>
                  Все<span className="rail__count">{app.counts.feed}</span>
                </button>
                {filters.map(t => (
                  <button key={t} type="button" className="rail__item" aria-pressed={app.type === t} onClick={() => app.setType(t)}>
                    {typeLabels[t]}
                  </button>
                ))}
              </div>

              <div className="rail__group">
                <div className="rail__title">Личное</div>
                <button type="button" className="rail__item" aria-pressed={app.section === 'saved'} onClick={() => app.setSection(app.section === 'saved' ? 'feed' : 'saved')}>
                  Сохранённое<span className="rail__count">{app.counts.saved}</span>
                </button>
                <button type="button" className="rail__item" aria-pressed={app.section === 'events'} onClick={() => app.setSection(app.section === 'events' ? 'feed' : 'events')}>
                  События<span className="rail__count">{app.upcoming.length}</span>
                </button>
              </div>
            </aside>
          )}

          <main>
            <div className="feedhead">
              {/* Тип ленты уже показан вкладками в шапке — здесь заголовок дублировать не нужно. */}
              {app.section !== 'feed' && <h1 className="feedhead__title">{sectionTitle[app.section]}</h1>}
              {app.section === 'feed' && <span className="feedhead__meta">{app.items.length} материалов</span>}
            </div>

            <div className={`feed${app.feed === 'B' && app.section === 'feed' ? ' feed--grid' : ''}`}>
              {!isWide && (
                <div className="inlinerail">
                  <div className="railcard">
                    <div className="railcard__title">Ближайшие события</div>
                    {app.upcoming.map(e => (
                      <button key={e.id} type="button" className="railevent" onClick={() => setDetail(e)}>
                        <span className="railevent__t">{e.title}</span>
                        <span className="railevent__m">
                          {eventDate(e.event!.startsAt, e.event!.endsAt)} · {e.event!.online ? 'онлайн' : e.event!.place.split(',')[0]}
                          {e.event!.nmo != null ? ` · ${e.event!.nmo} ЗЕТ` : ''}
                        </span>
                      </button>
                    ))}
                    {app.upcoming.length === 0 && <div className="railnote">Событий по специальности нет</div>}
                  </div>
                  <div className="railcard">
                    <div className="railcard__title">Как собрана лента</div>
                    <p className="railnote" style={{ margin: 0 }}>
                      {app.feed === 'A'
                        ? 'Клинические рекомендации, рецензируемые журналы и официальные письма. У каждого материала указаны уровень доказательности и ограничения.'
                        : 'События, обучение и индустрия по вашей специальности. Материалы с регистрацией и НМО отмечены отдельно, реклама помечена.'}
                    </p>
                  </div>
                </div>
              )}
              {app.items.map((item, i) => (
                <Card
                  key={item.id}
                  item={item}
                  hero={i === 0 && app.section === 'feed'}
                  registered={app.isRegistered(item.id)}
                  onOpen={() => setDetail(item)}
                  onPrimary={() => openPrimary(item)}
                  onCategory={() => app.setType(item.type)}
                  menu={menuFor(item)}
                />
              ))}

              {app.items.length === 0 && (
                <div className="feed__empty">
                  <b style={{ color: 'var(--c-text)' }}>{ui.emptyTitle}</b>
                  <div style={{ marginTop: 8 }}>{ui.emptyBody}</div>
                </div>
              )}

              {app.items.length > 0 && (
                <div className="feed__end">
                  <b>{ui.endTitle}</b>
                  <span>{ui.endBody}</span>
                </div>
              )}
            </div>
          </main>

          {isWide && (
            <aside className="rail rail--right">
              <div className="railcard">
                <div className="railcard__title">Ближайшие события</div>
                {app.upcoming.map(e => (
                  <button key={e.id} type="button" className="railevent" onClick={() => setDetail(e)}>
                    <span className="railevent__t">{e.title}</span>
                    <span className="railevent__m">
                      {eventDate(e.event!.startsAt, e.event!.endsAt)} · {e.event!.online ? 'онлайн' : e.event!.place.split(',')[0]}
                      {e.event!.nmo != null ? ` · ${e.event!.nmo} ЗЕТ` : ''}
                    </span>
                  </button>
                ))}
                {app.upcoming.length === 0 && <div className="railnote">Событий по специальности нет</div>}
              </div>

              <div className="railcard">
                <div className="railcard__title">Как собрана лента</div>
                <p className="railnote" style={{ margin: 0 }}>
                  {app.feed === 'A'
                    ? 'Клинические рекомендации, рецензируемые журналы и официальные письма. У каждого материала указаны уровень доказательности и ограничения.'
                    : 'События, обучение и индустрия по вашей специальности. Материалы с регистрацией и НМО отмечены отдельно, реклама помечена.'}
                </p>
              </div>
            </aside>
          )}
        </div>

        {/* ───── Нижняя навигация: phone ───── */}
        {app.layoutMode === 'mobile' && (
          <nav className="bottomnav" aria-label="Разделы">
            {sections.map(s => (
              <button
                key={s.id}
                type="button"
                className="bottomnav__item"
                aria-current={app.section === s.id ? 'page' : undefined}
                onClick={e => (s.id === 'profile' ? openSpecSelector(e) : app.setSection(s.id))}
              >
                <Icon name={s.icon} size={20} strokeWidth={1.7} />
                {s.label}
              </button>
            ))}
          </nav>
        )}
      </div>

      {/* ───── Панель исследователя (скрыта в production) ───── */}
      {app.showResearchBar && (
        <div className="research">
          <span className="research__label">Формат экрана</span>
          <div className="research__switch" role="group" aria-label="Формат экрана">
            {(Object.keys(viewportWidth) as Array<keyof typeof viewportWidth>).map(v => (
              <button key={v} type="button" className="research__btn" aria-pressed={app.viewport === v} onClick={() => app.setViewport(v)}>
                {v === 'phone' ? 'Phone' : v === 'tablet' ? 'Tablet' : 'Desktop'}
              </button>
            ))}
          </div>
          <div className="research__right">
            {app.session && <span className="research__label">{app.session}</span>}
            <button
              type="button"
              className="research__reset"
              onClick={() => { app.reset(); setDetail(null); show(ui.toast.reset) }}
            >
              <Icon name="refresh" size={14} />
              <span>Сбросить состояние</span>
            </button>
          </div>
        </div>
      )}

      {/* ───── Оверлеи ───── */}
      {detail && (
        <Overlay
          title={detail.event ? 'Событие' : detail.media?.kind === 'video' ? 'Видео' : 'Материал'}
          onClose={() => setDetail(null)}
          headExtra={
            <>
              <button
                type="button"
                className="iconbtn iconbtn--plain"
                aria-pressed={app.isUseful(detail.id)}
                aria-label="Отметить полезным"
                onClick={() => show(app.toggle('useful', detail.id) ? ui.toast.useful : ui.toast.unuseful)}
              >
                <Icon name={app.isUseful(detail.id) ? 'thumbs-up-filled' : 'thumbs-up'} size={17} strokeWidth={1.6} />
              </button>
              <button
                type="button"
                className="iconbtn iconbtn--plain"
                aria-pressed={app.isSaved(detail.id)}
                aria-label="Сохранить"
                onClick={() => show(app.toggle('saved', detail.id) ? ui.toast.saved : ui.toast.unsaved)}
              >
                <Icon name={app.isSaved(detail.id) ? 'bookmark-filled' : 'bookmark'} size={17} strokeWidth={1.6} />
              </button>
            </>
          }
          footer={
            <>
              <button type="button" className="btn btn--quiet" onClick={() => openSource(detail)}>
                Открыть источник<Icon name="external" size={14} />
              </button>
              <span className="grow" />
              {detail.event ? (
                <button type="button" className="btn btn--primary" onClick={() => setReg(detail)} disabled={app.isRegistered(detail.id)}>
                  {app.isRegistered(detail.id) ? 'Вы зарегистрированы' : 'Зарегистрироваться'}
                </button>
              ) : (
                <button type="button" className="btn btn--ghost" onClick={() => setAi(detail)}>
                  <Icon name="sparkle" size={15} />Спросить AI
                </button>
              )}
            </>
          }
        >
          <Article
            item={detail}
            registered={app.isRegistered(detail.id)}
            onRegister={() => setReg(detail)}
            onAsk={() => setAi(detail)}
            onOpenSource={() => openSource(detail)}
          />
        </Overlay>
      )}

      {ai && <AskAi item={ai} onClose={() => setAi(null)} />}

      {reg && (
        <Register
          item={reg}
          onClose={() => setReg(null)}
          onDone={id => { app.register(id); show(ui.toast.registered) }}
        />
      )}

      {filtersOpen && (
        <Overlay
          title="Фильтры"
          onClose={() => setFiltersOpen(false)}
          sheet
          footer={
            <>
              <button type="button" className="btn btn--quiet" onClick={() => { app.setType('all'); setFiltersOpen(false) }}>Сбросить</button>
              <span className="grow" />
              <button type="button" className="btn btn--primary btn--lg" onClick={() => setFiltersOpen(false)}>Применить</button>
            </>
          }
        >
          <div className="art__label">Тип материала</div>
          <button type="button" className="optionrow" aria-pressed={app.type === 'all'} onClick={() => app.setType('all')}>
            <span>Все</span>{app.type === 'all' && <Icon name="check" size={17} />}
          </button>
          {filters.map(t => (
            <button key={t} type="button" className="optionrow" aria-pressed={app.type === t} onClick={() => app.setType(t)}>
              <span>{typeLabels[t]}</span>{app.type === t && <Icon name="check" size={17} />}
            </button>
          ))}
          <p className="note">Специальность меняется отдельной кнопкой в шапке.</p>
        </Overlay>
      )}

      {specOpen && (
        <Overlay title="Выберите специальность" onClose={() => { setSpecOpen(false); specTriggerRef.current?.focus() }} sheet>
          {specialties.map(s => (
            <button
              key={s.id}
              type="button"
              className="optionrow"
              aria-pressed={app.specialty === s.id}
              onClick={() => selectSpecialty(s.id)}
            >
              <span>{s.label}</span>
              {app.specialty === s.id && <Icon name="check" size={17} />}
            </button>
          ))}
          <p className="note">Лента пересобрана: обновлены материалы, события и фильтры.</p>
        </Overlay>
      )}

      {toast && (
        <div className="toast" role="status" aria-live="polite">
          <span className="grow">{toast.message}</span>
          {toast.action && (
            <button type="button" className="toast__action" onClick={() => { toast.action?.onClick(); dismiss() }}>
              {toast.action.label}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
