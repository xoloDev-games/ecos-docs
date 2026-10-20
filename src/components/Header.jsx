import { BookOpen, Github, Moon, Search, Sun } from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import Logo from './Logo.jsx'
import { VERSION } from '../docs.js'

const copy = {
  es: {
    docs: 'Documentación',
    model: 'Modelo',
    support: 'Soporte',
    search: 'Buscar',
    nav: 'Navegación principal',
    github: 'Repositorio de documentación en GitHub',
    light: 'Cambiar a tema claro',
    dark: 'Cambiar a tema oscuro',
    openDocs: 'Abrir documentación',
    switchTo: 'Switch to English',
  },
  en: {
    docs: 'Documentation',
    model: 'Model',
    support: 'Support',
    search: 'Search',
    nav: 'Main navigation',
    github: 'Documentation repository on GitHub',
    light: 'Switch to light theme',
    dark: 'Switch to dark theme',
    openDocs: 'Open documentation',
    switchTo: 'Cambiar a español',
  },
}

export default function Header({ theme, onToggleTheme, onOpenSearch }) {
  const { pathname } = useLocation()
  const isEnglish = pathname === '/en' || pathname.startsWith('/en/')
  const lang = isEnglish ? 'en' : 'es'
  const t = copy[lang]
  const basePath = isEnglish ? '/en/docs' : '/docs'
  const otherBase = isEnglish ? '/docs' : '/en/docs'

  const match = pathname.match(/\/docs\/([^/]+)/)
  const slug = match?.[1] ?? 'manual'
  const otherPath = `${otherBase}/${slug}`

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Logo to={isEnglish ? '/en' : '/'} />

        <nav className="site-nav" aria-label={t.nav}>
          <NavLink to={`${basePath}/manual`} className={({ isActive }) => (isActive ? 'is-active' : '')}>
            <BookOpen size={16} />
            {t.docs}
          </NavLink>
          <NavLink to={`${basePath}/modelo`} className={({ isActive }) => (isActive ? 'is-active' : '')}>
            {t.model}
          </NavLink>
          <NavLink to={`${basePath}/soporte`} className={({ isActive }) => (isActive ? 'is-active' : '')}>
            {t.support}
          </NavLink>
        </nav>

        <div className="site-header__actions">
          <span className="version-pill">v{VERSION}</span>

          <button className="search-trigger" type="button" onClick={onOpenSearch}>
            <Search size={16} />
            <span>{t.search}</span>
            <kbd>Ctrl K</kbd>
          </button>

          <Link className="lang-toggle" to={otherPath} aria-label={t.switchTo} title={t.switchTo}>
            {isEnglish ? 'ES' : 'EN'}
          </Link>

          <a
            className="icon-button"
            href="https://github.com/xoloDev-games/ecos-docs"
            target="_blank"
            rel="noreferrer"
            aria-label={t.github}
          >
            <Github size={18} />
          </a>

          <button
            className="icon-button"
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? t.light : t.dark}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>

      <Link className="mobile-docs-link" to={`${basePath}/manual`}>
        <BookOpen size={16} />
        {t.openDocs}
      </Link>
    </header>
  )
}
