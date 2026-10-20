import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Landing from './components/Landing.jsx'
import DocsPage from './components/DocsPage.jsx'
import NotFound from './components/NotFound.jsx'
import Search from './components/Search.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    document.documentElement.lang = pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'es'
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = window.localStorage.getItem('ecos-theme')
    if (saved === 'light' || saved === 'dark') return saved
    return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('ecos-theme', theme)
  }, [theme])

  return {
    theme,
    toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
  }
}

export default function App() {
  const { theme, toggleTheme } = useTheme()
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen(true)
      }
      if (event.key === 'Escape') {
        setSearchOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="app-shell">
      <ScrollToTop />
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenSearch={() => setSearchOpen(true)}
      />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/docs" element={<Navigate to="/docs/manual" replace />} />
          <Route path="/docs/:slug" element={<DocsPage lang="es" onOpenSearch={() => setSearchOpen(true)} />} />
          <Route path="/en" element={<Navigate to="/en/docs/manual" replace />} />
          <Route path="/en/docs" element={<Navigate to="/en/docs/manual" replace />} />
          <Route path="/en/docs/:slug" element={<DocsPage lang="en" onOpenSearch={() => setSearchOpen(true)} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <Search open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
