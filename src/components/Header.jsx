import { BookOpen, Github, Moon, Search, Sun } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import Logo from './Logo.jsx'
import { VERSION } from '../docs.js'

export default function Header({ theme, onToggleTheme, onOpenSearch }) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Logo />

        <nav className="site-nav" aria-label="Navegación principal">
          <NavLink to="/docs/manual" className={({ isActive }) => (isActive ? 'is-active' : '')}>
            <BookOpen size={16} />
            Documentación
          </NavLink>
          <NavLink to="/docs/modelo" className={({ isActive }) => (isActive ? 'is-active' : '')}>
            Modelo
          </NavLink>
          <NavLink to="/docs/soporte" className={({ isActive }) => (isActive ? 'is-active' : '')}>
            Soporte
          </NavLink>
        </nav>

        <div className="site-header__actions">
          <span className="version-pill">v{VERSION}</span>

          <button className="search-trigger" type="button" onClick={onOpenSearch}>
            <Search size={16} />
            <span>Buscar</span>
            <kbd>Ctrl K</kbd>
          </button>

          <a
            className="icon-button"
            href="https://github.com/xoloDev-games/ecos-docs"
            target="_blank"
            rel="noreferrer"
            aria-label="Repositorio de documentación en GitHub"
          >
            <Github size={18} />
          </a>

          <button
            className="icon-button"
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>

      <Link className="mobile-docs-link" to="/docs/manual">
        <BookOpen size={16} />
        Abrir documentación
      </Link>
    </header>
  )
}
