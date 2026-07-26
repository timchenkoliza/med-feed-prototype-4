import { useState } from 'react'
import { Icon } from '../common/Icon'
import userData from '../../data/user.json'
import type { UserProfile } from '../../types'
import styles from './Sidebar.module.css'

type SidebarSection = 'chat' | 'feed' | 'saved'

interface Props {
  active: SidebarSection
  onNavigate: (s: SidebarSection) => void
}

const recentChats = ['Рецепт звонаря во Всеволожской больнице', 'что такое дистимия и подозрение на']

const user = userData as UserProfile

export function Sidebar({ active, onNavigate }: Props) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`} aria-label="Навигация">
      <div className={styles.top}>
        <div className={styles.logo}>
          <span className={styles.logoText}>Яндекс</span>
          <span className={styles.logoOrb} aria-hidden />
          <span className={styles.logoText}>Мед</span>
          <sup className={styles.beta}>β</sup>
        </div>
        <button
          type="button"
          className={styles.collapseBtn}
          onClick={() => setCollapsed(v => !v)}
          aria-label={collapsed ? 'Развернуть сайдбар' : 'Свернуть сайдбар'}
        >
          <Icon name="chevron-left" size={18} />
        </button>
      </div>

      <button type="button" className={styles.newChat} onClick={() => onNavigate('chat')}>
        <Icon name="sparkle" size={18} />
        <span>Новый чат</span>
      </button>

      <nav className={styles.nav} aria-label="Основные разделы">
        <NavRow
          active={active === 'chat'}
          onClick={() => onNavigate('chat')}
          icon="chat"
          label="Чат с AI"
        />
        <NavRow
          active={active === 'feed'}
          onClick={() => onNavigate('feed')}
          icon="feed"
          label="Лента"
        />
        <NavRow
          active={active === 'saved'}
          onClick={() => onNavigate('saved')}
          icon="saved"
          label="Сохранённое"
        />
      </nav>

      <div className={styles.recent}>
        <div className={styles.recentTitle}>Последние 7 дней</div>
        <ul className={styles.chatList}>
          {recentChats.map((c, i) => (
            <li key={i}>
              <button type="button" className={styles.chatItem} onClick={() => onNavigate('chat')}>
                {c}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.bottom}>
        <button type="button" className={styles.usageCard}>
          <div className={styles.usageHeader}>
            <span>Использование</span>
            <Icon name="chevron-right" size={16} />
          </div>
          <div className={styles.usageBody}>
            <div>Не осталось запросов на сегодня</div>
            <div>Использовано 30/200 запросов за месяц</div>
          </div>
        </button>

        <div className={styles.userRow}>
          <div className={styles.avatar} aria-hidden>
            {user.avatarInitials}
          </div>
          <div className={styles.userLinks}>
            <a href="#" onClick={e => e.preventDefault()}>Пользовательское соглашение</a>
            <a href="#" onClick={e => e.preventDefault()}>Политика конфиденциальности</a>
          </div>
        </div>
      </div>
    </aside>
  )
}

function NavRow({
  icon,
  label,
  active,
  onClick,
}: {
  icon: 'chat' | 'feed' | 'saved'
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={`${styles.navRow} ${active ? styles.navRowActive : ''}`}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
    >
      <Icon name={icon} size={18} />
      <span>{label}</span>
    </button>
  )
}
