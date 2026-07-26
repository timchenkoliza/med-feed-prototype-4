import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { FeedPage } from '../feed/FeedPage'
import { ChatStub } from './ChatStub'
import styles from './WebShell.module.css'

type Section = 'chat' | 'feed' | 'saved'

export function WebShell() {
  const [section, setSection] = useState<Section>('feed')

  return (
    <div className={styles.shell}>
      <Sidebar active={section} onNavigate={setSection} />
      <main className={styles.center}>
        {section === 'chat' && <ChatStub />}
        {section === 'feed' && <FeedPage />}
        {section === 'saved' && (
          <FeedPage showSaved onLeaveSaved={() => setSection('feed')} />
        )}
      </main>
    </div>
  )
}
