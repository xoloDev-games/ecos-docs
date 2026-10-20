import { Github, Mail } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import Logo from './Logo.jsx'
import { UNITY_MIN, VERSION } from '../docs.js'

const copy = {
  es: {
    tagline:
      'El mismo hecho. Seis versiones. Un motor determinista de rumores para NPCs de Unity, sin servidor y sin hechos inventados.',
    start: 'Empezar',
    install: 'Instalación',
    quick: 'Inicio rápido',
    model: 'Modelo semántico',
    recipes: 'Recetas',
    reference: 'Referencia',
    api: 'API',
    architecture: 'Arquitectura',
    problems: 'Problemas',
    project: 'Proyecto',
    support: 'Soporte',
    license: 'Licencia',
    third: 'Terceros',
    rights: '© 2026 xoloDev. Todos los derechos reservados.',
    note: 'Documentación pública de Ecos. El modelo recomendado no está incluido.',
  },
  en: {
    tagline:
      'The same fact. Six versions. A deterministic rumor engine for Unity NPCs, with no server and no invented facts.',
    start: 'Get started',
    install: 'Installation',
    quick: 'Quick start',
    model: 'Semantic model',
    recipes: 'Recipes',
    reference: 'Reference',
    api: 'API',
    architecture: 'Architecture',
    problems: 'Troubleshooting',
    project: 'Project',
    support: 'Support',
    license: 'License',
    third: 'Third parties',
    rights: '© 2026 xoloDev. All rights reserved.',
    note: 'Public Ecos documentation. The recommended model is not included.',
  },
}

export default function Footer() {
  const { pathname } = useLocation()
  const isEnglish = pathname === '/en' || pathname.startsWith('/en/')
  const lang = isEnglish ? 'en' : 'es'
  const t = copy[lang]
  const basePath = isEnglish ? '/en/docs' : '/docs'

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <Logo to={isEnglish ? '/en' : '/'} />
          <p>{t.tagline}</p>
          <span className="footer-meta">
            v{VERSION} · Unity {UNITY_MIN}
          </span>
        </div>

        <div className="site-footer__columns">
          <div>
            <h3>{t.start}</h3>
            <Link to={`${basePath}/instalacion`}>{t.install}</Link>
            <Link to={`${basePath}/inicio-rapido`}>{t.quick}</Link>
            <Link to={`${basePath}/modelo`}>{t.model}</Link>
            <Link to={`${basePath}/recetas`}>{t.recipes}</Link>
          </div>
          <div>
            <h3>{t.reference}</h3>
            <Link to={`${basePath}/api`}>{t.api}</Link>
            <Link to={`${basePath}/arquitectura`}>{t.architecture}</Link>
            <Link to={`${basePath}/problemas`}>{t.problems}</Link>
            <Link to={`${basePath}/changelog`}>Changelog</Link>
          </div>
          <div>
            <h3>{t.project}</h3>
            <Link to={`${basePath}/soporte`}>{t.support}</Link>
            <Link to={`${basePath}/licencia-asset`}>{t.license}</Link>
            <Link to={`${basePath}/licencias-terceros`}>{t.third}</Link>
            <a href="mailto:xoloDev.games@gmail.com">
              <Mail size={14} />
              Email
            </a>
            <a href="https://github.com/xoloDev-games/ecos-docs" target="_blank" rel="noreferrer">
              <Github size={14} />
              GitHub
            </a>
          </div>
        </div>
      </div>

      <div className="site-footer__bottom">
        <span>{t.rights}</span>
        <span>{t.note}</span>
      </div>
    </footer>
  )
}
