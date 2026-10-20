import {
  BookOpen,
  BrainCircuit,
  ChefHat,
  Code2,
  Download,
  Ear,
  FileText,
  GitBranch,
  History,
  Layers,
  LifeBuoy,
  Lightbulb,
  Library,
  Megaphone,
  Network,
  Package,
  Rocket,
  Scale,
  SlidersHorizontal,
  TrendingUp,
  Users,
  Wrench,
  X,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { getDocs, getSections, VERSION } from '../docs.js'

const iconMap = {
  BookOpen,
  Download,
  Rocket,
  Lightbulb,
  SlidersHorizontal,
  Library,
  TrendingUp,
  Megaphone,
  Ear,
  Users,
  BrainCircuit,
  ChefHat,
  Code2,
  Network,
  GitBranch,
  Wrench,
  Package,
  History,
  LifeBuoy,
  Scale,
  FileText,
  Layers,
}

const copy = {
  es: {
    docs: 'Documentación',
    close: 'Cerrar menú',
    nav: 'Índice de documentación',
    version: 'Versión documentada',
    body: 'Unity 6.3 LTS o superior. Modelo opcional no incluido.',
  },
  en: {
    docs: 'Documentation',
    close: 'Close menu',
    nav: 'Documentation index',
    version: 'Documented version',
    body: 'Unity 6.3 LTS or newer. Optional model not included.',
  },
}

export default function Sidebar({ lang = 'es', onNavigate }) {
  const docs = getDocs(lang)
  const sections = getSections(lang)
  const t = copy[lang] ?? copy.es
  const basePath = lang === 'en' ? '/en/docs' : '/docs'

  return (
    <aside className="docs-sidebar">
      <div className="docs-sidebar__top">
        <span className="docs-sidebar__label">{t.docs}</span>
        <button className="icon-button docs-sidebar__close" type="button" onClick={onNavigate} aria-label={t.close}>
          <X size={18} />
        </button>
      </div>

      <nav className="docs-nav" aria-label={t.nav}>
        {sections.map((section) => (
          <div className="docs-nav__group" key={section}>
            <span className="docs-nav__section">{section}</span>
            {docs
              .filter((doc) => doc.section === section)
              .map((doc) => {
                const Icon = iconMap[doc.icon] ?? BookOpen
                return (
                  <NavLink
                    key={doc.slug}
                    to={`${basePath}/${doc.slug}`}
                    className={({ isActive }) => `docs-nav__link${isActive ? ' is-active' : ''}`}
                    onClick={onNavigate}
                  >
                    <Icon size={15} />
                    <span>{doc.title}</span>
                  </NavLink>
                )
              })}
          </div>
        ))}
      </nav>

      <div className="sidebar-card">
        <span className="sidebar-card__eyebrow">{t.version}</span>
        <strong>Ecos v{VERSION}</strong>
        <p>{t.body}</p>
      </div>
    </aside>
  )
}
