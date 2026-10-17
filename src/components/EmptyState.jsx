import { SearchScene, SleepScene } from './Scenes'

export default function EmptyState({ title, hint, sleeping = false, compact = false }) {
  return (
    <div className={`empty-state${compact ? ' compact' : ''}`} role="status">
      <div className="empty-art">
        {sleeping ? <SleepScene /> : <SearchScene />}
      </div>
      <p className="empty-title">{title}</p>
      {hint ? <p className="empty-hint">{hint}</p> : null}
    </div>
  )
}
