import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { WebPage } from './pages/WebPage'
import { IosPage } from './pages/IosPage'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/web" replace />} />
        <Route path="/web" element={<WebPage />} />
        <Route path="/ios" element={<IosPage />} />
        <Route path="*" element={<Navigate to="/web" replace />} />
      </Routes>
    </HashRouter>
  )
}
