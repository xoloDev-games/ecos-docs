import { ArrowLeft, Compass } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="not-found">
      <span className="not-found__icon">
        <Compass size={34} />
      </span>
      <span className="section__kicker">404</span>
      <h1>Esta página se perdió en el camino</h1>
      <p>
        El rumor llegó, pero la página no. Vuelve al manual o busca el capítulo que
        necesitas.
      </p>
      <div className="not-found__actions">
        <Link className="button button--primary" to="/docs/manual">
          <ArrowLeft size={17} />
          Volver al manual
        </Link>
        <Link className="button button--ghost" to="/">
          Ir al inicio
        </Link>
      </div>
    </section>
  )
}
