import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '../../src/app/App'
import { cssVariables } from '../../src/config/design-contract'

// Токены контракта — единственный источник значений для CSS.
const tokens = document.createElement('style')
tokens.textContent = `:root {\n  ${cssVariables()}\n}`
document.head.appendChild(tokens)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
