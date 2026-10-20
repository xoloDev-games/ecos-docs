import { Link } from 'react-router-dom'

export default function Logo({ compact = false }) {
  const base = import.meta.env.BASE_URL

  return (
    <Link to="/" className={`brand${compact ? ' brand--compact' : ''}`} aria-label="Ecos, inicio">
      <span className="brand__mark" aria-hidden="true">
        <img src={`${base}brand/ecos-icon.svg`} alt="" />
      </span>
      {!compact && (
        <span className="brand__copy">
          <strong>ECOS</strong>
          <small>Rumor engine</small>
        </span>
      )}
    </Link>
  )
}
