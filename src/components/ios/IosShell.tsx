import { useState } from 'react'
import { IosFeed } from './IosFeed'
import { IosChatStub } from './IosChatStub'
import { IosSavedScreen } from './IosSavedScreen'
import { IosProfileScreen } from './IosProfileScreen'
import { MobileTabBar } from './MobileTabBar'
import styles from './IosShell.module.css'

export type IosTab = 'feed' | 'chat' | 'saved' | 'profile'

export function IosShell() {
  const [tab, setTab] = useState<IosTab>('feed')

  return (
    <div className={styles.viewport}>
      <div className={styles.deviceFrame}>
        <div className={styles.screen}>
          <div className={styles.notch} aria-hidden />
          <div className={styles.statusBar} aria-hidden>
            <span>9:41</span>
            <span className={styles.statusRight}>
              <span className={styles.signal} />
              <span className={styles.wifi} />
              <span className={styles.battery} />
            </span>
          </div>

          <div className={styles.content}>
            {tab === 'feed' && <IosFeed />}
            {tab === 'chat' && <IosChatStub />}
            {tab === 'saved' && <IosSavedScreen />}
            {tab === 'profile' && <IosProfileScreen />}
          </div>

          <MobileTabBar active={tab} onChange={setTab} />
          <div className={styles.homeIndicator} aria-hidden />
        </div>
      </div>
    </div>
  )
}
