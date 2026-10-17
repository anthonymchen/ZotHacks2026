// Header card used at the top of each page: label, title, subtitle,
// optional live stats and actions, and a small illustration on the right.
export default function PageBanner({ eyebrow, title, subtitle, stats = [], actions = null, art = null }) {
  return (
    <header className={`page-banner${art ? ' has-art' : ''}`}>
      <div className="page-banner-text">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {subtitle ? <p className="page-banner-sub">{subtitle}</p> : null}
        {stats.length > 0 || actions ? (
          <div className="page-banner-row">
            {stats.map((stat) => (
              <span key={stat.label} className="stat-pill">
                <strong>{stat.value}</strong> {stat.label}
              </span>
            ))}
            {actions}
          </div>
        ) : null}
      </div>
      {art ? <div className="page-banner-art">{art}</div> : null}
    </header>
  )
}
