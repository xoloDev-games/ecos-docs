import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  Menu,
  Pencil,
  Search,
} from 'lucide-react'
import { getAdjacent, getDoc, VERSION } from '../docs.js'
import Markdown from './Markdown.jsx'
import Sidebar from './Sidebar.jsx'
import Toc from './Toc.jsx'
import NotFound from './NotFound.jsx'

function readingTime(content) {
  const words = content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(1, Math.round(words / 220))
}

export default function DocsPage({ onOpenSearch }) {
  const { slug } = useParams()
  const doc = getDoc(slug)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    setSidebarOpen(false)
  }, [slug])

  useEffect(() => {
    if (doc) {
      document.title = `${doc.title} — Ecos`
    }
    return () => {
      document.title = 'Ecos — Documentación'
    }
  }, [doc])

  const minutes = useMemo(() => (doc ? readingTime(doc.content) : 1), [doc])

  if (!doc) return <NotFound />

  const { previous, next } = getAdjacent(doc.slug)
  const editUrl = `https://github.com/xoloDev-games/ecos-docs/edit/main/src/content/docs/${doc.file}`

  return (
    <div className="docs-shell">
      <div className={`docs-sidebar-wrap${sidebarOpen ? ' is-open' : ''}`}>
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      {sidebarOpen && (
        <button
          className="sidebar-overlay"
          type="button"
          aria-label="Cerrar índice"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="docs-main">
        <div className="docs-mobile-bar">
          <button className="button button--tiny" type="button" onClick={() => setSidebarOpen(true)}>
            <Menu size={16} />
            Índice
          </button>
          <button className="button button--tiny" type="button" onClick={onOpenSearch}>
            <Search size={16} />
            Buscar
          </button>
        </div>

        <article className="docs-article">
          <div className="docs-breadcrumb">
            <Link to="/docs/manual">Documentación</Link>
            <span>/</span>
            <span>{doc.section}</span>
          </div>

          <header className="docs-header">
            <span className="docs-header__kicker">{doc.section}</span>
            <h1>{doc.title}</h1>
            <p>{doc.description || doc.short}</p>
            <div className="docs-meta">
              <span>v{VERSION}</span>
              <span className="docs-meta__dot" />
              <span>
                <Clock3 size={14} />
                {minutes} min de lectura
              </span>
              <span className="docs-meta__dot" />
              <a href={editUrl} target="_blank" rel="noreferrer">
                <Pencil size={14} />
                Editar esta página
              </a>
            </div>
          </header>

          <Markdown content={doc.content} />

          <nav className="docs-pager" aria-label="Páginas anterior y siguiente">
            {previous ? (
              <Link className="docs-pager__card docs-pager__card--prev" to={`/docs/${previous.slug}`}>
                <span>
                  <ArrowLeft size={16} />
                  Anterior
                </span>
                <strong>{previous.title}</strong>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link className="docs-pager__card docs-pager__card--next" to={`/docs/${next.slug}`}>
                <span>
                  Siguiente
                  <ArrowRight size={16} />
                </span>
                <strong>{next.title}</strong>
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </article>

        <Toc content={doc.content} />
      </div>
    </div>
  )
}
