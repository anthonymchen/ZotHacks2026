import { useEffect, useRef } from 'react'
import Avatar from './Avatar'
import { formatSessionWhen } from '../time'
import { isFull, describeConflicts, isHost, isMember, headcount, contactFor } from '../sessions.js'
import { STUDY_BUDDIES } from '../data'

// Look up a little more about an attendee (full name, study style) when we have it.
function personInfo(name) {
  return STUDY_BUDDIES.find((buddy) => buddy.name.split(' ')[0] === name || buddy.name === name)
}

// A side panel with everything about one session: details, who's in it, and actions.
export default function SessionDrawer({
  session,
  currentUser,
  photo,
  conflicts = [],
  onClose,
  onJoin,
  onLeave,
  onEnd,
}) {
  const closeRef = useRef(null)

  useEffect(() => {
    if (!session) return undefined
    closeRef.current?.focus()
    function handleKey(event) {
      // Let an open "are you sure?" popup handle Escape first.
      if (event.key === 'Escape' && !document.querySelector('.dialog')) onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [session, onClose])

  if (!session) return null

  const joined = isMember(session, currentUser)
  const hosting = isHost(session, currentUser)
  const full = !joined && isFull(session)
  const count = headcount(session)
  const capacity = session.capacity || 8
  const spotsLeft = Math.max(capacity - count, 0)
  const fill = Math.min(count / capacity, 1)
  // Host first, then you, then everyone else. The host isn't an attendee,
  // so they're listed here but not counted in the spots.
  const people = [session.hostName, ...session.attendees.filter((name) => name !== session.hostName)].sort((a, b) => {
    const rank = (name) => (name === session.hostName ? 0 : name === currentUser ? 1 : 2)
    return rank(a) - rank(b)
  })

  return (
    <div className="drawer-backdrop" onMouseDown={onClose}>
      <aside
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        data-style={session.style}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="drawer-head">
          <div className="drawer-band" />
          <button type="button" className="drawer-close" ref={closeRef} onClick={onClose} aria-label="Close details">
            ×
          </button>
          <p className="eyebrow">{session.style} session</p>
          <h2 id="drawer-title">{session.course} Study Session</h2>
          <div className="tag-row">
            {(session.tags?.length ? session.tags : [session.style]).map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
            {joined ? <span className="tag shared">{hosting ? "You're Hosting" : "You're In"}</span> : null}
          </div>
        </header>

        <div className="drawer-body">
          <dl className="detail-list">
            <div>
              <dt>When</dt>
              <dd>{formatSessionWhen(session.start, session.end)}</dd>
            </div>
            <div>
              <dt>Where</dt>
              <dd>{session.location}</dd>
            </div>
            <div>
              <dt>Host</dt>
              <dd>{hosting ? `${session.hostName} (you)` : session.hostName}</dd>
            </div>
            <div>
              <dt>Professor</dt>
              <dd>{session.professor ? `Prof. ${session.professor}` : 'Not Specified'}</dd>
            </div>
          </dl>

          {!joined && conflicts.length > 0 ? (
            <div className="conflict-box" role="note">
              <strong>
                <span aria-hidden="true">⚠</span> Time Conflict
              </strong>
              <p>{describeConflicts(conflicts, formatSessionWhen)}. You can still join if you want to.</p>
            </div>
          ) : null}

          <div className="capacity">
            <div className="capacity-top">
              <span>
                <strong>{count}</strong> of {capacity} spots filled
              </span>
              <span className={spotsLeft === 0 ? 'capacity-full' : ''}>
                {spotsLeft === 0 ? 'Full' : `${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left`}
              </span>
            </div>
            <div className="capacity-bar" aria-hidden="true">
              <span style={{ width: `${fill * 100}%` }} />
            </div>
          </div>

          <h3 className="people-title">
            Who's Going <span className="tab-count">{count}</span>
          </h3>
          {!joined ? <p className="people-note">Join to see everyone's phone number.</p> : null}
          <ul className="people-list">
            {people.map((name) => {
              const info = personInfo(name)
              const isYou = name === currentUser
              return (
                <li key={name} className="person">
                  <Avatar name={info?.name || name} photo={isYou ? photo : ''} />
                  <span className="person-text">
                    <span className="person-name">{isYou ? `${name} (you)` : info?.name || name}</span>
                    {joined && contactFor(session, name) ? (
                      <a className="person-phone" href={`tel:${contactFor(session, name).replace(/[^\d+]/g, '')}`}>
                        {contactFor(session, name)}
                      </a>
                    ) : info ? (
                      <span className="person-sub">
                        <span className="style-dot" data-style={info.style} />
                        Prefers {info.style}
                      </span>
                    ) : null}
                  </span>
                  {name === session.hostName ? <span className="person-badge host">Host</span> : null}
                  {isYou && name !== session.hostName ? <span className="person-badge you">You</span> : null}
                </li>
              )
            })}
          </ul>
        </div>

        <footer className="drawer-foot">
          {hosting ? (
            // One wide button: shows "Hosting", turns into "End Session" on hover or focus.
            <button
              type="button"
              className="swap-btn"
              aria-label="Hosting. End Session"
              onClick={() => onEnd(session.id)}
            >
              <span className="swap-default">✓ Hosting</span>
              <span className="swap-hover">End Session</span>
            </button>
          ) : joined ? (
            // One wide button: shows "Joined", turns into "Leave Session" on hover or focus.
            <button
              type="button"
              className="swap-btn"
              aria-label="Joined. Leave Session"
              onClick={() => onLeave(session.id)}
            >
              <span className="swap-default">✓ Joined</span>
              <span className="swap-hover">Leave Session</span>
            </button>
          ) : (
            <button type="button" className="join-btn drawer-join" disabled={full} onClick={() => onJoin(session.id)}>
              {full ? 'Session Is Full' : 'Join This Session'}
            </button>
          )}
        </footer>
      </aside>
    </div>
  )
}
