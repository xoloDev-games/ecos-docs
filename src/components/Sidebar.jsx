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
import { docs, sections, VERSION } from '../docs.js'

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

export default function Sidebar({ onNavigate }) {
  return (
    <aside className="docs-sidebar">
      <div className="docs-sidebar__top">
        <span className="docs-sidebar__label">Documentación</span>
        <button className="icon-button docs-sidebar__close" type="button" onClick={onNavigate} aria-label="Cerrar menú">
          <X size={18} />
        </button>
      </div>

      <nav className="docs-nav" aria-label="Índice de documentación">
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
                    to={`/docs/${doc.slug}`}
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
        <span className="sidebar-card__eyebrow">Versión documentada</span>
        <strong>Ecos v{VERSION}</strong>
        <p>Unity 6.3 LTS o superior. Modelo opcional no incluido.</p>
      </div>
    </aside>
  )
}
