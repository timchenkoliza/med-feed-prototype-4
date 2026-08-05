import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import App from '../../src/app/App'
import { feedKindStorageKey } from '../../src/app/useAppState'
import { cssVariables } from '../../src/config/design-contract'

// Токены контракта — единственный источник значений для CSS.
const tokens = document.createElement('style')
tokens.textContent = `:root {\n  ${cssVariables()}\n}`
document.head.appendChild(tokens)

function RootRedirect() {
  const stored = typeof window === 'undefined' ? null : window.localStorage.getItem(feedKindStorageKey)
  return <Navigate to={stored === 'B' ? '/professional' : '/clinical'} replace />
}

function Root() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/clinical" element={<App initialFeed="A" />} />
        <Route path="/professional" element={<App initialFeed="B" />} />
        {/* Легаси-маршрут старой iOS-композиции — теперь единая адаптивная лента. */}
        <Route path="/ios" element={<Navigate to="/clinical" replace />} />
        <Route path="*" element={<Navigate to="/clinical" replace />} />
      </Routes>
    </HashRouter>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
