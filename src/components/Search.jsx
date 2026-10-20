import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, Search as SearchIcon, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { docs } from '../docs.js'

const suggestions = ['manual', 'instalacion', 'inicio-rapido', 'modelo', 'recetas', 'api']

function stripMarkdown(content) {
  return content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#>*_`|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function snippetFor(content, query) {
  const text = stripMarkdown(content)
  const index = text.toLowerCase().indexOf(query.toLowerCase())
  if (index < 0) return text.slice(0, 150) + (text.length > 150 ? '…' : '')
  const start = Math.max(0, index - 55)
  const end = Math.min(text.length, index + query.length + 105)
  return `${start > 0 ? '…' : ''}${text.slice(start, end)}${end < text.length ? '…' : ''}`
}

export default function Search({ open, onClose }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    setQuery('')
    const timer = window.setTimeout(() => inputRef.current?.focus(), 30)
    return () => window.clearTimeout(timer)
  }, [open])

  useEffect(() => {
    document.body.classList.toggle('is-locked', open)
    return () => document.body.classList.remove('is-locked')
  }, [open])

  const index = useMemo(
    () =>
      docs.map((doc) => ({
        ...doc,
        plain: stripMarkdown(doc.content),
      })),
    [],
  )

  const results = useMemo(() => {
    const clean = query.trim().toLowerCase()
    if (!clean) {
      return suggestions.map((slug) => docs.find((doc) => doc.slug === slug)).filter(Boolean)
    }

    const tokens = clean.split(/\s+/).filter(Boolean)

    return index
      .map((doc) => {
        const title = doc.title.toLowerCase()
        const short = doc.short.toLowerCase()
        const plain = doc.plain.toLowerCase()
        let score = 0

        for (const token of tokens) {
          if (title.includes(token)) score += 18
          if (short.includes(token)) score += 8
          if (plain.includes(token)) score += 2
        }

        return { doc, score }
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map((entry) => entry.doc)
  }, [index, query])

  if (!open) return null

  const go = (slug) => {
    onClose()
    navigate(`/docs/${slug}`)
  }

  const onSubmit = (event) => {
    event.preventDefault()
    if (results[0]) go(results[0].slug)
  }

  return (
    <div className="search-modal" role="dialog" aria-modal="true" aria-label="Buscar en la documentación">
      <button className="search-modal__overlay" type="button" aria-label="Cerrar búsqueda" onClick={onClose} />
      <div className="search-panel">
        <form className="search-panel__input" onSubmit={onSubmit}>
          <SearchIcon size={19} />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Busca un concepto, una clase, un error…"
            aria-label="Buscar en la documentación"
          />
          <button className="icon-button" type="button" onClick={onClose} aria-label="Cerrar búsqueda">
            <X size={18} />
          </button>
        </form>

        <div className="search-panel__meta">
          <span>{query.trim() ? `${results.length} resultados` : 'Páginas recomendadas'}</span>
          <kbd>Esc</kbd>
        </div>

        <div className="search-panel__results">
          {results.length === 0 && (
            <div className="search-empty">
              <strong>Sin resultados para “{query}”.</strong>
              <p>Prueba con “modelo”, “scopes”, “cantidades”, “memoria” o “API”.</p>
            </div>
          )}

          {results.map((doc) => (
            <button className="search-result" type="button" key={doc.slug} onClick={() => go(doc.slug)}>
              <span className="search-result__section">{doc.section}</span>
              <strong>{doc.title}</strong>
              <p>{query.trim() ? snippetFor(doc.content, query.trim()) : doc.short}</p>
              <ArrowRight size={16} />
            </button>
          ))}
        </div>

        <div className="search-panel__footer">
          <span>
            <kbd>Enter</kbd> abrir el primer resultado
          </span>
          <span>
            <kbd>Ctrl</kbd> + <kbd>K</kbd> abrir / cerrar
          </span>
        </div>
      </div>
    </div>
  )
}
