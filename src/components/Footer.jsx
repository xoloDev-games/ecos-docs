import { Github, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import Logo from './Logo.jsx'
import { UNITY_MIN, VERSION } from '../docs.js'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <Logo />
          <p>
            El mismo hecho. Seis versiones. Un motor determinista de rumores para NPCs de
            Unity, sin servidor y sin hechos inventados.
          </p>
          <span className="footer-meta">
            v{VERSION} · Unity {UNITY_MIN}
          </span>
        </div>

        <div className="site-footer__columns">
          <div>
            <h3>Empezar</h3>
            <Link to="/docs/instalacion">Instalación</Link>
            <Link to="/docs/inicio-rapido">Inicio rápido</Link>
            <Link to="/docs/modelo">Modelo semántico</Link>
            <Link to="/docs/recetas">Recetas</Link>
          </div>
          <div>
            <h3>Referencia</h3>
            <Link to="/docs/api">API</Link>
            <Link to="/docs/arquitectura">Arquitectura</Link>
            <Link to="/docs/problemas">Problemas</Link>
            <Link to="/docs/changelog">Changelog</Link>
          </div>
          <div>
            <h3>Proyecto</h3>
            <Link to="/docs/soporte">Soporte</Link>
            <Link to="/docs/licencia-asset">Licencia</Link>
            <Link to="/docs/licencias-terceros">Terceros</Link>
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
        <span>© 2026 xoloDev. Todos los derechos reservados.</span>
        <span>Documentación pública de Ecos. El modelo recomendado no está incluido.</span>
      </div>
    </footer>
  )
}
