import { ArrowLeft, Compass } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const copy = {
  es: {
    title: 'Esta página se perdió en el camino',
    body: 'El rumor llegó, pero la página no. Vuelve al manual o busca el capítulo que necesitas.',
    manual: 'Volver al manual',
    home: 'Ir al inicio',
  },
  en: {
    title: 'This page got lost along the way',
    body: 'The rumor arrived, but the page did not. Go back to the manual or search for the chapter you need.',
    manual: 'Back to the manual',
    home: 'Go to the home page',
  },
}

export default function NotFound({ lang }) {
  const { pathname } = useLocation()
  const isEnglish = lang ? lang === 'en' : pathname === '/en' || pathname.startsWith('/en/')
  const t = copy[isEnglish ? 'en' : 'es']
  const basePath = isEnglish ? '/en/docs' : '/docs'
  const homePath = isEnglish ? '/en' : '/'

  return (
    <section className="not-found">
      <span className="not-found__icon">
        <Compass size={34} />
      </span>
      <span className="section__kicker">404</span>
      <h1>{t.title}</h1>
      <p>{t.body}</p>
      <div className="not-found__actions">
        <Link className="button button--primary" to={`${basePath}/manual`}>
          <ArrowLeft size={17} />
          {t.manual}
        </Link>
        <Link className="button button--ghost" to={homePath}>
          {t.home}
        </Link>
      </div>
    </section>
  )
}
