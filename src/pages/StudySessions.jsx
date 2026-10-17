import SessionCard from '../components/SessionCard'
import SessionFilters from '../components/SessionFilters'
import EmptyState from '../components/EmptyState'
import PageBanner from '../components/PageBanner'
import { BooksScene } from '../components/Scenes'
import { filterSessions, courseOptions } from '../sessions'

export default function StudySessions({
  currentUser,
  sessions,
  courses = [],
  tab = 'all',
  onTab,
  selectedStyles,
  professorQuery,
  courseFilter,
  onToggleStyle,
  onProfessorQuery,
  onCourseFilter,
  onClearFilters,
  onJoin,
  onLeave,
  onEnd,
  onOpen,
  onWaitlist,
  onLeaveWaitlist,
  conflictsFor,
  hideConflicts = false,
  onCreate,
}) {
  const matching = filterSessions(sessions, selectedStyles, professorQuery, courseFilter)
  // Settings can hide sessions that clash with ones you're already in.
  const isHidden = (session) =>
    hideConflicts &&
    conflictsFor &&
    !session.attendees.includes(currentUser) &&
    conflictsFor(session).length > 0
  const filtered = matching.filter((session) => !isHidden(session))
  const hiddenCount = matching.length - filtered.length
  const byTime = (list) => [...list].sort((a, b) => new Date(a.start) - new Date(b.start))
  const hosting = byTime(sessions.filter((session) => session.hostName === currentUser))
  const joined = byTime(
    sessions.filter(
      (session) => session.attendees.includes(currentUser) && session.hostName !== currentUser,
    ),
  )
  const waitlisted = byTime(sessions.filter((session) => (session.waitlist || []).includes(currentUser)))
  const mineCount = hosting.length + joined.length + waitlisted.length
  // On All Sessions, sessions you host are pinned to the top.
  const filteredHosting = filtered.filter((session) => session.hostName === currentUser)
  const filteredOthers = filtered.filter((session) => session.hostName !== currentUser)

  const card = (session) => (
    <SessionCard
      key={session.id}
      session={session}
      currentUser={currentUser}
      onJoin={onJoin}
      onLeave={onLeave}
      onEnd={onEnd}
      onOpen={onOpen}
      onWaitlist={onWaitlist}
      onLeaveWaitlist={onLeaveWaitlist}
      conflicts={conflictsFor ? conflictsFor(session) : []}
    />
  )

  return (
    <main className="dashboard">
      <PageBanner
        eyebrow="Study sessions"
        title="Study Sessions"
        subtitle="Join an open group or host your own."
        stats={[
          { value: sessions.length, label: 'Open Sessions' },
          { value: joined.length, label: 'Joined' },
          { value: hosting.length, label: 'Hosting' },
        ]}
        actions={
          <button type="button" className="primary" onClick={onCreate}>
            + Create Session
          </button>
        }
        art={<BooksScene />}
      />

      <div className="tabs" role="tablist" aria-label="Session views">
        <button
          type="button"
          role="tab"
          id="tab-all"
          aria-selected={tab === 'all'}
          aria-controls="panel-sessions"
          className={`tab${tab === 'all' ? ' active' : ''}`}
          onClick={() => onTab('all')}
        >
          All Sessions <span className="tab-count">{sessions.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          id="tab-mine"
          aria-selected={tab === 'mine'}
          aria-controls="panel-sessions"
          className={`tab${tab === 'mine' ? ' active' : ''}`}
          onClick={() => onTab('mine')}
        >
          My Sessions <span className="tab-count">{mineCount}</span>
        </button>
      </div>

      <div id="panel-sessions" role="tabpanel" aria-labelledby={tab === 'all' ? 'tab-all' : 'tab-mine'}>
        {tab === 'all' ? (
          <>
            <SessionFilters
              selectedStyles={selectedStyles}
              professorQuery={professorQuery}
              courseFilter={courseFilter}
              courseOptions={courseOptions(sessions, courses)}
              onToggleStyle={onToggleStyle}
              onProfessorQuery={onProfessorQuery}
              onCourseFilter={onCourseFilter}
              onClear={onClearFilters}
            />
            {hiddenCount > 0 ? (
              <p className="hidden-note" role="status">
                {hiddenCount} {hiddenCount === 1 ? 'session overlaps' : 'sessions overlap'} with your schedule and{' '}
                {hiddenCount === 1 ? 'is' : 'are'} hidden. You can show {hiddenCount === 1 ? 'it' : 'them'} again in Settings.
              </p>
            ) : null}
            {filtered.length === 0 ? (
              <EmptyState
                title="No sessions match those filters."
                hint="Even our anteater can't sniff one out. Try clearing a filter or create your own."
              />
            ) : (
              <div className="session-list">
                {filteredHosting.length > 0 ? (
                  <>
                    <p className="list-label hosting-label">
                      <span aria-hidden="true">★</span> You're Hosting
                      <span className="tab-count">{filteredHosting.length}</span>
                    </p>
                    {filteredHosting.map(card)}
                    {filteredOthers.length > 0 ? (
                      <p className="list-label">
                        Other Sessions <span className="tab-count">{filteredOthers.length}</span>
                      </p>
                    ) : null}
                  </>
                ) : null}
                {filteredOthers.map(card)}
              </div>
            )}
          </>
        ) : (
          <div className="my-sessions">
            <section className="my-group">
              <div className="section-head">
                <h2>
                  Hosting <span className="tab-count">{hosting.length}</span>
                </h2>
              </div>
              {hosting.length === 0 ? (
                <div className="my-empty">
                  <EmptyState
                    compact
                    title="You're not hosting any sessions."
                    hint="Pick a time and place and other Anteaters can join you."
                  />
                  <button type="button" className="primary" onClick={onCreate}>
                    + Create Session
                  </button>
                </div>
              ) : (
                <div className="session-list">{hosting.map(card)}</div>
              )}
            </section>

            <section className="my-group">
              <div className="section-head">
                <h2>
                  Joined <span className="tab-count">{joined.length}</span>
                </h2>
              </div>
              {joined.length === 0 ? (
                <div className="my-empty">
                  <EmptyState
                    compact
                    title="You haven't joined any sessions."
                    hint="Browse open groups and hit Join on one that fits."
                  />
                  <button type="button" className="ghost" onClick={() => onTab('all')}>
                    Browse Sessions
                  </button>
                </div>
              ) : (
                <div className="session-list">{joined.map(card)}</div>
              )}
            </section>

            {waitlisted.length > 0 ? (
              <section className="my-group">
                <div className="section-head">
                  <h2>
                    Waitlisted <span className="tab-count">{waitlisted.length}</span>
                  </h2>
                </div>
                <div className="session-list">{waitlisted.map(card)}</div>
              </section>
            ) : null}
          </div>
        )}
      </div>
    </main>
  )
}
