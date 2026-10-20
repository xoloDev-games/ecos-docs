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

const copy = {
  es: {
    docs: 'Documentación',
    index: 'Índice',
    search: 'Buscar',
    reading: 'min de lectura',
    edit: 'Editar esta página',
    previous: 'Anterior',
    next: 'Siguiente',
    closeIndex: 'Cerrar índice',
    pager: 'Páginas anterior y siguiente',
    title: 'Ecos — Documentación',
  },
  en: {
    docs: 'Documentation',
    index: 'Contents',
    search: 'Search',
    reading: 'min read',
    edit: 'Edit this page',
    previous: 'Previous',
    next: 'Next',
    closeIndex: 'Close contents',
    pager: 'Previous and next pages',
    title: 'Ecos — Documentation',
  },
}

function readingTime(content) {
  const words = content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(1, Math.round(words / 220))
}

export default function DocsPage({ lang = 'es', onOpenSearch }) {
  const { slug } = useParams()
  const doc = getDoc(slug, lang)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const t = copy[lang] ?? copy.es
  const basePath = lang === 'en' ? '/en/docs' : '/docs'

  useEffect(() => {
    setSidebarOpen(false)
  }, [slug, lang])

  useEffect(() => {
    document.documentElement.lang = lang
    if (doc) {
      document.title = `${doc.title} — Ecos`
    }
    return () => {
      document.title = t.title
    }
  }, [doc, lang, t.title])

  const minutes = useMemo(() => (doc ? readingTime(doc.content) : 1), [doc])

  if (!doc) return <NotFound lang={lang} />

  const { previous, next } = getAdjacent(doc.slug, lang)
  const editPath = lang === 'en' ? `en/${doc.file}` : doc.file
  const editUrl = `https://github.com/xoloDev-games/ecos-docs/edit/main/src/content/docs/${editPath}`

  return (
    <div className="docs-shell">
      <div className={`docs-sidebar-wrap${sidebarOpen ? ' is-open' : ''}`}>
        <Sidebar lang={lang} onNavigate={() => setSidebarOpen(false)} />
      </div>

      {sidebarOpen && (
        <button
          className="sidebar-overlay"
          type="button"
          aria-label={t.closeIndex}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="docs-main">
        <div className="docs-mobile-bar">
          <button className="button button--tiny" type="button" onClick={() => setSidebarOpen(true)}>
            <Menu size={16} />
            {t.index}
          </button>
          <button className="button button--tiny" type="button" onClick={onOpenSearch}>
            <Search size={16} />
            {t.search}
          </button>
        </div>

        <article className="docs-article">
          <div className="docs-breadcrumb">
            <Link to={`${basePath}/manual`}>{t.docs}</Link>
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
                {minutes} {t.reading}
              </span>
              <span className="docs-meta__dot" />
              <a href={editUrl} target="_blank" rel="noreferrer">
                <Pencil size={14} />
                {t.edit}
              </a>
            </div>
          </header>

          <Markdown content={doc.content} lang={lang} />

          <nav className="docs-pager" aria-label={t.pager}>
            {previous ? (
              <Link className="docs-pager__card docs-pager__card--prev" to={`${basePath}/${previous.slug}`}>
                <span>
                  <ArrowLeft size={16} />
                  {t.previous}
                </span>
                <strong>{previous.title}</strong>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link className="docs-pager__card docs-pager__card--next" to={`${basePath}/${next.slug}`}>
                <span>
                  {t.next}
                  <ArrowRight size={16} />
                </span>
                <strong>{next.title}</strong>
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </article>

        <Toc content={doc.content} lang={lang} />
      </div>
    </div>
  )
}
