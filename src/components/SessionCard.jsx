import { formatSessionWhen, initials } from '../time'
import { isFull, describeConflicts, waitlistPosition } from '../sessions'

export default function SessionCard({
  session,
  currentUser,
  onJoin,
  onLeave,
  onEnd,
  onOpen,
  onWaitlist,
  onLeaveWaitlist,
  conflicts = [],
  compact = false,
}) {
  const joined = session.attendees.includes(currentUser)
  const hosting = joined && session.hostName === currentUser
  const full = !joined && isFull(session)
  const conflict = !joined && conflicts.length > 0
  const waitPos = joined ? 0 : waitlistPosition(session, currentUser)
  const waiting = session.waitlist?.length || 0
  const label = joined ? 'Joined' : full ? 'Full' : 'Join'
  const tags = session.tags?.length ? session.tags : [session.style]
  const shown = session.attendees.slice(0, 3)

  return (
    <article
      className={`session-card${compact ? ' compact' : ''}${onOpen ? ' clickable' : ''}${conflict ? ' conflict' : ''}`}
      data-style={session.style}
      onClick={onOpen ? () => onOpen(session.id) : undefined}
    >
      <div className="session-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M7 3h2v2h6V3h2v2h2a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2zm12 6H5v10h14z" />
        </svg>
      </div>
      <div className="session-body">
        <h3>
          {onOpen ? (
            <button
              type="button"
              className="card-title-btn"
              aria-haspopup="dialog"
              onClick={(event) => {
                event.stopPropagation()
                onOpen(session.id)
              }}
            >
              {session.course} Study Session
            </button>
          ) : (
            `${session.course} Study Session`
          )}
        </h3>
        <p className="session-meta">
          <span>{formatSessionWhen(session.start, session.end)}</span>
        </p>
        <p className="session-meta">{session.location}</p>
        <p className="session-meta">
          Hosted by {session.hostName}
          {session.professor ? ` · Prof. ${session.professor}` : ''}
        </p>
        {conflict ? (
          <p className="conflict-note">
            <span aria-hidden="true">⚠</span> {describeConflicts(conflicts, formatSessionWhen)}
          </p>
        ) : null}
        <div className="tag-row">
          {tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="session-aside">
        <div className="attendee-stack">
          {shown.map((name) => (
            <span key={name} className="mini-avatar" title={name}>
              {initials(name)}
            </span>
          ))}
          <span className="attendee-count">
            {session.attendees.length}/{session.capacity || session.attendees.length} Joined
            {waiting > 0 ? ` · ${waiting} Waiting` : ''}
          </span>
        </div>
        {onOpen ? <span className="card-hint">View Details →</span> : null}
        <div className="card-actions" onClick={(event) => event.stopPropagation()}>
        {joined ? (
          <div className="joined-actions">
            <button type="button" className="join-btn joined" disabled>
              {hosting ? 'Hosting' : 'Joined'}
            </button>
            {hosting && onEnd ? (
              <button
                type="button"
                className="leave-btn end-btn"
                aria-label={`End ${session.course} study session`}
                onClick={() => onEnd(session.id)}
              >
                End Session
              </button>
            ) : null}
            {!hosting && onLeave ? (
              <button
                type="button"
                className="leave-btn"
                aria-label={`Leave ${session.course} study session`}
                onClick={() => onLeave(session.id)}
              >
                Leave
              </button>
            ) : null}
          </div>
        ) : waitPos > 0 ? (
          <div className="joined-actions">
            <button type="button" className="join-btn waitlisted" disabled>
              Waitlist #{waitPos}
            </button>
            {onLeaveWaitlist ? (
              <button
                type="button"
                className="leave-btn"
                aria-label={`Leave the waitlist for ${session.course} study session`}
                onClick={() => onLeaveWaitlist(session.id)}
              >
                Leave
              </button>
            ) : null}
          </div>
        ) : full && onWaitlist ? (
          <button type="button" className="join-btn waitlist-btn" onClick={() => onWaitlist(session.id)}>
            Join Waitlist
          </button>
        ) : (
          <button type="button" className="join-btn" disabled={full} onClick={() => onJoin(session.id)}>
            {label}
          </button>
        )}
        </div>
      </div>
    </article>
  )
}
