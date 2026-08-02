import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ResearchFeed } from '../../src/research/ResearchFeed'
import '../../src/styles/global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ResearchFeed variant="B" />
  </StrictMode>,
)
